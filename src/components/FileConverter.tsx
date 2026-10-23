"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import {
  acceptAttr,
  categories,
  COMPRESS,
  findTarget,
  formatCategory,
  normalizeExt,
  outputName,
  targetsFor,
  type Category,
} from "@/lib/formats";
import { MAX_FILE_BYTES } from "@/lib/tools";

export type ConverterText = Pick<
  Dictionary,
  | "chooseFiles" | "dropAnywhere" | "to" | "chooseFormat" | "searchFormat" | "addMore" | "convertAll"
  | "remove" | "statusReady" | "statusWaiting" | "statusConverting" | "statusDone" | "noTargets"
  | "categoryNames" | "compressLabel" | "download" | "errorGeneric" | "errorTooBig" | "errorType"
  | "errorRateLimit"
>;

type Status = "ready" | "waiting" | "converting" | "done" | "error";

type Item = {
  id: number;
  file: File;
  from: string;
  to: string;
  status: Status;
  error?: string;
  url?: string;
  outName?: string;
  outSize?: number;
};

const PARALLEL = 2;
let nextId = 1;

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const formatLabel = (to: string, t: ConverterText) => (to === COMPRESS ? t.compressLabel : to.toUpperCase());

export default function FileConverter({ t, presetTo }: { t: ConverterText; presetTo?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);

  const update = (id: number, patch: Partial<Item>) =>
    setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  function addFiles(list: FileList | File[] | null) {
    if (!list?.length) return;
    const added: Item[] = Array.from(list).map((file) => {
      const from = normalizeExt(file.name);
      const targets = targetsFor(from);
      const to = presetTo && targets.some((x) => x.to === presetTo) ? presetTo : "";
      const tooBig = file.size > MAX_FILE_BYTES;
      return {
        id: nextId++,
        file,
        from,
        to,
        status: tooBig || !targets.length ? "error" : "ready",
        error: tooBig ? t.errorTooBig : !targets.length ? t.noTargets : undefined,
      };
    });
    setItems((cur) => [...cur, ...added]);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Files can be dropped anywhere on the page, like on Convertio.
  useEffect(() => {
    const over = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      setDragging(true);
    };
    const leave = (e: DragEvent) => {
      if (!e.relatedTarget) setDragging(false);
    };
    const drop = (e: DragEvent) => {
      if (!e.dataTransfer?.files.length) return;
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    };
    window.addEventListener("dragover", over);
    window.addEventListener("dragleave", leave);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragover", over);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("drop", drop);
    };
  });

  async function convertOne(item: Item) {
    const target = findTarget(item.from, item.to);
    if (!target) return;
    update(item.id, { status: "converting", error: undefined });
    try {
      let blob: Blob;
      let zipped = false;
      if (target.engine === "browser-image" || target.engine === "browser-pdf") {
        const lib = await import("@/lib/browser-convert");
        blob =
          target.engine === "browser-pdf"
            ? await lib.imagesToPdf([item.file])
            : await lib.convertImage(item.file, item.to as "jpg" | "png" | "webp");
      } else {
        const body = new FormData();
        body.append("to", item.to);
        body.append("file", item.file);
        const res = await fetch("/api/convert", { method: "POST", body });
        if (!res.ok) {
          const code = (await res.json().catch(() => ({}))).error;
          throw new Error(
            code === "too_big" ? t.errorTooBig
            : code === "bad_type" ? t.errorType
            : code === "rate_limit" ? t.errorRateLimit
            : t.errorGeneric,
          );
        }
        zipped = (res.headers.get("content-type") ?? "").includes("zip");
        blob = await res.blob();
      }
      update(item.id, {
        status: "done",
        url: URL.createObjectURL(blob),
        outName: outputName(item.file.name, item.to, zipped),
        outSize: blob.size,
      });
    } catch (e) {
      update(item.id, { status: "error", error: e instanceof Error && e.message ? e.message : t.errorGeneric });
    }
  }

  async function convertAll() {
    const queue = items.filter((it) => it.to && (it.status === "ready" || it.status === "error") && findTarget(it.from, it.to));
    if (!queue.length) return;
    setRunning(true);
    queue.forEach((it) => update(it.id, { status: "waiting", error: undefined }));
    const workers = Array.from({ length: PARALLEL }, async () => {
      for (let it = queue.shift(); it; it = queue.shift()) await convertOne(it);
    });
    await Promise.all(workers);
    setRunning(false);
  }

  function remove(id: number) {
    setItems((list) => {
      const gone = list.find((it) => it.id === id);
      if (gone?.url) URL.revokeObjectURL(gone.url);
      return list.filter((it) => it.id !== id);
    });
  }

  const canConvert = items.some((it) => it.to && (it.status === "ready" || (it.status === "error" && findTarget(it.from, it.to))));

  const picker = (
    <input
      ref={inputRef}
      type="file"
      multiple
      hidden
      accept={acceptAttr}
      onChange={(e) => addFiles(e.target.files)}
    />
  );

  return (
    <div className={`fc${dragging ? " dragging" : ""}`}>
      {picker}
      {items.length === 0 ? (
        <div className="fc-empty">
          <button className="fc-choose" onClick={() => inputRef.current?.click()}>
            <span aria-hidden="true">📁</span> {t.chooseFiles}
          </button>
          <p className="fc-hint">{t.dropAnywhere}</p>
        </div>
      ) : (
        <div className="fc-panel">
          <ul className="fc-list">
            {items.map((it) => (
              <li key={it.id} className={`fc-row ${it.status}`}>
                <div className="fc-file">
                  <span className="fc-ext">{it.from.toUpperCase() || "?"}</span>
                  <span className="fc-name" title={it.file.name}>{it.file.name}</span>
                  <span className="fc-size">{formatSize(it.file.size)}</span>
                </div>
                <div className="fc-target">
                  {it.status === "done" && it.url ? (
                    <a className="fc-download" href={it.url} download={it.outName}>
                      ⬇ {t.download} <small>({formatSize(it.outSize ?? 0)})</small>
                    </a>
                  ) : (
                    <>
                      <span className="fc-to">{t.to}</span>
                      <FormatPicker
                        from={it.from}
                        value={it.to}
                        disabled={running || it.status === "converting" || !targetsFor(it.from).length}
                        t={t}
                        onChange={(to) => update(it.id, { to, status: "ready", error: undefined })}
                      />
                    </>
                  )}
                </div>
                <div className="fc-status">
                  {it.status === "error" ? (
                    <span className="fc-error" role="alert">{it.error}</span>
                  ) : it.status === "converting" || it.status === "waiting" ? (
                    <span className="fc-progress">
                      <span className="fc-spinner" aria-hidden="true" />
                      {it.status === "converting" ? t.statusConverting : t.statusWaiting}
                    </span>
                  ) : it.status === "done" ? (
                    <span className="fc-ok">✓ {t.statusDone}</span>
                  ) : null}
                </div>
                <button
                  className="fc-remove"
                  aria-label={t.remove}
                  title={t.remove}
                  disabled={it.status === "converting"}
                  onClick={() => remove(it.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="fc-actions">
            <button className="fc-add" onClick={() => inputRef.current?.click()} disabled={running}>
              ＋ {t.addMore}
            </button>
            <button className="fc-convert" onClick={convertAll} disabled={!canConvert || running}>
              {running ? t.statusConverting : t.convertAll} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}
      {dragging && <div className="fc-drop-overlay">{t.dropAnywhere.split("·")[0]}</div>}
    </div>
  );
}

function FormatPicker({
  from,
  value,
  disabled,
  t,
  onChange,
}: {
  from: string;
  value: string;
  disabled: boolean;
  t: ConverterText;
  onChange: (to: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const targets = targetsFor(from);
  // The file's own kind of format first: an image most often becomes another image.
  const groups = [formatCategory[from], ...categories.filter((c) => c !== formatCategory[from])]
    .map((cat) => ({
      cat,
      formats: targets
        .map((x) => x.to)
        .filter((to) => (to === COMPRESS ? "document" : formatCategory[to]) === cat),
    }))
    .filter((g) => g.formats.length);
  const [active, setActive] = useState<Category | undefined>(undefined);
  const current = groups.find((g) => g.cat === active) ?? groups[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  // Few choices: show them all at once; many: one category at a time, like Convertio.
  const flat = targets.length <= 6;
  const shown = q
    ? targets.map((x) => x.to).filter((to) => to.includes(q) || formatLabel(to, t).toLowerCase().includes(q))
    : flat
      ? groups.flatMap((g) => g.formats)
      : current?.formats ?? [];

  return (
    <div className="fp" ref={ref}>
      <button
        className={`fp-button${value ? "" : " empty"}`}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value ? formatLabel(value, t) : t.chooseFormat} <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="fp-menu" role="listbox">
          <input
            className="fp-search"
            autoFocus
            placeholder={t.searchFormat}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="fp-body">
            {!q && !flat && groups.length > 1 && (
              <ul className="fp-cats">
                {groups.map((g) => (
                  <li key={g.cat}>
                    <button
                      className={g.cat === current?.cat ? "on" : ""}
                      onClick={() => setActive(g.cat)}
                    >
                      {t.categoryNames[g.cat]} ›
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="fp-grid">
              {shown.map((to) => (
                <button
                  key={to}
                  role="option"
                  aria-selected={to === value}
                  className={to === value ? "on" : ""}
                  onClick={() => {
                    onChange(to);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {formatLabel(to, t)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

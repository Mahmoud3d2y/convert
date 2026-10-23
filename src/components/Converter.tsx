"use client";

import { useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { MAX_FILE_BYTES, type ToolId, type ToolMode } from "@/lib/tools";

type Props = {
  toolId: ToolId;
  mode: ToolMode;
  accept: string[];
  multiple: boolean;
  outputExt: string;
  t: Pick<
    Dictionary,
    | "dropHere" | "orClick" | "maxSize" | "convert" | "converting" | "download" | "again"
    | "errorGeneric" | "errorTooBig" | "errorType" | "errorRateLimit" | "filesSelected"
    | "inBrowser" | "onServer"
  >;
};

type Result = { url: string; name: string; size: number };

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const baseName = (name: string) => name.replace(/\.[^.]+$/, "") || "file";

export default function Converter({ toolId, mode, accept, multiple, outputExt, t }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  function pick(list: FileList | null) {
    if (!list?.length) return;
    const chosen = Array.from(list).slice(0, multiple ? 50 : 1);
    setResult(null);
    if (chosen.some((f) => !accept.includes(f.name.split(".").pop()?.toLowerCase() ?? ""))) {
      setError(t.errorType);
      return;
    }
    if (chosen.reduce((sum, f) => sum + f.size, 0) > MAX_FILE_BYTES) {
      setError(t.errorTooBig);
      return;
    }
    setError(null);
    setFiles(chosen);
  }

  async function convert() {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    try {
      let blob: Blob;
      if (mode === "browser") {
        const lib = await import("@/lib/browser-convert");
        blob =
          toolId === "image-to-pdf"
            ? await lib.imagesToPdf(files)
            : await lib.convertImage(files[0], toolId === "png-to-jpg" ? "jpg" : "png");
      } else {
        const body = new FormData();
        body.append("tool", toolId);
        body.append("file", files[0]);
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
        blob = await res.blob();
      }
      const suffix = toolId === "compress-pdf" ? "-compressed" : "";
      setResult({
        url: URL.createObjectURL(blob),
        name: `${baseName(files[0].name)}${suffix}.${outputExt}`,
        size: blob.size,
      });
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : t.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    setFiles([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (result) {
    return (
      <div className="converter done">
        <p className="result-name">
          ✅ {result.name} <span className="muted">({formatSize(result.size)})</span>
        </p>
        <a className="btn primary" href={result.url} download={result.name}>
          {t.download}
        </a>
        <button className="btn link" onClick={reset}>
          {t.again}
        </button>
      </div>
    );
  }

  return (
    <div className="converter">
      <label
        className={`dropzone${dragging ? " dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple={multiple}
          accept={accept.map((a) => `.${a}`).join(",")}
          onChange={(e) => pick(e.target.files)}
        />
        <strong>{t.dropHere}</strong>
        <span>{t.orClick}</span>
        <span className="muted small">
          {accept.map((a) => a.toUpperCase()).join(", ")} · {t.maxSize}
        </span>
      </label>

      {files.length > 0 && (
        <p className="selected">
          {files.length === 1
            ? `${files[0].name} (${formatSize(files[0].size)})`
            : `${files.length} ${t.filesSelected}`}
        </p>
      )}
      {error && <p className="error" role="alert">{error}</p>}

      <button className="btn primary" disabled={!files.length || busy} onClick={convert}>
        {busy ? t.converting : t.convert}
      </button>
      <p className="muted small">🔒 {mode === "browser" ? t.inBrowser : t.onServer}</p>
    </div>
  );
}

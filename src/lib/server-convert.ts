import { execFile } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const TIMEOUT_MS = 90_000;

// LibreOffice is heavy: only run a couple of conversions at once, queue the rest.
const MAX_PARALLEL = Number(process.env.MAX_PARALLEL_CONVERSIONS ?? 2);
let active = 0;
const waiting: (() => void)[] = [];

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_PARALLEL) await new Promise<void>((r) => waiting.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiting.shift()?.();
  }
}

async function libreoffice(dir: string, input: string, target: string, infilter?: string) {
  const args = [
    "--headless",
    "--norestore",
    // A private profile per job so parallel runs don't lock each other.
    `-env:UserInstallation=file://${path.join(dir, "profile")}`,
    ...(infilter ? [`--infilter=${infilter}`] : []),
    "--convert-to",
    target,
    "--outdir",
    path.join(dir, "out"),
    input,
  ];
  await run(process.env.SOFFICE_PATH ?? "soffice", args, { timeout: TIMEOUT_MS });
  const files = await readdir(path.join(dir, "out"));
  if (!files.length) throw new Error("LibreOffice produced no output");
  return readFile(path.join(dir, "out", files[0]));
}

async function ghostscriptCompress(dir: string, input: string) {
  const output = path.join(dir, "compressed.pdf");
  await run(
    process.env.GS_PATH ?? "gs",
    [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.5",
      "-dPDFSETTINGS=/ebook",
      "-dSAFER",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${output}`,
      input,
    ],
    { timeout: TIMEOUT_MS },
  );
  const compressed = await readFile(output);
  const original = await readFile(input);
  // Some PDFs are already optimal; never hand back a bigger file.
  return compressed.length < original.length ? compressed : original;
}

export type ServerToolId = "pdf-to-word" | "word-to-pdf" | "compress-pdf";

export async function convertOnServer(tool: ServerToolId, data: Buffer, ext: string) {
  return withSlot(async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "convert-"));
    try {
      const input = path.join(dir, `input.${ext}`);
      await writeFile(input, data);
      switch (tool) {
        case "word-to-pdf":
          return await libreoffice(dir, input, "pdf");
        case "pdf-to-word":
          return await libreoffice(dir, input, "docx:MS Word 2007 XML", "writer_pdf_import");
        case "compress-pdf":
          return await ghostscriptCompress(dir, input);
      }
    } finally {
      // Files are never kept after the conversion.
      await rm(dir, { recursive: true, force: true });
    }
  });
}

/** Quick content check so we don't feed random files to LibreOffice. */
export function looksLike(ext: string, data: Buffer) {
  const head = data.subarray(0, 8);
  if (ext === "pdf") return head.subarray(0, 5).toString("latin1") === "%PDF-";
  if (ext === "docx" || ext === "odt") return head[0] === 0x50 && head[1] === 0x4b; // zip
  if (ext === "doc") return head.readUInt32BE(0) === 0xd0cf11e0; // OLE
  if (ext === "rtf") return head.subarray(0, 5).toString("latin1") === "{\\rtf";
  return false;
}

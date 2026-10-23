import { execFile } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { Engine } from "./formats";

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

async function libreoffice(dir: string, input: string, target: string) {
  const args = [
    "--headless",
    "--norestore",
    // A private profile per job so parallel runs don't lock each other.
    `-env:UserInstallation=file://${path.join(dir, "profile")}`,
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

// PDF -> Word runs our pdf2docx-based script (see converter/pdf_to_docx.py): LibreOffice's
// PDF import turns every line into a text box and loses Arabic text.
async function pdfToWord(dir: string, input: string) {
  const output = path.join(dir, "output.docx");
  const script = path.join(process.cwd(), "converter", "pdf_to_docx.py");
  await run(process.env.PYTHON_PATH ?? "python3", [script, input, output], { timeout: TIMEOUT_MS });
  return readFile(output);
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

// PDF pages -> JPG/PNG (zipped when there are several pages) or plain text.
async function pdfRender(dir: string, input: string, to: string) {
  const script = path.join(process.cwd(), "converter", "pdf_render.py");
  const output = path.join(dir, "output");
  const { stdout } = await run(process.env.PYTHON_PATH ?? "python3", [script, input, to, output], {
    timeout: TIMEOUT_MS,
  });
  const file = stdout.trim();
  return { data: await readFile(file), zipped: file.endsWith(".zip") };
}

// LibreOffice output filters for targets whose plain extension isn't enough.
const OFFICE_FILTER: Record<string, string> = {
  txt: "txt:Text (encoded):UTF8",
  csv: "csv:Text - txt - csv (StarCalc):44,34,76",
};

export type ServerResult = { data: Buffer; zipped: boolean };

export async function convertOnServer(engine: Engine, data: Buffer, from: string, to: string): Promise<ServerResult> {
  return withSlot(async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "convert-"));
    try {
      const input = path.join(dir, `input.${from}`);
      await writeFile(input, data);
      switch (engine) {
        case "office":
          return { data: await libreoffice(dir, input, OFFICE_FILTER[to] ?? to), zipped: false };
        case "pdf-to-word":
          return { data: await pdfToWord(dir, input), zipped: false };
        case "pdf-compress":
          return { data: await ghostscriptCompress(dir, input), zipped: false };
        case "pdf-render":
          return await pdfRender(dir, input, to);
        default:
          throw new Error(`Engine ${engine} does not run on the server`);
      }
    } finally {
      // Files are never kept after the conversion.
      await rm(dir, { recursive: true, force: true });
    }
  });
}

const isZip = (h: Buffer) => h[0] === 0x50 && h[1] === 0x4b;
const isOle = (h: Buffer) => h.length >= 4 && h.readUInt32BE(0) === 0xd0cf11e0;
const isText = (data: Buffer) => !data.subarray(0, 4096).includes(0);

/** Quick content check so we don't feed random files to LibreOffice. */
export function looksLike(ext: string, data: Buffer) {
  const head = data.subarray(0, 8);
  switch (ext) {
    case "pdf":
      return head.subarray(0, 5).toString("latin1") === "%PDF-";
    case "docx":
    case "odt":
    case "xlsx":
    case "ods":
    case "pptx":
    case "odp":
      return isZip(head);
    case "doc":
    case "xls":
    case "ppt":
      return isOle(head);
    case "rtf":
      return head.subarray(0, 5).toString("latin1") === "{\\rtf";
    case "txt":
    case "csv":
    case "html":
      return isText(data);
    default:
      return false;
  }
}

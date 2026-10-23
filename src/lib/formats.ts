/**
 * Every format the converter knows, and what each one can be turned into.
 * Shared by the browser (format picker) and the server (/api/convert validation).
 */

export type Category = "image" | "document" | "spreadsheet" | "presentation";

export type Engine =
  | "browser-image" // canvas re-encode, runs in the visitor's browser
  | "browser-pdf" // image -> PDF with pdf-lib, in the browser
  | "office" // LibreOffice on the server
  | "pdf-to-word" // pdf2docx script on the server
  | "pdf-render" // PDF pages -> images / text on the server
  | "pdf-compress"; // Ghostscript on the server

export type Target = { to: string; engine: Engine };

export const categories: Category[] = ["document", "image", "spreadsheet", "presentation"];

export const formatCategory: Record<string, Category> = {
  pdf: "document",
  docx: "document",
  doc: "document",
  odt: "document",
  rtf: "document",
  txt: "document",
  html: "document",
  png: "image",
  jpg: "image",
  webp: "image",
  bmp: "image",
  gif: "image",
  avif: "image",
  xlsx: "spreadsheet",
  xls: "spreadsheet",
  ods: "spreadsheet",
  csv: "spreadsheet",
  pptx: "presentation",
  ppt: "presentation",
  odp: "presentation",
};

/** "compress" is a pseudo-format: same PDF, smaller. */
export const COMPRESS = "compress";

const IMAGE_OUT = ["jpg", "png", "webp"];
const WORD_OUT = ["pdf", "docx", "odt", "rtf", "txt", "html"];
const SHEET_OUT = ["xlsx", "pdf", "ods", "csv", "html"];
const SLIDES_OUT = ["pdf", "pptx", "odp"];

export function normalizeExt(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "jpeg" || ext === "jfif") return "jpg";
  if (ext === "htm") return "html";
  return ext;
}

/** What a file of this format can be converted to, in the order shown in the picker. */
export function targetsFor(from: string): Target[] {
  const office = (list: string[]) =>
    list.filter((to) => to !== from).map((to) => ({ to, engine: "office" as const }));

  switch (formatCategory[from]) {
    case "image":
      return [
        ...IMAGE_OUT.filter((to) => to !== from).map((to) => ({ to, engine: "browser-image" as const })),
        { to: "pdf", engine: "browser-pdf" },
      ];
    case "spreadsheet":
      return office(SHEET_OUT);
    case "presentation":
      return office(SLIDES_OUT);
    case "document":
      if (from === "pdf") {
        return [
          { to: "docx", engine: "pdf-to-word" },
          { to: "jpg", engine: "pdf-render" },
          { to: "png", engine: "pdf-render" },
          { to: "txt", engine: "pdf-render" },
          { to: COMPRESS, engine: "pdf-compress" },
        ];
      }
      return office(WORD_OUT);
    default:
      return [];
  }
}

export function findTarget(from: string, to: string) {
  return targetsFor(from).find((t) => t.to === to);
}

export const isBrowserEngine = (engine: Engine) => engine === "browser-image" || engine === "browser-pdf";

export const acceptAttr = Object.keys(formatCategory)
  .flatMap((ext) => (ext === "jpg" ? [".jpg", ".jpeg"] : ext === "html" ? [".html", ".htm"] : [`.${ext}`]))
  .join(",");

/** Output file name: "report.pdf" -> "report.docx"; PDF pages as images come zipped. */
export function outputName(inputName: string, to: string, zipped = false) {
  const base = inputName.replace(/\.[^.]+$/, "") || "file";
  if (to === COMPRESS) return `${base}-compressed.pdf`;
  return zipped ? `${base}-${to}.zip` : `${base}.${to}`;
}

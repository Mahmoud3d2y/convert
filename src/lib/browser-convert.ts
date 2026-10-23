import { PDFDocument } from "pdf-lib";

async function loadToCanvas(file: File, background?: string) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed"))), type, quality),
  );
}

export async function convertImage(file: File, to: "jpg" | "png") {
  if (to === "jpg") {
    // JPG has no transparency, so paint a white background first.
    const canvas = await loadToCanvas(file, "#ffffff");
    return canvasToBlob(canvas, "image/jpeg", 0.92);
  }
  const canvas = await loadToCanvas(file);
  return canvasToBlob(canvas, "image/png");
}

// A4 in PDF points.
const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 24;

export async function imagesToPdf(files: File[]) {
  const pdf = await PDFDocument.create();
  for (const file of files) {
    const isJpg = /\.(jpe?g)$/i.test(file.name) || file.type === "image/jpeg";
    const isPng = /\.png$/i.test(file.name) || file.type === "image/png";
    let bytes: ArrayBuffer;
    let kind: "jpg" | "png";
    if (isJpg || isPng) {
      bytes = await file.arrayBuffer();
      kind = isJpg ? "jpg" : "png";
    } else {
      // WEBP and others: re-encode to PNG so pdf-lib can embed them.
      const canvas = await loadToCanvas(file);
      bytes = await (await canvasToBlob(canvas, "image/png")).arrayBuffer();
      kind = "png";
    }
    const image = kind === "jpg" ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
    const landscape = image.width > image.height;
    const pageW = landscape ? A4.h : A4.w;
    const pageH = landscape ? A4.w : A4.h;
    const scale = Math.min((pageW - 2 * MARGIN) / image.width, (pageH - 2 * MARGIN) / image.height, 1);
    const w = image.width * scale;
    const h = image.height * scale;
    const page = pdf.addPage([pageW, pageH]);
    page.drawImage(image, { x: (pageW - w) / 2, y: (pageH - h) / 2, width: w, height: h });
  }
  const out = await pdf.save();
  return new Blob([out as BlobPart], { type: "application/pdf" });
}

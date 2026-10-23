import { findTarget, isBrowserEngine, normalizeExt, outputName } from "@/lib/formats";
import { convertOnServer, looksLike } from "@/lib/server-convert";
import { MAX_FILE_BYTES } from "@/lib/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
  rtf: "application/rtf",
  txt: "text/plain; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  html: "text/html; charset=utf-8",
  jpg: "image/jpeg",
  png: "image/png",
  zip: "application/zip",
};

// Simple per-IP limit so one visitor can't hog the server.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = Number(process.env.RATE_LIMIT_PER_10_MIN ?? 30);
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const fail = (status: number, error: string) => Response.json({ error }, { status });

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (rateLimited(ip)) return fail(429, "rate_limit");

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_FILE_BYTES + 1024 * 1024) return fail(413, "too_big");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "bad_request");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return fail(400, "bad_request");
  if (file.size > MAX_FILE_BYTES) return fail(413, "too_big");

  const from = normalizeExt(file.name);
  const to = String(form.get("to") ?? "");
  const target = findTarget(from, to);
  if (!target || isBrowserEngine(target.engine)) return fail(415, "bad_type");

  const data = Buffer.from(await file.arrayBuffer());
  if (!looksLike(from, data)) return fail(415, "bad_type");

  try {
    const result = await convertOnServer(target.engine, data, from, to);
    const name = outputName(file.name, to, result.zipped).replace(/[^\p{L}\p{N}._ -]/gu, "_");
    const ext = result.zipped ? "zip" : to === "compress" ? "pdf" : to;
    return new Response(new Uint8Array(result.data), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error(`[convert] ${from} -> ${to} failed:`, err);
    return fail(500, "failed");
  }
}

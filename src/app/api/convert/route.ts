import { getTool, MAX_FILE_BYTES } from "@/lib/tools";
import { convertOnServer, looksLike, type ServerToolId } from "@/lib/server-convert";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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

  const tool = getTool(String(form.get("tool") ?? ""));
  const file = form.get("file");
  if (!tool || tool.mode !== "server" || !(file instanceof File)) return fail(400, "bad_request");
  if (file.size > MAX_FILE_BYTES) return fail(413, "too_big");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const data = Buffer.from(await file.arrayBuffer());
  if (!tool.accept.includes(ext) || !looksLike(ext, data)) return fail(415, "bad_type");

  try {
    const output = await convertOnServer(tool.id as ServerToolId, data, ext);
    const base = file.name.replace(/\.[^.]+$/, "").replace(/[^\p{L}\p{N}._ -]/gu, "_") || "file";
    const name = tool.id === "compress-pdf" ? `${base}-compressed.pdf` : `${base}.${tool.outputExt}`;
    return new Response(new Uint8Array(output), {
      headers: {
        "Content-Type": MIME[tool.outputExt] ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error(`[convert] ${tool.id} failed:`, err);
    return fail(500, "failed");
  }
}

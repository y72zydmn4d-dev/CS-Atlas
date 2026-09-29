import { fetchLinkPreview } from "@/lib/library/link-preview-server";
import { hasJsonContentType, isSameOriginRequest } from "@/lib/http/request-security";

export const runtime = "nodejs";

const requests = new Map<string, { count: number; resetAt: number }>();
let globalWindow = { count: 0, resetAt: 0 };

async function readSmallJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid-request");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 4_096) { await reader.cancel(); throw new Error("request-too-large"); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf8")) as unknown;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ errorCode: "forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  if (!hasJsonContentType(request)) return Response.json({ errorCode: "invalid-request" }, { status: 415, headers: { "Cache-Control": "no-store" } });
  const now = Date.now();
  if (globalWindow.resetAt <= now) globalWindow = { count: 0, resetAt: now + 60_000 };
  if (globalWindow.count >= 120) return Response.json({ errorCode: "rate-limited" }, { status: 429, headers: { "Cache-Control": "no-store" } });
  globalWindow.count += 1;
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
  const current = requests.get(key);
  if (current && current.resetAt > now && current.count >= 20) return Response.json({ errorCode: "rate-limited" }, { status: 429, headers: { "Cache-Control": "no-store" } });
  requests.set(key, current && current.resetAt > now ? { count: current.count + 1, resetAt: current.resetAt } : { count: 1, resetAt: now + 60_000 });
  if (requests.size > 2_000) for (const [entry, value] of requests) if (value.resetAt <= now) requests.delete(entry);
  let body: unknown;
  try { body = await readSmallJson(request); } catch (error) { const large = error instanceof Error && error.message === "request-too-large"; return Response.json({ errorCode: large ? "request-too-large" : "invalid-request" }, { status: large ? 413 : 400 }); }
  const url = body && typeof body === "object" && "url" in body ? (body as { url: unknown }).url : null;
  if (typeof url !== "string" || url.length > 2_000) return Response.json({ errorCode: "invalid-url" }, { status: 400 });
  try {
    const result = await fetchLinkPreview(url);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error && /^(invalid-url|unsafe-host|unsafe-address|not-html|response-too-large|timeout|too-many-redirects|redirect-loop|http-error)$/.test(error.message) ? error.message : "preview-unavailable";
    return Response.json({ errorCode: code }, { status: code === "invalid-url" || code.startsWith("unsafe-") ? 400 : 422, headers: { "Cache-Control": "no-store" } });
  }
}

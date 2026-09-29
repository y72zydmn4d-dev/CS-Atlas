import { retrieveAtlasSources } from "@/lib/ai/context";
import { askGemini, GeminiError } from "@/lib/ai/gemini";

export const runtime = "nodejs";

const requests: number[] = [];

async function readLimitedJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 8_000) { await reader.cancel(); throw new Error("too-large"); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf8")) as unknown;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try { if (new URL(origin).host !== request.headers.get("host")) return Response.json({ error: "forbidden" }, { status: 403 }); }
    catch { return Response.json({ error: "forbidden" }, { status: 403 }); }
  }
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: "not-configured" }, { status: 503 });
  let body: unknown;
  try { body = await readLimitedJson(request); }
  catch (error) { const large = error instanceof Error && error.message === "too-large"; return Response.json({ error: large ? "too-large" : "invalid" }, { status: large ? 413 : 400 }); }
  if (!body || typeof body !== "object") return Response.json({ error: "invalid" }, { status: 400 });
  const { question, locale } = body as Record<string, unknown>;
  if (typeof question !== "string" || question.trim().length < 3 || question.length > 2_000 || (locale !== "en" && locale !== "vi")) return Response.json({ error: "invalid" }, { status: 400 });
  const sources = retrieveAtlasSources(question);
  if (!sources.length) return Response.json({ error: "no-context" }, { status: 422 });
  const now = Date.now();
  while (requests.length && requests[0] < now - 60_000) requests.shift();
  if (requests.length >= 12) return Response.json({ error: "rate-limit" }, { status: 429 });
  requests.push(now);
  try {
    const answer = await askGemini({ question: question.trim(), locale, sources });
    return Response.json({ answer, sources }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof GeminiError ? error.code : "unavailable";
    return Response.json({ error: code }, { status: code === "rate-limit" ? 429 : code === "authentication" ? 503 : 502, headers: { "Cache-Control": "no-store" } });
  }
}

import { retrieveAtlasSources, retrieveConceptSource } from "@/lib/ai/context";
import { askGemini, GeminiError } from "@/lib/ai/gemini";
import { validateAtlasAiRequest } from "@/lib/domain/ai";
import { hasJsonContentType, isSameOriginRequest } from "@/lib/http/request-security";

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
  if (!isSameOriginRequest(request)) return Response.json({ error: "forbidden" }, { status: 403 });
  if (!hasJsonContentType(request)) return Response.json({ error: "invalid" }, { status: 415 });
  if (!process.env.GEMINI_API_KEY) return Response.json({ error: "not-configured" }, { status: 503 });
  let body: unknown;
  try { body = await readLimitedJson(request); }
  catch (error) { const large = error instanceof Error && error.message === "too-large"; return Response.json({ error: large ? "too-large" : "invalid" }, { status: large ? 413 : 400 }); }
  const parsed = validateAtlasAiRequest(body);
  if (!parsed.ok) return Response.json({ error: "invalid" }, { status: 400 });
  const { question, locale, contextConceptId, task } = parsed.value;
  const explicitConceptSource = typeof contextConceptId === "string" ? retrieveConceptSource(contextConceptId) : null;
  if (typeof contextConceptId === "string" && !explicitConceptSource) return Response.json({ error: "invalid" }, { status: 400 });
  const sources = [explicitConceptSource, ...retrieveAtlasSources(question)]
    .filter((source): source is NonNullable<typeof source> => Boolean(source))
    .filter((source, index, items) => items.findIndex((item) => item.href === source.href) === index)
    .slice(0, 5);
  if (!sources.length) return Response.json({ error: "no-context" }, { status: 422 });
  const now = Date.now();
  while (requests.length && requests[0] < now - 60_000) requests.shift();
  if (requests.length >= 12) return Response.json({ error: "rate-limit" }, { status: 429 });
  requests.push(now);
  try {
    const answer = await askGemini({ question, locale, sources, task });
    return Response.json({ answer, sources }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof GeminiError ? error.code : "unavailable";
    return Response.json({ error: code }, { status: code === "rate-limit" ? 429 : code === "authentication" ? 503 : 502, headers: { "Cache-Control": "no-store" } });
  }
}

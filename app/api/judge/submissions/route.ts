import { problemById } from "@/content/problems";
import { UnavailableJudgeClient } from "@/lib/judge/mock-client";
import { validateSubmissionRequest } from "@/lib/domain/judge";

export const runtime = "nodejs";

const judge = new UnavailableJudgeClient();

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid-request");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 30_000) { await reader.cancel(); throw new Error("too-large"); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden" }, { status: 403 });
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) return Response.json({ error: "invalid-request" }, { status: 415 });
  let body: unknown;
  try { body = await readBody(request); } catch (error) { return Response.json({ error: error instanceof Error && error.message === "too-large" ? "too-large" : "invalid-request" }, { status: error instanceof Error && error.message === "too-large" ? 413 : 400 }); }
  const parsed = validateSubmissionRequest(body);
  if (!parsed.ok) return Response.json({ error: parsed.code }, { status: parsed.code === "quota-exceeded" ? 413 : 400 });
  const problem = problemById.get(parsed.value.problemId);
  if (!problem) return Response.json({ error: "not-found" }, { status: 404 });
  if (problem.version !== parsed.value.problemVersion) return Response.json({ error: "version-mismatch" }, { status: 409 });
  if (!problem.languages.includes(parsed.value.languageId as "python" | "javascript")) return Response.json({ error: "unsupported-language" }, { status: 400 });
  const result = await judge.submit(parsed.value);
  return Response.json(result, { status: result.status === "unavailable" ? 503 : 202, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden" }, { status: 403 });
  const id = new URL(request.url).searchParams.get("submissionId");
  if (!id || !/^[a-zA-Z0-9_-]{12,128}$/.test(id)) return Response.json({ error: "invalid-request" }, { status: 400 });
  const result = await judge.getStatus(id);
  return result ? Response.json(result, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "not-found" }, { status: 404 });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "forbidden" }, { status: 403 });
  const id = new URL(request.url).searchParams.get("submissionId");
  if (!id || !/^[a-zA-Z0-9_-]{12,128}$/.test(id)) return Response.json({ error: "invalid-request" }, { status: 400 });
  const result = await judge.cancel(id);
  return result ? Response.json(result, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "not-found" }, { status: 404 });
}

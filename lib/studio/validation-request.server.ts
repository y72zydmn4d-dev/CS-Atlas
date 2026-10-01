import "server-only";
import { validationLimits } from "@/lib/domain/learn-validation/types";

export function isLocalStudioOrigin(request: Request) {
  try {
    const target = new URL(request.url);
    // Next dev can construct request.url with an internal localhost hostname even
    // when the browser used127.0.0.1. Compare the real direct Host, never forwarded headers.
    const host = request.headers.get("host") ?? target.host;
    if (/[\s/@?#\\]/.test(host)) return false;
    const publicTarget = new URL(`${target.protocol}//${host}`);
    const origin = request.headers.get("origin");
    return ["localhost", "127.0.0.1", "[::1]"].includes(target.hostname)
      && ["localhost", "127.0.0.1", "[::1]"].includes(publicTarget.hostname)
      && publicTarget.host === host.toLowerCase() && publicTarget.port === target.port
      && Boolean(origin && origin === publicTarget.origin)
      && !["cross-site", "same-site"].includes(request.headers.get("sec-fetch-site") ?? "");
  } catch { return false; }
}
export async function readValidationRequest(request: Request): Promise<{ value: unknown } | { code: string; status: number }> {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("content-type") ?? "")) return { code: "json-required", status: 415 };
  const size = request.headers.get("content-length");
  if (size !== null && (!/^\d+$/.test(size) || Number(size) > validationLimits.requestBytes)) return { code: "payload-too-large", status: 413 };
  if (!request.body) return { code: "invalid-json", status: 400 };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > validationLimits.requestBytes) { await reader.cancel(); return { code: "payload-too-large", status: 413 }; }
      chunks.push(chunk.value);
    }
    const buffer = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
    return { value: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer)) };
  } catch { return { code: "invalid-json", status: 400 }; }
  finally { reader.releaseLock(); }
}

export interface StudioComputationBudget { windowStart: number; requestCount: number }
/** Shared read-only draft envelope/security boundary; callers independently guard availability. */
export async function readStudioDraftRequest(request: Request, budget: StudioComputationBudget): Promise<{ subjectId: string; lessonId: string; draft: unknown } | { code: string; status: number }> {
  if (!isLocalStudioOrigin(request)) return { code: "origin-rejected", status: 403 };
  if (new URL(request.url).search) return { code: "invalid-request", status: 400 };
  const now = Date.now();
  if (now - budget.windowStart >= 60_000) { budget.windowStart = now; budget.requestCount = 0; }
  if (++budget.requestCount > 120) return { code: "rate-limited", status: 429 };
  const parsed = await readValidationRequest(request);
  if ("code" in parsed) return parsed;
  const value = parsed.value;
  if (!value || typeof value !== "object" || Array.isArray(value) || !("subjectId" in value) || typeof value.subjectId !== "string" || !("lessonId" in value) || typeof value.lessonId !== "string" || !("draft" in value) || Object.keys(value).some((key) => !["subjectId", "lessonId", "draft"].includes(key))) return { code: "invalid-request", status: 400 };
  return { subjectId: value.subjectId, lessonId: value.lessonId, draft: value.draft };
}

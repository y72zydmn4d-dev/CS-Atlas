import { isStudioEnabled } from "@/lib/studio/guard.server";
import { validateStudioLessonDraft } from "@/lib/studio/validation.server";
import { isLocalStudioOrigin, readValidationRequest } from "@/lib/studio/validation-request.server";
import { isValidationReport } from "@/lib/studio/validation";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const failure = (code: string, status: number) => Response.json({ code }, { status, headers });
let windowStart = 0;
let requestCount = 0;

/** POST submits a draft for read-only computation. It cannot persist any content. */
export async function POST(request: Request) {
  if (!isStudioEnabled()) return failure("studio-unavailable", 404);
  if (!isLocalStudioOrigin(request)) return failure("origin-rejected", 403);
  if (new URL(request.url).search) return failure("invalid-request", 400);
  const now = Date.now();
  if (now - windowStart >= 60_000) { windowStart = now; requestCount = 0; }
  if (++requestCount > 120) return failure("rate-limited", 429);
  const parsed = await readValidationRequest(request);
  if ("code" in parsed) return failure(parsed.code, parsed.status);
  const value = parsed.value;
  if (!value || typeof value !== "object" || Array.isArray(value) || !("subjectId" in value) || typeof value.subjectId !== "string" || !("lessonId" in value) || typeof value.lessonId !== "string" || !("draft" in value) || Object.keys(value).some((key) => !["subjectId", "lessonId", "draft"].includes(key))) return failure("invalid-request", 400);
  try {
    const report = await validateStudioLessonDraft(value.subjectId, value.lessonId, value.draft);
    if (!report) return failure("unknown-lesson-context", 404);
    if (!isValidationReport(report)) return failure("invalid-report", 500);
    return Response.json(report, { headers });
  } catch { return failure("validation-service-failed", 500); }
}

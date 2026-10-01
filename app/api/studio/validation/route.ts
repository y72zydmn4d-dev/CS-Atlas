import { isStudioEnabled } from "@/lib/studio/guard.server";
import { validateStudioLessonDraft } from "@/lib/studio/validation.server";
import { readStudioDraftRequest } from "@/lib/studio/validation-request.server";
import { isValidationReport } from "@/lib/studio/validation";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const failure = (code: string, status: number) => Response.json({ code }, { status, headers });
const budget = { windowStart: 0, requestCount: 0 };

/** POST submits a draft for read-only computation. It cannot persist any content. */
export async function POST(request: Request) {
  if (!isStudioEnabled()) return failure("studio-unavailable", 404);
  const parsed = await readStudioDraftRequest(request, budget);
  if ("code" in parsed) return failure(parsed.code, parsed.status);
  try {
    const report = await validateStudioLessonDraft(parsed.subjectId, parsed.lessonId, parsed.draft);
    if (!report) return failure("unknown-lesson-context", 404);
    if (!isValidationReport(report)) return failure("invalid-report", 500);
    return Response.json(report, { headers });
  } catch { return failure("validation-service-failed", 500); }
}

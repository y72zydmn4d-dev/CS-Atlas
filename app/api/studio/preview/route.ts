import { isStudioEnabled } from "@/lib/studio/guard.server";
import { prepareStudioLessonPreview } from "@/lib/studio/preview.server";
import { readStudioDraftRequest } from "@/lib/studio/validation-request.server";
import { isStudioPreviewResponse, previewResponseBytes } from "@/lib/studio/preview";
import { validationLimits } from "@/lib/domain/learn-validation/types";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const failure = (code: string, status: number) => Response.json({ code }, { status, headers });
const budget = { windowStart: 0, requestCount: 0 };

/** Read-only preparation, not persistence. No draft URL/history or preview datastore. */
export async function POST(request: Request) {
  if (!isStudioEnabled()) return failure("studio-unavailable", 404);
  const parsed = await readStudioDraftRequest(request, budget);
  if ("code" in parsed) return failure(parsed.code, parsed.status);
  try {
    const response = await prepareStudioLessonPreview(parsed.subjectId, parsed.lessonId, parsed.draft);
    if (!response) return failure("unknown-lesson-context", 404);
    if (response.model && Object.values(response.model.resources).some((items) => items.length > validationLimits.collection)) return failure("preview-resource-limit-exceeded", 413);
    if (!isStudioPreviewResponse(response)) return failure("invalid-preview-model", 500);
    const body = JSON.stringify(response);
    if (new TextEncoder().encode(body).byteLength > previewResponseBytes) return failure("preview-response-too-large", 413);
    return new Response(body, { headers: { ...headers, "Content-Type": "application/json" } });
  } catch { return failure("preview-service-failed", 500); }
}

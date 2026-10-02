import "server-only";
import { isStudioEnabled } from "./guard.server";
import { isLocalStudioOrigin, readValidationRequest } from "./validation-request.server";
import { isStudioSubjectId, isStudioLessonId } from "./navigation";
import { isSavedInspection, isSaveResult } from "./save";
import type { existingLessonService } from "./save.server";

const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const fail = (code: string, status: number) => Response.json({ status: "failed", code }, { status, headers });
/** One existing-lesson resource. GET is read-only; PUT is the only mutation. */
export function existingLessonHandlers(service: () => Promise<ReturnType<typeof existingLessonService>>, onSaved: (href: string) => void = () => {}) {
  let count = 0, windowStart = 0;
  return async function handle(request: Request) {
    if (!isStudioEnabled()) return fail("WRITE_DISABLED", 404);
    if (request.method !== "GET" && request.method !== "PUT") return fail("METHOD_REJECTED", 405);
    let originRequest = request;
    // Browsers omit Origin on same-origin GET. Fetch Metadata authenticates that
    // read posture; mutation still always requires the explicit original Origin.
    if (request.method === "GET" && !request.headers.has("origin") && request.headers.get("sec-fetch-site") === "same-origin") {
      const headers = new Headers(request.headers);
      headers.set("origin", `${new URL(request.url).protocol}//${request.headers.get("host") ?? new URL(request.url).host}`);
      originRequest = new Request(request.url, { headers });
    }
    if (!isLocalStudioOrigin(originRequest)) return fail("ORIGIN_REJECTED", 403);
    const now = Date.now();
    if (now - windowStart > 60000) { windowStart = now; count = 0; }
    if (++count > 120) return fail("RATE_LIMITED", 429);
    try {
      if (request.method === "GET") {
        const params = new URL(request.url).searchParams;
        if ([...params.keys()].some(k => !["subjectId", "lessonId"].includes(k)) || params.getAll("subjectId").length !== 1 || params.getAll("lessonId").length !== 1) return fail("INVALID_REQUEST", 400);
        const subjectId = params.get("subjectId"), lessonId = params.get("lessonId");
        if (!subjectId || !lessonId || !isStudioSubjectId(subjectId) || !isStudioLessonId(lessonId)) return fail("INVALID_REQUEST", 400);
        const inspection = await (await service()).load(subjectId, lessonId);
        if (!isSavedInspection(inspection)) return fail("INVALID_RESPONSE", 500);
        return Response.json(inspection, { headers });
      }
      if (new URL(request.url).search) return fail("INVALID_REQUEST", 400);
      const parsed = await readValidationRequest(request);
      if ("code" in parsed) return fail(parsed.code.toUpperCase().replaceAll("-", "_"), parsed.status);
      const result = await (await service()).save(parsed.value);
      if (!isSaveResult(result)) return fail("INVALID_RESPONSE", 500);
      if (result.status === "saved") onSaved(result.inspection.learnerHref);
      return Response.json(result, { status: result.status === "saved" ? 200 : result.status === "validation-failed" ? 422 : result.status === "conflict" ? 409 : 400, headers });
    } catch { return fail("SAVE_SERVICE_FAILED", 500); }
  };
}

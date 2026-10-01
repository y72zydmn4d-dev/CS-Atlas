import { draftFingerprint } from "@/lib/studio/draft";
import { isStudioPreviewResponse } from "@/lib/studio/preview";
import type { StudioValidationRequest } from "@/lib/studio/validation";

/** Same-origin ephemeral preparation. No trusted client report or filesystem path. */
export async function requestStudioPreview(input: StudioValidationRequest, signal: AbortSignal) {
  const response = await fetch("/api/studio/preview", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", cache: "no-store", body: JSON.stringify(input), signal });
  if (!response.ok) throw new Error(`preview-request-${response.status}`);
  const value: unknown = await response.json();
  if (!isStudioPreviewResponse(value) || value.report.subjectId !== input.subjectId || value.report.lessonId !== input.lessonId) throw new Error("invalid-preview-response");
  if (value.model && draftFingerprint({ lesson: value.model.lesson, content: value.model.content }) !== draftFingerprint(input.draft)) throw new Error("preview-draft-mismatch");
  return value;
}

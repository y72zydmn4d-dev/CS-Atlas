import { isSaveResult, isSavedInspection } from "./save";
import type { AuthoringLessonDraft } from "./draft";
export async function saveStudioLesson(draft: AuthoringLessonDraft, baseRevision: string) {
  const response = await fetch("/api/studio/lesson", { method: "PUT", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subjectId: draft.lesson.subjectId, lessonId: draft.lesson.id, draft, baseRevision }) });
  const value: unknown = await response.json();
  if (!isSaveResult(value)) throw Error("Invalid save response");
  if (value.status === "saved" && (value.inspection.lesson.id !== draft.lesson.id || value.inspection.lesson.subjectId !== draft.lesson.subjectId)) throw Error("Save identity mismatch");
  return value;
}
export async function reloadStudioLesson(subjectId: string, lessonId: string) {
  const response = await fetch(`/api/studio/lesson?${new URLSearchParams({ subjectId, lessonId })}`, { credentials: "same-origin", cache: "no-store" });
  const value: unknown = await response.json();
  if (!response.ok || !isSavedInspection(value) || value.lesson.id !== lessonId || value.lesson.subjectId !== subjectId) throw Error("Reload failed");
  return value;
}

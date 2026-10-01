import { createHash } from "node:crypto";
import { validateCanonicalLesson } from "@/lib/domain/learn-validation";
import { canRenderLesson } from "@/lib/domain/learn-validation/renderability";
import { toLessonRenderModel } from "@/lib/domain/learn-rendering";
import { draftFingerprint, type AuthoringLessonDraft } from "@/lib/studio/draft";
import type { StudioPreviewResponse } from "@/lib/studio/preview";
import { validationContext, validationDraft } from "./learn-validation-fixtures";

/** Isolated transient fixture through the SAME domain rules/projection, no registry mutation. */
export function previewFixture(draft: AuthoringLessonDraft = validationDraft()): StudioPreviewResponse {
  const context = validationContext();
  const { candidate, issues } = validateCanonicalLesson(draft, context);
  const counts = { ERROR: 0, WARNING: 0, INFO: 0 };
  issues.forEach((issue) => counts[issue.severity]++);
  const renderable = canRenderLesson(candidate, issues);
  return { version: 1, report: {
    version: 1, subjectId: draft.lesson.subjectId, lessonId: draft.lesson.id,
    status: counts.ERROR ? "invalid" : counts.WARNING ? "review" : "valid", hasErrors: counts.ERROR > 0,
    canPersistInFuture: counts.ERROR === 0, renderable, counts, issues,
    draftFingerprint: candidate ? createHash("sha256").update(draftFingerprint(candidate)).digest("hex") : null,
    contextFingerprint: "b".repeat(64),
  }, model: renderable && candidate ? toLessonRenderModel(candidate, context) : null };
}

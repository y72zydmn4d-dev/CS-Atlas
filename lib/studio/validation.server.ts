import "server-only";
import { createHash } from "node:crypto";
import { requireStudioEnabled } from "@/lib/studio/guard.server";
import { isStudioLessonId, isStudioSubjectId } from "@/lib/studio/navigation";
import { readStudioLessonBody, readStudioManifests } from "@/lib/studio/content-reader.server";
import { validateCanonicalLesson } from "@/lib/domain/learn-validation";
import { boundedIssues, type ValidationReport } from "@/lib/domain/learn-validation/types";
import { draftFingerprint } from "@/lib/studio/draft";
import { canRenderLesson } from "@/lib/domain/learn-validation/renderability";
import { validateExistingLessonIdentity } from "@/lib/domain/learn-validation/existing";
import type { LessonCandidate, LessonValidationContext } from "@/lib/domain/learn-validation/types";

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
/** Server-authoritative read-only computation; never invokes the internal writer. */
export async function validateStudioLessonCandidate(subjectId: string, lessonId: string, input: unknown): Promise<{ report: ValidationReport; candidate: LessonCandidate | null; context: LessonValidationContext } | null> {
  requireStudioEnabled();
  if (!isStudioSubjectId(subjectId) || !isStudioLessonId(lessonId)) return null;
  const subjects = await readStudioManifests();
  const lessons = new Map(subjects.flatMap((subject) => subject.sections.flatMap((section) => section.lessons)).map((lesson) => [lesson.id, lesson]));
  const persisted = lessons.get(lessonId);
  if (!persisted || persisted.subjectId !== subjectId) return null;
  const [body, { concepts }, { exercises }, { problems }, { learnExamples, learnReferences }] = await Promise.all([
    readStudioLessonBody(lessonId), import("@/content/concepts/registry"), import("@/content/exercises"), import("@/content/problems"), import("@/content/learn/lesson-content"),
  ]);
  const context = { subjects, lessons, conceptIds: new Set(concepts.map((item) => item.id)), exerciseIds: new Set(exercises.map((item) => item.id)), problemIds: new Set(problems.map((item) => item.id)), examples: new Map(learnExamples.map((item) => [item.id, item])), references: new Map(learnReferences.map((item) => [item.id, item])) };
  const result = validateCanonicalLesson(input, context);
  if (result.candidate) result.issues.push(...validateExistingLessonIdentity(result.candidate, persisted, body));
  const issues = boundedIssues(result.issues);
  const counts = { ERROR: 0, WARNING: 0, INFO: 0 };
  for (const issue of issues) counts[issue.severity]++;
  const report: ValidationReport = {
    version: 1, status: counts.ERROR ? "invalid" : counts.WARNING ? "review" : "valid", hasErrors: counts.ERROR > 0,
    canPersistInFuture: counts.ERROR === 0, renderable: canRenderLesson(result.candidate, issues), counts, issues,
    subjectId, lessonId, draftFingerprint: result.candidate ? sha(draftFingerprint(result.candidate)) : null,
    contextFingerprint: sha(JSON.stringify([subjects, body, [...context.conceptIds], [...context.exerciseIds], [...context.problemIds], learnExamples, learnReferences])),
  };
  return { report, candidate: result.candidate, context };
}

/** Public report-only operation retains D's narrow contract. No registry/context returned. */
export async function validateStudioLessonDraft(subjectId: string, lessonId: string, input: unknown): Promise<ValidationReport | null> {
  return (await validateStudioLessonCandidate(subjectId, lessonId, input))?.report ?? null;
}

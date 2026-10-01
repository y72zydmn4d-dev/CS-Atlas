import "server-only";
import { createHash } from "node:crypto";
import { requireStudioEnabled } from "@/lib/studio/guard.server";
import { isStudioLessonId, isStudioSubjectId } from "@/lib/studio/navigation";
import { readStudioLessonBody, readStudioManifests } from "@/lib/studio/content-reader.server";
import { validateCanonicalLesson } from "@/lib/domain/learn-validation";
import { boundedIssues, type ValidationReport } from "@/lib/domain/learn-validation/types";
import { draftFingerprint } from "@/lib/studio/draft";

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
/** Server-authoritative, single-draft computation. No filesystem writer exists. */
export async function validateStudioLessonDraft(subjectId: string, lessonId: string, input: unknown): Promise<ValidationReport | null> {
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
  if (result.candidate) {
    for (const field of ["id", "subjectId", "sectionId", "slug", "order", "contentSource"] as const) if (result.candidate.lesson[field] !== persisted[field]) result.issues.push({ code: "IMMUTABLE_LESSON_FIELD", severity: "ERROR", path: `lesson.${field}`, entityId: lessonId, message: "Existing canonical identity, placement and source fields cannot be changed in this draft operation." });
    if (result.candidate.content && result.candidate.content.version !== (body?.version ?? 1)) result.issues.push({ code: "IMMUTABLE_BODY_VERSION", severity: "ERROR", path: "content.version", entityId: lessonId, message: "Body version is server-owned and cannot change in this operation." });
  }
  const issues = boundedIssues(result.issues);
  const counts = { ERROR: 0, WARNING: 0, INFO: 0 };
  for (const issue of issues) counts[issue.severity]++;
  return {
    version: 1, status: counts.ERROR ? "invalid" : counts.WARNING ? "review" : "valid", hasErrors: counts.ERROR > 0,
    canPersistInFuture: counts.ERROR === 0, renderable: Boolean(result.candidate && counts.ERROR === 0), counts, issues,
    subjectId, lessonId, draftFingerprint: result.candidate ? sha(draftFingerprint(result.candidate)) : null,
    contextFingerprint: sha(JSON.stringify([subjects, body, [...context.conceptIds], [...context.exerciseIds], [...context.problemIds], learnExamples, learnReferences])),
  };
}

import type { LearnLessonContent, LessonManifest } from "@/lib/domain/learn-platform";
import type { LessonCandidate, ValidationIssue } from "./types";

/** Same existing-record identity policy for validation and future persistence. */
export function validateExistingLessonIdentity(candidate: LessonCandidate, persisted: LessonManifest, body: LearnLessonContent | null): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const field of ["id", "subjectId", "sectionId", "slug", "order", "contentSource"] as const) if (candidate.lesson[field] !== persisted[field]) issues.push({ code: "IMMUTABLE_LESSON_FIELD", severity: "ERROR", path: `lesson.${field}`, entityId: persisted.id, message: "Existing canonical identity, placement and source fields cannot be changed in this draft operation." });
  if (candidate.content && candidate.content.version !== (body?.version ?? 1)) issues.push({ code: "IMMUTABLE_BODY_VERSION", severity: "ERROR", path: "content.version", entityId: persisted.id, message: "Body version is server-owned and cannot change in this operation." });
  return issues;
}

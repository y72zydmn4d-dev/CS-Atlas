import type { LessonCandidate, ValidationIssue } from "./types";

export const learnSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const reservedLearnSlugs = new Set(["tutorial", "exercises", "examples", "quiz", "reference"]);
export function validateLessonMetadata({ lesson, content }: LessonCandidate): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const error = (code: string, path: string, message: string) => issues.push({ code, path, message, severity: "ERROR", entityId: lesson.id });
  for (const field of ["title", "description"] as const) {
    if (!lesson[field].en.trim()) error(`LESSON_${field.toUpperCase()}_EMPTY`, `lesson.${field}.en`, `English ${field} is required.`);
    for (const language of ["en", "vi"] as const) if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(lesson[field][language])) error("INVALID_CONTROL_CHARACTER", `lesson.${field}.${language}`, "Unsupported control character.");
    if (lesson.translationStatus === "complete" && !lesson[field].vi.trim()) error("TRANSLATION_FIELD_MISSING", `lesson.${field}.vi`, "A complete translation declaration requires Vietnamese metadata.");
  }
  if (!/^learn:[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lesson.id)) error("LESSON_ID_INVALID", "lesson.id", "Expected a canonical Learn lesson ID.");
  if (!learnSlugPattern.test(lesson.slug) || lesson.slug.length > 80) error("LESSON_SLUG_INVALID", "lesson.slug", "Expected an ASCII kebab-case slug of at most80 characters.");
  if (reservedLearnSlugs.has(lesson.slug)) error("LESSON_SLUG_RESERVED", "lesson.slug", "This slug belongs to a Learn subject surface.");
  for (const field of ["estimatedMinutes", "order"] as const) if (!Number.isSafeInteger(lesson[field]) || lesson[field] < 1) error("POSITIVE_INTEGER_REQUIRED", `lesson.${field}`, "Expected a positive whole number.");
  if (content) {
    if (content.lessonId !== lesson.id) error("BODY_LESSON_MISMATCH", "content.lessonId", "Body identity must match its manifest.");
    if (!Number.isSafeInteger(content.version) || content.version < 1) error("BODY_VERSION_INVALID", "content.version", "Body version must be a positive whole number.");
    if (content.reviewedAt && (!/^\d{4}-\d{2}-\d{2}$/.test(content.reviewedAt) || !Number.isFinite(Date.parse(content.reviewedAt)) || new Date(content.reviewedAt).toISOString().slice(0, 10) !== content.reviewedAt)) error("REVIEW_DATE_INVALID", "content.reviewedAt", "Expected a real calendar date (YYYY-MM-DD).");
  }
  return issues;
}

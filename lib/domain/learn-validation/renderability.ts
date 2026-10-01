import type { LessonCandidate, ValidationIssue } from "./types";

/** Rendering-safe presence failures never authorize persistence. All other ERRORs fail closed. */
const presentationSafeErrors = new Set([
  "COMPLETE_MISSING_BODY", "COMPLETE_MISSING_SUBSTANCE", "COMPLETE_MISSING_OBJECTIVES",
  "COMPLETE_SUMMARY_EMPTY", "COMPLETE_REVIEW_DATE_EMPTY", "BLOCK_CONTENT_EMPTY",
]);
export function canRenderLesson(candidate: LessonCandidate | null, issues: readonly ValidationIssue[]) {
  return Boolean(candidate && hasRenderableIssues(issues));
}
export function hasRenderableIssues(issues: readonly ValidationIssue[]) {
  return issues.every((issue) => issue.severity !== "ERROR" || presentationSafeErrors.has(issue.code));
}

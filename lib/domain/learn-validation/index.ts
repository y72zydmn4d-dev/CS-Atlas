import { parseLessonCandidate } from "./parse";
import { validateLessonMetadata } from "./metadata";
import { validateCurriculumContext } from "./curriculum";
import { validateLessonBlocks } from "./blocks";
import { validateLessonRelationships } from "./relationships";
import { validateLessonStatus } from "./status";
import { boundedIssues, type LessonValidationContext } from "./types";

/** Shared build/Studio canonical truth; unknown payloads never reach typed rules. */
export function validateCanonicalLesson(input: unknown, context: LessonValidationContext) {
  const parsed = parseLessonCandidate(input);
  if (!parsed.candidate) return parsed;
  const candidate = parsed.candidate;
  return { candidate, issues: boundedIssues([
    ...validateLessonMetadata(candidate), ...validateCurriculumContext(candidate, context),
    ...validateLessonBlocks(candidate), ...validateLessonRelationships(candidate, context), ...validateLessonStatus(candidate, context),
  ]) };
}

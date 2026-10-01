import type { LessonCandidate, LessonValidationContext, ValidationIssue } from "./types";

export function validateLessonStatus({ lesson, content }: LessonCandidate, context: LessonValidationContext): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (code: string, path: string, message: string, severity: ValidationIssue["severity"]) => issues.push({ code, path, message, severity, entityId: lesson.id });
  const substantive = content?.blocks.some((block) => {
    if (block.type === "paragraph" || block.type === "definition") return Boolean(block.body.en.trim());
    if (block.type === "code" || block.type === "syntax") return Boolean(block.code.trim());
    if (block.type === "example") return Boolean(context.examples.get(block.exampleId)?.starterSource.trim());
    return false;
  });
  if (lesson.status === "COMPLETE") {
    if (!content) add("COMPLETE_MISSING_BODY", "content", "COMPLETE requires an authored body.", "ERROR");
    if (!substantive) add("COMPLETE_MISSING_SUBSTANCE", "content.blocks", "COMPLETE needs substantive prose/definition/code or a canonical Example, not headings/links alone.", "ERROR");
    if (!content?.blocks.some((block) => block.type === "objectives" && block.items.some((item) => item.en.trim()))) add("COMPLETE_MISSING_OBJECTIVES", "content.blocks", "COMPLETE requires nonempty learning objectives.", "ERROR");
    if (!content?.summary.en.trim()) add("COMPLETE_SUMMARY_EMPTY", "content.summary.en", "COMPLETE requires an English summary.", "ERROR");
    if (!content?.reviewedAt) add("COMPLETE_REVIEW_DATE_EMPTY", "content.reviewedAt", "COMPLETE requires an author-supplied review date.", "ERROR");
    if (!content?.blocks.some((block) => block.type === "example" || block.type === "code" || block.type === "syntax")) add("NO_EXAMPLE", "content.blocks", "Consider an example or code illustration.", "WARNING");
    if (!lesson.exerciseIds.length && !lesson.problemIds.length && !content?.blocks.some((block) => block.type === "exercise")) add("NO_PRACTICE", "lesson.exerciseIds", "No Exercise or Problem linked.", "WARNING");
    if (!content?.blocks.some((block) => block.type === "references" && block.referenceIds.length)) add("NO_REFERENCE", "content.blocks", "No LearnReference items linked.", "INFO");
  } else if (lesson.status === "PARTIAL" && !substantive) add("PARTIAL_BODY_THIN", "content", "PARTIAL currently has no substantive body.", "WARNING");
  return issues;
}

import type { LessonCandidate, LessonValidationContext, ValidationIssue } from "./types";
import { learnRuntimes } from "@/lib/domain/learn-platform";

export function validateLessonRelationships({ lesson, content }: LessonCandidate, context: LessonValidationContext): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  function check(ids: readonly string[], known: { has: (id: string) => boolean }, kind: string, path: string, self = false, scalar = false) {
    const seen = new Set<string>();
    ids.forEach((id, index) => {
      const add = (code: string, message: string) => issues.push({ code, severity: "ERROR", message, path: scalar ? path : `${path}[${index}]`, entityId: lesson.id, relationshipType: kind, relatedCanonicalId: id });
      if (!known.has(id)) add(`UNKNOWN_${kind}_ID`, `Unresolved ${kind.toLowerCase()} ID: ${id}`);
      if (seen.has(id)) add(`DUPLICATE_${kind}_ID`, `Duplicate ${kind.toLowerCase()} ID: ${id}`);
      if (self && id === lesson.id) add("SELF_LESSON_RELATIONSHIP", "A lesson cannot link to itself in this role.");
      seen.add(id);
    });
  }
  if (!lesson.conceptIds.length) issues.push({ code: "CONCEPT_REQUIRED", severity: "ERROR", message: "Link at least one canonical Concept.", path: "lesson.conceptIds", entityId: lesson.id });
  check(lesson.conceptIds, context.conceptIds, "CONCEPT", "lesson.conceptIds");
  check(lesson.exerciseIds, context.exerciseIds, "EXERCISE", "lesson.exerciseIds");
  check(lesson.problemIds, context.problemIds, "PROBLEM", "lesson.problemIds");
  check(lesson.prerequisiteLessonIds, context.lessons, "PREREQUISITE_LESSON", "lesson.prerequisiteLessonIds", true);
  content?.blocks.forEach((block, index) => {
    const path = `content.blocks[${index}]`;
    if (block.type === "exercise") check([block.exerciseId], context.exerciseIds, "EXERCISE", `${path}.exerciseId`, false, true);
    if (block.type === "example") {
      check([block.exampleId], context.examples, "EXAMPLE", `${path}.exampleId`, false, true);
      const example = context.examples.get(block.exampleId);
      if (example && (!learnRuntimes.includes(example.runtime) || (example.runtime === "browser-quickjs" && example.language !== "javascript") || !example.language.trim() || !example.starterSource.trim() || context.lessons.get(example.lessonId)?.subjectId !== example.subjectId || !context.subjects.some((subject) => subject.id === example.subjectId) || example.conceptIds.some((id) => !context.conceptIds.has(id)))) issues.push({ code: "EXAMPLE_CONFIGURATION_INVALID", severity: "ERROR", message: "Linked Example has invalid static runtime/source/ownership/Concept configuration. Code is never executed by validation.", path: `${path}.exampleId`, relatedCanonicalId: example.id });
    }
    if (block.type === "references") {
      check(block.referenceIds, context.references, "REFERENCE", `${path}.referenceIds`);
      block.referenceIds.forEach((id, offset) => {
        const reference = context.references.get(id);
        if (!reference) return;
        const owner = context.subjects.find((subject) => subject.id === reference.subjectId);
        const category = owner?.references.find((item) => item.id === reference.categoryId);
        if (!category?.referenceIds.includes(id)) issues.push({ code: "REFERENCE_CATEGORY_INVALID", severity: "ERROR", message: "Reference item does not belong to its canonical subject/category.", path: `${path}.referenceIds[${offset}]`, relatedCanonicalId: id });
      });
    }
    if (block.type === "related") {
      check(block.lessonIds, context.lessons, "RELATED_LESSON", `${path}.lessonIds`, true);
      check(block.problemIds, context.problemIds, "PROBLEM", `${path}.problemIds`);
    }
  });
  return issues.map((issue) => {
    const match = issue.path.match(/^content\.blocks\[(\d+)\]/);
    return match ? { ...issue, entityId: lesson.id, blockIndex: Number(match[1]), blockId: content?.blocks[Number(match[1])]?.id } : issue;
  });
}

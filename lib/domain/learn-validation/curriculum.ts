import type { LessonCandidate, LessonValidationContext, ValidationIssue } from "./types";

/** Iterative DFS: no recursive stack growth; related links are deliberately excluded. */
export function prerequisiteCycle(candidate: LessonCandidate, context: LessonValidationContext): string[] | null {
  const get = (id: string) => id === candidate.lesson.id ? candidate.lesson : context.lessons.get(id);
  const done = new Set<string>();
  const stack = [{ id: candidate.lesson.id, index: 0 }];
  const active = new Map([[candidate.lesson.id, 0]]);
  while (stack.length) {
    const frame = stack[stack.length - 1];
    const edges = get(frame.id)?.prerequisiteLessonIds ?? [];
    if (frame.index >= edges.length) { active.delete(frame.id); done.add(frame.id); stack.pop(); continue; }
    const next = edges[frame.index++];
    if (!get(next)) continue;
    const start = active.get(next);
    if (start !== undefined) return [...stack.slice(start).map((item) => item.id), next];
    if (!done.has(next)) { active.set(next, stack.length); stack.push({ id: next, index: 0 }); }
  }
  return null;
}

export function validateCurriculumContext(candidate: LessonCandidate, context: LessonValidationContext): ValidationIssue[] {
  const { lesson } = candidate;
  const issues: ValidationIssue[] = [];
  const error = (code: string, path: string, message: string) => issues.push({ code, path, message, severity: "ERROR", entityId: lesson.id });
  const subject = context.subjects.find((item) => item.id === lesson.subjectId);
  if (!subject) error("UNKNOWN_SUBJECT_ID", "lesson.subjectId", "Subject does not exist.");
  const section = subject?.sections.find((item) => item.id === lesson.sectionId);
  if (!section) error("UNKNOWN_SECTION_ID", "lesson.sectionId", "Section does not belong to this subject.");
  const placements = context.subjects.flatMap((item) => item.sections.flatMap((entry) => entry.lessons.filter((record) => record.id === lesson.id).map(() => ({ subject: item.id, section: entry.id }))));
  if (placements.length !== 1 || placements[0]?.subject !== lesson.subjectId || placements[0]?.section !== lesson.sectionId) error("CURRICULUM_IDENTITY_INVALID", "lesson.id", "Lesson must appear exactly once in its canonical curriculum context.");
  if (subject && (subject.sections.some((entry, index) => entry.order !== index + 1) || new Set(subject.sections.map((entry) => entry.id)).size !== subject.sections.length)) error("SECTION_ORDER_INVALID", "lesson.sectionId", "Canonical sections must have unique identities and contiguous array order.");
  if (section && section.lessons.some((entry, index) => (entry.id === lesson.id ? lesson.order : entry.order) !== index + 1)) error("LESSON_ORDER_INVALID", "lesson.order", "Canonical lesson array/order must agree for derived Previous/Next.");
  if (Array.from(context.lessons.values()).some((entry) => entry.id !== lesson.id && entry.subjectId === lesson.subjectId && entry.slug === lesson.slug)) error("LESSON_ROUTE_COLLISION", "lesson.slug", "Another lesson owns this subject-local route.");
  const cycle = prerequisiteCycle(candidate, context);
  if (cycle) error("PREREQUISITE_CYCLE", "lesson.prerequisiteLessonIds", `Prerequisite cycle: ${cycle.join(" → ")}`);
  return issues;
}

import { learnSubjects, learnLessonById } from "@/content/learn/registry";
import { learnContentByLessonId, learnExamples, learnReferences } from "@/content/learn/lesson-content";
import { concepts } from "@/content/concepts/registry";
import { exercises } from "@/content/exercises";
import { problems } from "@/content/problems";
import type { LessonValidationContext } from "@/lib/domain/learn-validation/types";
import { toAuthoringDraft } from "@/lib/studio/draft";

export function validationContext(): LessonValidationContext {
  const subjects = structuredClone(learnSubjects);
  return { subjects, lessons: new Map(subjects.flatMap((subject) => subject.sections.flatMap((section) => section.lessons)).map((lesson) => [lesson.id, lesson])), conceptIds: new Set(concepts.map((item) => item.id)), exerciseIds: new Set(exercises.map((item) => item.id)), problemIds: new Set(problems.map((item) => item.id)), examples: new Map(structuredClone(learnExamples).map((item) => [item.id, item])), references: new Map(structuredClone(learnReferences).map((item) => [item.id, item])) };
}
export function validationDraft(id = "learn:python:introduction") {
  const lesson = learnLessonById.get(id);
  if (!lesson) throw new Error("Missing fixture lesson");
  return toAuthoringDraft({ lesson, content: learnContentByLessonId.get(id) ?? null });
}

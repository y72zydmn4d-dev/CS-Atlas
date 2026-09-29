import { canonicalConceptIdForTopic } from "@/content/concepts/registry";
import { topicTranslationsVi } from "@/content/translations/vi";
import { topics } from "@/content/topics";
import type { Exercise } from "@/lib/domain/exercises";
import type { ExerciseBlock } from "@/lib/types";

function translatedExercise(block: ExerciseBlock, topicId: string): Exercise {
  const translated = topicTranslationsVi[topicId]?.content?.find((candidate) => candidate.id === block.id);
  const translatedExerciseBlock = translated?.type === "exercise" ? translated : null;
  return {
    id: `exercise:${topicId}:${block.id}`,
    version: 1,
    lessonId: `lesson:${topicId}`,
    conceptIds: [canonicalConceptIdForTopic(topicId), ...block.relatedTopicIds.map(canonicalConceptIdForTopic)],
    mode: block.exerciseType,
    difficulty: block.difficulty,
    title: { en: block.title, vi: translatedExerciseBlock?.title ?? block.title },
    prompt: { en: block.prompt, vi: translatedExerciseBlock?.prompt ?? block.prompt },
    hints: block.hints.map((hint, index) => ({ en: hint, vi: translatedExerciseBlock?.hints[index] ?? hint })),
    estimatedMinutes: block.estimatedMinutes,
    href: `/learn/${topics.find((topic) => topic.id === topicId)?.slug ?? topicId}#${block.id}`,
  };
}

export const exercises: Exercise[] = topics.flatMap((topic) => topic.content
  .filter((block): block is ExerciseBlock => block.type === "exercise")
  .map((block) => translatedExercise(block, topic.id)));

export const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

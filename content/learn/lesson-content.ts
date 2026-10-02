import { learnExamples } from "./examples";
import { learnReferences } from "./references";
import { learnQuizQuestions } from "./quizzes";
import { learnLessonContent as storedBodies } from "./generated/lesson-content-index";
import { learnLessonById } from "./registry";
import { parseLessonCandidate } from "@/lib/domain/learn-validation/parse";
export { learnExamples, learnReferences, learnQuizQuestions };
export const learnLessonContent = storedBodies.map(content => {
  const lesson = learnLessonById.get(content.lessonId);
  const result = parseLessonCandidate({ lesson, content });
  if (!result.candidate?.content) throw new Error("Invalid canonical body storage");
  return result.candidate.content;
});
export const learnContentByLessonId = new Map(learnLessonContent.map((item) => [item.lessonId, item]));
export const learnExampleById = new Map(learnExamples.map((item) => [item.id, item]));
export const learnReferenceById = new Map(learnReferences.map((item) => [item.id, item]));
export const learnReferenceByRoute = new Map(learnReferences.map((item) => [`${item.subjectId}/${item.slug}`, item]));
export const learnQuizQuestionById = new Map(learnQuizQuestions.map((item) => [item.id, item]));

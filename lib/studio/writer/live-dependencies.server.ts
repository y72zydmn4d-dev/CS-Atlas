import "server-only";
import { concepts } from "@/content/concepts/registry";
import { exercises } from "@/content/exercises";
import { problems } from "@/content/problems";
import { learnExamples } from "@/content/learn/examples";
import { learnReferences } from "@/content/learn/references";
import { learnQuizQuestions } from "@/content/learn/quizzes";
import { learnRouteAliases } from "@/content/learn/registry";
import type { CanonicalReadOnlyDependencies } from "./types.server";
export function liveDependencies(): CanonicalReadOnlyDependencies {
  return { conceptIds: new Set(concepts.map(x => x.id)), exerciseIds: new Set(exercises.map(x => x.id)), problemIds: new Set(problems.map(x => x.id)), examples: structuredClone(learnExamples), references: structuredClone(learnReferences), quizQuestions: structuredClone(learnQuizQuestions), aliases: structuredClone(learnRouteAliases) };
}
export function dependencyValues(value: CanonicalReadOnlyDependencies) {
  return { ...value, conceptIds: [...value.conceptIds].sort(), exerciseIds: [...value.exerciseIds].sort(), problemIds: [...value.problemIds].sort() };
}

import { lessons as legacyLessons } from "@/content/lessons";
import type { LearnRouteAlias } from "@/lib/domain/learn-platform";
import { parseSubjectManifest } from "@/lib/domain/learn-validation/subject";
import { learnSubjects as storedSubjects } from "./generated/subject-index";

export const learnSubjects = storedSubjects.map(value => {
  const result = parseSubjectManifest(value);
  if (!result.subject) throw new Error("Invalid canonical subject storage");
  return result.subject;
});

export const learnSubjectsForNavigation = [...learnSubjects].sort((left, right) => left.navigationOrder - right.navigationOrder || left.title.en.localeCompare(right.title.en));

export const learnSubjectBySlug = new Map(learnSubjects.map((item) => [item.slug, item]));

export const learnSubjectById = new Map(learnSubjects.map((item) => [item.id, item]));

export const learnLessons = learnSubjects.flatMap((item) => item.sections.flatMap((section) => section.lessons));

export const learnLessonById = new Map(learnLessons.map((item) => [item.id, item]));

export const learnLessonByRoute = new Map(learnLessons.map((item) => [`${item.subjectId}/${item.slug}`, item]));

const migratedLegacyDestinations: Record<string, string> = {
  arrays: "/learn/dsa/arrays",
  strings: "/learn/dsa/strings",
  "linked-lists": "/learn/dsa/linked-list",
  "stacks-queues": "/learn/dsa/stack",
  "hash-tables": "/learn/dsa/hash-table",
  trees: "/learn/dsa/tree-basics",
  heaps: "/learn/dsa/heap",
  graphs: "/learn/dsa/graph-representation",
  recursion: "/learn/dsa/recursion",
  sorting: "/learn/dsa/bubble-sort",
  searching: "/learn/dsa/binary-search",
  "graph-traversal": "/learn/dsa/graph-traversal",
  "shortest-paths": "/learn/dsa/bfs-shortest-path",
  "greedy-algorithms": "/learn/dsa/greedy-strategy",
  "dynamic-programming": "/learn/dsa/dp-fundamentals",
  "ml-fundamentals": "/learn/machine-learning/introduction",
};

export const learnRouteAliases: LearnRouteAlias[] = legacyLessons.flatMap((lesson) => {
  const destination = migratedLegacyDestinations[lesson.slug];
  const [, , subjectId, lessonSlug] = destination?.split("/") ?? [];
  return destination && subjectId && lessonSlug ? [{ legacyPath: `/learn/${lesson.slug}`, destination, lessonId: `learn:${subjectId}:${lessonSlug}` }] : [];
});

export const learnRouteAliasByPath = new Map(learnRouteAliases.map((item) => [item.legacyPath, item]));

export const legacyLearnLessonBySlug = new Map(legacyLessons.map((item) => [item.slug, item]));

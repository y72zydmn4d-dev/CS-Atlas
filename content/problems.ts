import {
  canonicalConceptIdForAlgorithm,
  canonicalConceptIdForTechnique,
  canonicalConceptIdForTopic,
  conceptRelations,
} from "@/content/concepts/registry";
import { domains } from "@/content/domains";
import { exercises } from "@/content/exercises";
import { practiceProblems } from "@/content/practice/problems";
import type { Problem } from "@/lib/domain/problems";

const problemRatings: Record<string, number> = {
  "first-occurrence": 900,
  "unweighted-distance": 1300,
  "sorted-pair": 900,
  "unique-window": 1400,
  "range-totals": 1000,
  "budget-knapsack": 1500,
  "regression-audit": 1400,
};

export const problems: Problem[] = practiceProblems.map((problem) => {
  const conceptIds = [
    ...problem.topicIds.map(canonicalConceptIdForTopic),
    ...problem.algorithmIds.map(canonicalConceptIdForAlgorithm),
    ...problem.techniqueIds.map(canonicalConceptIdForTechnique),
  ];
  const conceptSet = new Set(conceptIds);
  return {
    id: problem.id,
    version: problem.version,
    title: problem.title,
    summary: problem.summary,
    difficulty: problem.difficulty,
    domainId: problem.domainId,
    conceptIds,
    prerequisiteConceptIds: [...new Set(conceptRelations.filter((relation) => relation.type === "PREREQUISITE_OF" && conceptSet.has(relation.targetConceptId)).map((relation) => relation.sourceConceptId))],
    lessonIds: problem.topicIds.map((id) => `lesson:${id}`),
    exerciseIds: exercises.filter((exercise) => exercise.conceptIds.some((id) => conceptSet.has(id))).map((exercise) => exercise.id),
    roadmapIds: domains.filter((domain) => problem.topicIds.some((id) => domain.topicIds.includes(id))).map((domain) => `roadmap:${domain.id}`),
    tags: [...new Set([...problem.topicIds, ...problem.algorithmIds, ...problem.techniqueIds, problem.kind])],
    rating: problemRatings[problem.id] ?? 1200,
    languages: ["python", "javascript"],
    publicTestCount: problem.tests.length,
    publicExampleIds: problem.tests.map((test) => test.id),
    constraints: problem.constraints,
    hintCount: problem.hints.length,
    hasHiddenTests: false,
    publication: { hints: "public", editorial: "public-complexity-guidance", referenceSolution: "server-only", discussion: "unavailable" },
    provenance: { source: "practice-registry", sourceId: problem.id, sourceVersion: problem.version },
    href: `/problems/${problem.id}`,
  };
});

export const problemById = new Map(problems.map((problem) => [problem.id, problem]));

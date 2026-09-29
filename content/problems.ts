import {
  canonicalConceptIdForAlgorithm,
  canonicalConceptIdForTechnique,
  canonicalConceptIdForTopic,
} from "@/content/concepts/registry";
import { practiceProblems } from "@/content/practice/problems";
import type { Problem } from "@/lib/domain/problems";

export const problems: Problem[] = practiceProblems.map((problem) => ({
  id: problem.id,
  version: problem.version,
  title: problem.title,
  summary: problem.summary,
  difficulty: problem.difficulty,
  domainId: problem.domainId,
  conceptIds: [
    ...problem.topicIds.map(canonicalConceptIdForTopic),
    ...problem.algorithmIds.map(canonicalConceptIdForAlgorithm),
    ...problem.techniqueIds.map(canonicalConceptIdForTechnique),
  ],
  languages: ["python", "javascript"],
  publicTestCount: problem.tests.length,
  hasHiddenTests: false,
  href: `/problems/${problem.id}`,
}));

export const problemById = new Map(problems.map((problem) => [problem.id, problem]));

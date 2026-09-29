import type { ConceptId, LocalizedConceptText } from "@/lib/domain/concepts";

export type ProblemDifficulty = "easy" | "medium" | "hard";

export interface Problem {
  id: string;
  version: number;
  title: LocalizedConceptText;
  summary: LocalizedConceptText;
  difficulty: ProblemDifficulty;
  domainId: string;
  conceptIds: ConceptId[];
  prerequisiteConceptIds: ConceptId[];
  lessonIds: string[];
  exerciseIds: string[];
  roadmapIds: string[];
  tags: string[];
  rating: number;
  languages: Array<"python" | "javascript">;
  publicTestCount: number;
  publicExampleIds: string[];
  constraints: LocalizedConceptText[];
  hintCount: number;
  hasHiddenTests: false;
  publication: {
    hints: "public";
    editorial: "public-complexity-guidance";
    referenceSolution: "server-only";
    discussion: "unavailable";
  };
  provenance: { source: "practice-registry"; sourceId: string; sourceVersion: number };
  href: string;
}

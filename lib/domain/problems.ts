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
  languages: Array<"python" | "javascript">;
  publicTestCount: number;
  hasHiddenTests: false;
  href: string;
}

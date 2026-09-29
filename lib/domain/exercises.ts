import type { ConceptId, LocalizedConceptText } from "@/lib/domain/concepts";

export type ExerciseMode = "conceptual" | "calculation" | "coding" | "proof" | "debugging" | "design";

export interface Exercise {
  id: string;
  version: 1;
  lessonId: string;
  conceptIds: ConceptId[];
  mode: ExerciseMode;
  difficulty: "easy" | "medium" | "hard";
  title: LocalizedConceptText;
  prompt: LocalizedConceptText;
  hints: LocalizedConceptText[];
  estimatedMinutes: number;
  href: string;
}

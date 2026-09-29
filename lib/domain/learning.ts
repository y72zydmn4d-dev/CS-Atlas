import type { ConceptId } from "@/lib/domain/concepts";

export type LearningEventType = "lesson-completed" | "lesson-status-changed" | "exercise-attempted" | "exercise-solved" | "problem-public-run" | "problem-solved";

export interface LearningEvent {
  id: string;
  type: LearningEventType;
  conceptId: ConceptId;
  occurredAt: string;
  source: "browser-local" | "browser-public";
  sourceVersion?: number;
}

export interface UserMastery {
  conceptId: ConceptId;
  state: "not-started" | "developing" | "practicing" | "confident";
  evidenceCount: number;
  confidence: "low" | "medium" | "high";
  modelVersion: 1;
}

export function deriveLocalMastery(conceptId: ConceptId, events: LearningEvent[]): UserMastery {
  const relevant = events.filter((event) => event.conceptId === conceptId);
  const hasSolved = relevant.some((event) => event.type === "exercise-solved" || event.type === "problem-solved");
  const hasPractice = relevant.some((event) => event.type === "exercise-attempted" || event.type === "problem-public-run");
  const hasLesson = relevant.some((event) => event.type === "lesson-completed" || event.type === "lesson-status-changed");
  const state = hasSolved ? "confident" : hasPractice ? "practicing" : hasLesson ? "developing" : "not-started";
  return { conceptId, state, evidenceCount: relevant.length, confidence: hasSolved && relevant.length > 1 ? "medium" : relevant.length ? "low" : "low", modelVersion: 1 };
}

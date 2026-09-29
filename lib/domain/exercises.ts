import type { ConceptId, LocalizedConceptText } from "@/lib/domain/concepts";

export const exerciseModes = ["conceptual", "calculation", "coding", "proof", "debugging", "design", "multiple_choice", "fill_code", "function", "stdin_stdout", "unit_test", "sql", "numpy", "pandas"] as const;
export type ExerciseMode = (typeof exerciseModes)[number];
export type ExerciseResult = "correct" | "incorrect" | "self-reported" | "ungraded";

export type ExerciseAssessment =
  | { kind: "self-directed" }
  | { kind: "multiple-choice"; options: Array<{ id: string; text: LocalizedConceptText }>; correctOptionId: string; feedback: LocalizedConceptText }
  | { kind: "exact-answer"; acceptedAnswers: string[]; feedback: LocalizedConceptText; inputLabel: LocalizedConceptText };

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  exerciseVersion: number;
  occurredAt: string;
  result: ExerciseResult;
  hintCount: number;
}

export function isExerciseAttempt(value: unknown): value is ExerciseAttempt {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const attempt = value as Record<string, unknown>;
  return typeof attempt.id === "string"
    && typeof attempt.exerciseId === "string"
    && typeof attempt.exerciseVersion === "number"
    && Number.isInteger(attempt.exerciseVersion)
    && attempt.exerciseVersion > 0
    && typeof attempt.occurredAt === "string"
    && !Number.isNaN(Date.parse(attempt.occurredAt))
    && ["correct", "incorrect", "self-reported", "ungraded"].includes(attempt.result as string)
    && typeof attempt.hintCount === "number"
    && Number.isInteger(attempt.hintCount)
    && attempt.hintCount >= 0;
}

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
  assessment: ExerciseAssessment;
  execution: "none" | "browser-public";
}

function normalized(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function evaluateExerciseResponse(exercise: Exercise, response: string): ExerciseResult {
  if (exercise.assessment.kind === "self-directed") return "ungraded";
  if (exercise.assessment.kind === "multiple-choice") return response === exercise.assessment.correctOptionId ? "correct" : "incorrect";
  return exercise.assessment.acceptedAnswers.some((answer) => normalized(answer) === normalized(response)) ? "correct" : "incorrect";
}

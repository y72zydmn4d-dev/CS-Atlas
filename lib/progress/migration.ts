import { exerciseById } from "@/content/exercises";
import { problemById } from "@/content/problems";
import { canonicalConceptIdForTopic, resolveConcept } from "@/content/concepts/registry";
import { isLearningEvent, type LearningEvent } from "@/lib/domain/learning";
import type { PracticeState } from "@/lib/practice/types";
import type { ExerciseStatus, ProgressStatus } from "@/lib/types";

export const LEGACY_LEARNING_MIGRATION_VERSION = 1 as const;

export interface LegacyLearningSourceSnapshot {
  progress: Record<string, ProgressStatus>;
  exercises: Record<string, ExerciseStatus>;
  practiceCompletions: NonNullable<PracticeState["completions"]>;
}

export interface LegacyLearningMigration {
  schemaVersion: typeof LEGACY_LEARNING_MIGRATION_VERSION;
  migratedAt: string;
  sourceSnapshot: LegacyLearningSourceSnapshot;
  events: LearningEvent[];
}

function event(input: Omit<LearningEvent, "occurredAt" | "source">, migratedAt: string): LearningEvent {
  return { ...input, occurredAt: migratedAt, source: "legacy-local-snapshot" };
}

export function createLegacyLearningMigration(input: {
  progress: Record<string, ProgressStatus>;
  exercises: Record<string, ExerciseStatus>;
  practice: PracticeState;
  migratedAt: string;
}): LegacyLearningMigration {
  const events: LearningEvent[] = [];
  for (const [topicId, status] of Object.entries(input.progress).sort(([a], [b]) => a.localeCompare(b))) {
    if (status === "not-started") continue;
    const conceptId = canonicalConceptIdForTopic(topicId);
    if (!resolveConcept(conceptId)) continue;
    events.push(event({
      id: `legacy-v1:topic:${topicId}:${status}`,
      type: status === "completed" ? "lesson-completed" : "lesson-status-changed",
      conceptId,
      target: { type: "lesson", id: `lesson:${topicId}` },
    }, input.migratedAt));
  }
  for (const [progressId, status] of Object.entries(input.exercises).sort(([a], [b]) => a.localeCompare(b))) {
    if (status === "not-attempted") continue;
    const exercise = exerciseById.get(`exercise:${progressId}`);
    const conceptId = exercise?.conceptIds[0];
    if (!exercise || !conceptId) continue;
    events.push(event({
      id: `legacy-v1:exercise:${progressId}:${status}`,
      type: status === "solved" ? "exercise-solved" : "exercise-attempted",
      conceptId,
      sourceVersion: exercise.version,
      target: { type: "exercise", id: exercise.id },
    }, input.migratedAt));
  }
  const practiceCompletions = input.practice.completions ?? {};
  for (const [problemId, completion] of Object.entries(practiceCompletions).sort(([a], [b]) => a.localeCompare(b))) {
    const problem = problemById.get(problemId);
    const conceptId = problem?.conceptIds[0];
    if (!problem || !conceptId) continue;
    events.push(event({
      id: `legacy-v1:problem:${problemId}:${completion.version}`,
      type: "problem-public-completion-imported",
      conceptId,
      sourceVersion: completion.version,
      target: { type: "problem", id: problem.id },
    }, input.migratedAt));
  }
  return {
    schemaVersion: LEGACY_LEARNING_MIGRATION_VERSION,
    migratedAt: input.migratedAt,
    sourceSnapshot: { progress: { ...input.progress }, exercises: { ...input.exercises }, practiceCompletions: structuredClone(practiceCompletions) },
    events,
  };
}

export function isLegacyLearningMigration(value: unknown): value is LegacyLearningMigration {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const migration = value as Record<string, unknown>;
  const snapshot = migration.sourceSnapshot;
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return false;
  const source = snapshot as Record<string, unknown>;
  return migration.schemaVersion === LEGACY_LEARNING_MIGRATION_VERSION
    && typeof migration.migratedAt === "string"
    && !Number.isNaN(Date.parse(migration.migratedAt))
    && Boolean(source.progress && typeof source.progress === "object" && !Array.isArray(source.progress))
    && Boolean(source.exercises && typeof source.exercises === "object" && !Array.isArray(source.exercises))
    && Boolean(source.practiceCompletions && typeof source.practiceCompletions === "object" && !Array.isArray(source.practiceCompletions))
    && Array.isArray(migration.events)
    && migration.events.every((item) => isLearningEvent(item) && item.source === "legacy-local-snapshot");
}

export function mergeLearningEvents(...sources: LearningEvent[][]) {
  const byId = new Map<string, LearningEvent>();
  for (const source of sources) for (const item of source) byId.set(item.id, item);
  return [...byId.values()].sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt)).slice(-500);
}

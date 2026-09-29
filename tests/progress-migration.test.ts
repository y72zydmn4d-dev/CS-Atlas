import { beforeEach, describe, expect, it } from "vitest";
import { createLegacyLearningMigration, mergeLearningEvents } from "@/lib/progress/migration";
import { projectLegacyProgressToConcepts } from "@/lib/progress/projection";
import { emptyPracticeState } from "@/lib/practice/validation";
import { storage } from "@/lib/storage";

describe("local learning migration", () => {
  beforeEach(() => localStorage.clear());
  it("creates canonical snapshot evidence while preserving rollback data", () => {
    const practice = emptyPracticeState();
    practice.completions = { "first-occurrence": { version: 1, testIds: ["duplicates"] } };
    const migration = createLegacyLearningMigration({
      progress: { arrays: "completed", strings: "in-progress" },
      exercises: { "arrays:array-drill": "attempted", "binary-search-invariant": "solved" },
      practice,
      migratedAt: "2026-09-30T00:00:00.000Z",
    });
    expect(migration.sourceSnapshot).toEqual({ progress: { arrays: "completed", strings: "in-progress" }, exercises: { "arrays:array-drill": "attempted", "binary-search-invariant": "solved" }, practiceCompletions: practice.completions });
    expect(migration.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "legacy-v1:topic:arrays:completed", conceptId: "topic:arrays", type: "lesson-completed", source: "legacy-local-snapshot" }),
      expect.objectContaining({ id: "legacy-v1:exercise:binary-search-invariant:solved", conceptId: "topic:searching", type: "exercise-solved", source: "legacy-local-snapshot" }),
      expect.objectContaining({ id: "legacy-v1:problem:first-occurrence:1", conceptId: "topic:searching", type: "problem-public-completion-imported", source: "legacy-local-snapshot" }),
    ]));
  });

  it("deduplicates deterministic migration events and projects topic state by Concept ID", () => {
    const migrated = createLegacyLearningMigration({ progress: { arrays: "completed" }, exercises: {}, practice: emptyPracticeState(), migratedAt: "2026-09-30T00:00:00.000Z" });
    expect(mergeLearningEvents(migrated.events, migrated.events)).toHaveLength(1);
    expect(projectLegacyProgressToConcepts({ arrays: "completed" })).toMatchObject({ "topic:arrays": "completed", "topic:strings": "not-started" });
  });

  it("persists one idempotent migration snapshot without changing legacy keys", () => {
    const legacyProgress = JSON.stringify({ arrays: "completed" });
    localStorage.setItem("cs-atlas.progress.v1", legacyProgress);
    localStorage.setItem("cs-atlas.exercises.v1", JSON.stringify({ "binary-search-invariant": "solved" }));
    const first = storage.loadOrCreateLegacyLearningMigration();
    const second = storage.loadOrCreateLegacyLearningMigration();
    expect(second).toEqual(first);
    expect(first?.sourceSnapshot.progress).toEqual({ arrays: "completed" });
    expect(localStorage.getItem("cs-atlas.progress.v1")).toBe(legacyProgress);
  });
});

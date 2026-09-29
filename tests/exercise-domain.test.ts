import { describe, expect, it } from "vitest";
import { exerciseById } from "@/content/exercises";
import { attemptsForExerciseVersion, evaluateExerciseResponse, isExerciseAttempt, localizeExerciseText } from "@/lib/domain/exercises";

describe("typed exercise contracts", () => {
  it("evaluates original local exercises without invoking a code runtime", () => {
    const binarySearch = exerciseById.get("exercise:binary-search-invariant");
    const linearScan = exerciseById.get("exercise:array-linear-scan");
    expect(binarySearch?.execution).toBe("none");
    expect(binarySearch && evaluateExerciseResponse(binarySearch, "a")).toBe("correct");
    expect(binarySearch && evaluateExerciseResponse(binarySearch, "b")).toBe("incorrect");
    expect(linearScan && evaluateExerciseResponse(linearScan, " == ")).toBe("correct");
  });

  it("retains migrated embedded exercises as self-directed contracts", () => {
    const migrated = Array.from(exerciseById.values()).find((exercise) => exercise.id !== "exercise:binary-search-invariant" && exercise.assessment.kind === "self-directed");
    expect(migrated?.execution).toBe("none");
    expect(migrated && evaluateExerciseResponse(migrated, "anything")).toBe("ungraded");
  });

  it("validates bounded local attempt records", () => {
    expect(isExerciseAttempt({ id: "attempt", exerciseId: "exercise:array-linear-scan", exerciseVersion: 1, occurredAt: "2026-09-30T00:00:00.000Z", result: "correct", hintCount: 1 })).toBe(true);
    expect(isExerciseAttempt({ id: "attempt", exerciseId: "exercise:array-linear-scan", exerciseVersion: 0, occurredAt: "not-date", result: "correct", hintCount: -1 })).toBe(false);
  });

  it("keeps attempts scoped to the authored exercise version", () => {
    const exercise = exerciseById.get("exercise:array-linear-scan");
    if (!exercise) throw new Error("exercise fixture missing");
    const current = { id: "current", exerciseId: exercise.id, exerciseVersion: exercise.version, occurredAt: "2026-09-30T00:00:00.000Z", result: "correct" as const, hintCount: 1 };
    const stale = { ...current, id: "stale", exerciseVersion: exercise.version + 1 };
    expect(attemptsForExerciseVersion([current, stale], exercise)).toEqual([current]);
  });

  it("falls back to English when localized exercise text is blank", () => {
    expect(localizeExerciseText({ en: "Invariant", vi: "" }, "vi")).toBe("Invariant");
  });

  it("links every exercise to canonical concepts and an explicit rubric", () => {
    for (const exercise of exerciseById.values()) {
      expect(exercise.conceptIds[0]).toMatch(/^(topic|algorithm|technique):/);
      expect(exercise.rubric.criteria.length).toBeGreaterThan(0);
    }
  });
});

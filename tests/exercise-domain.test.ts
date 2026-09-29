import { describe, expect, it } from "vitest";
import { exerciseById } from "@/content/exercises";
import { evaluateExerciseResponse, isExerciseAttempt } from "@/lib/domain/exercises";

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
});

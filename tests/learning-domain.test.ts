import { describe, expect, it } from "vitest";
import { deriveLocalMastery } from "@/lib/domain/learning";

describe("local learning evidence", () => {
  it("keeps public problem runs distinct from completion certainty", () => {
    expect(deriveLocalMastery("algorithm:binary-search", [{ id: "run-1", type: "problem-public-run", conceptId: "algorithm:binary-search", occurredAt: "2026-01-01T00:00:00.000Z", source: "browser-public", sourceVersion: 1 }])).toMatchObject({ state: "practicing", confidence: "low" });
  });

  it("derives evidence-backed local confidence after an exercise is solved", () => {
    expect(deriveLocalMastery("topic:arrays", [{ id: "exercise-1", type: "exercise-solved", conceptId: "topic:arrays", occurredAt: "2026-01-01T00:00:00.000Z", source: "browser-local" }])).toMatchObject({ state: "confident", evidenceCount: 1 });
  });
});

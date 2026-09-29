import { describe, expect, it } from "vitest";
import { deriveLocalMastery } from "@/lib/domain/learning";

describe("local learning evidence", () => {
  it("keeps public problem runs distinct from completion certainty", () => {
    expect(deriveLocalMastery("algorithm:binary-search", [{ id: "run-1", type: "problem-public-run", conceptId: "algorithm:binary-search", occurredAt: "2026-01-01T00:00:00.000Z", source: "browser-public", sourceVersion: 1 }])).toMatchObject({ state: "practicing", confidence: "low" });
  });

  it("derives evidence-backed local confidence after an exercise is solved", () => {
    expect(deriveLocalMastery("topic:arrays", [{ id: "exercise-1", type: "exercise-solved", conceptId: "topic:arrays", occurredAt: "2026-01-01T00:00:00.000Z", source: "browser-local" }])).toMatchObject({ state: "confident", evidenceCount: 1 });
  });

  it("reports recency and does not promote imported public completions to mastery", () => {
    const imported = { id: "legacy-v1:problem:binary-search:1", type: "problem-public-completion-imported" as const, conceptId: "topic:searching", occurredAt: "2026-09-01T00:00:00.000Z", source: "legacy-local-snapshot" as const, target: { type: "problem" as const, id: "binary-search" } };
    expect(deriveLocalMastery("topic:searching", [imported], new Date("2026-09-10T00:00:00.000Z"))).toMatchObject({ state: "practicing", confidence: "low", recency: "recent", lastEvidenceAt: imported.occurredAt });
    expect(deriveLocalMastery("topic:searching", [imported], new Date("2027-03-10T00:00:00.000Z"))).toMatchObject({ recency: "stale" });
  });
});

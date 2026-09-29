import { describe, expect, it } from "vitest";
import { UnavailableJudgeClient } from "@/lib/judge/mock-client";

describe("unavailable Judge adapter", () => {
  it("records an unavailable lifecycle without evaluating source", async () => {
    const judge = new UnavailableJudgeClient();
    const input = { problemId: "first-occurrence", problemVersion: 1, languageId: "javascript" as const, source: "throw new Error('must never execute')", idempotencyKey: "submission-1" };
    const first = await judge.submit(input);
    const second = await judge.submit(input);
    expect(first).toMatchObject({ submissionId: "submission-1", status: "unavailable" });
    expect(second).toEqual(first);
    expect(await judge.getStatus("submission-1")).toEqual(first);
  });
});

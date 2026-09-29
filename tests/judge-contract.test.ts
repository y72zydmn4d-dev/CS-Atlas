import { describe, expect, it } from "vitest";
import { UnavailableJudgeClient } from "@/lib/judge/mock-client";
import { isSubmissionResult, validateSubmissionRequest } from "@/lib/domain/judge";

describe("unavailable Judge adapter", () => {
  it("records an unavailable lifecycle without evaluating source", async () => {
    const judge = new UnavailableJudgeClient();
    const input = { problemId: "first-occurrence", problemVersion: 1, languageId: "javascript" as const, source: "throw new Error('must never execute')", idempotencyKey: "submission-1" };
    const first = await judge.submit(input);
    const second = await judge.submit(input);
    expect(first).toMatchObject({ submissionId: "submission-1", status: "unavailable", runtime: { languageId: "javascript", version: "not configured" } });
    expect(isSubmissionResult(first)).toBe(true);
    expect(second).toEqual(first);
    expect(await judge.getStatus("submission-1")).toEqual(first);
  });

  it("validates source size, idempotency, and supported language contracts", () => {
    expect(validateSubmissionRequest({ problemId: "first-occurrence", problemVersion: 1, languageId: "javascript", source: "return", idempotencyKey: "short" })).toMatchObject({ ok: false, code: "invalid-request" });
    expect(validateSubmissionRequest({ problemId: "first-occurrence", problemVersion: 1, languageId: "javascript", source: "return", idempotencyKey: "submission-123456" })).toMatchObject({ ok: true });
    expect(validateSubmissionRequest({ problemId: "first-occurrence", problemVersion: 1, languageId: "javascript", source: "x".repeat(20_001), idempotencyKey: "submission-123456" })).toMatchObject({ ok: false, code: "quota-exceeded" });
  });
});

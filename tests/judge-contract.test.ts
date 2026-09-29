import { describe, expect, it } from "vitest";
import { UnavailableJudgeClient } from "@/lib/judge/mock-client";
import { isJudgeTestSuiteReference, isSubmissionResult, transitionSubmission, validateSubmissionRequest } from "@/lib/domain/judge";

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

  it("models public and hidden suite references without serializing test payloads", () => {
    expect(isJudgeTestSuiteReference({ id: "suite:first-occurrence:v1:hidden", problemId: "first-occurrence", problemVersion: 1, visibility: "hidden", caseCount: 24, packageChecksum: "a".repeat(64) })).toBe(true);
    expect(isJudgeTestSuiteReference({ id: "suite", problemId: "first-occurrence", problemVersion: 1, visibility: "hidden", caseCount: 1, packageChecksum: "not-a-checksum", input: "secret" })).toBe(false);
  });

  it("enforces the queued-running-terminal state machine and terminal verdict shape", () => {
    const queued = { submissionId: "submission-123", status: "queued" as const, createdAt: "2026-09-30T00:00:00.000Z", updatedAt: "2026-09-30T00:00:00.000Z" };
    const running = transitionSubmission(queued, { type: "started", occurredAt: "2026-09-30T00:00:01.000Z", runtime: { languageId: "javascript", version: "example-pinned-digest" } });
    const finished = transitionSubmission(running, { type: "completed", occurredAt: "2026-09-30T00:00:02.000Z", verdict: "AC", usage: { durationMs: 42, memoryBytes: 1024, outputBytes: 2 } });
    expect(isSubmissionResult(finished)).toBe(true);
    expect(() => transitionSubmission(finished, { type: "cancelled", occurredAt: "2026-09-30T00:00:03.000Z" })).toThrow("invalid-judge-transition");
    expect(isSubmissionResult({ ...finished, status: "running" })).toBe(false);
  });
});

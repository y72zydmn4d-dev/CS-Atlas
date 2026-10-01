import { afterEach, describe, expect, it, vi } from "vitest";
import { requestStudioValidation } from "@/lib/studio/validation-client";
import { validationDraft } from "./learn-validation-fixtures";
import type { ValidationReport } from "@/lib/domain/learn-validation/types";
const report: ValidationReport = { version: 1, status: "valid", hasErrors: false, canPersistInFuture: true, renderable: true, counts: { ERROR: 0, WARNING: 0, INFO: 0 }, issues: [], draftFingerprint: "a".repeat(64), contextFingerprint: "b".repeat(64), subjectId: "python", lessonId: "learn:python:introduction" };
afterEach(() => vi.unstubAllGlobals());
describe("validation typed transport", () => {
  it("submits only context IDs and cloned canonical draft with no-store and cancellation", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json(report)); vi.stubGlobal("fetch", fetch);
    const input = { subjectId: "python", lessonId: "learn:python:introduction", draft: validationDraft() }; const signal = new AbortController().signal;
    expect(await requestStudioValidation(input, signal)).toEqual(report);
    expect(fetch).toHaveBeenCalledWith("/api/studio/validation", expect.objectContaining({ method: "POST", cache: "no-store", credentials: "same-origin", signal }));
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(input);
  });
  it("rejects failed, malformed or mismatched-context response rather than displaying a verdict", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("failed", { status: 500 })).mockResolvedValueOnce(Response.json({ valid: true })).mockResolvedValueOnce(Response.json({ ...report, subjectId: "java" })));
    const input = { subjectId: "python", lessonId: "learn:python:introduction", draft: validationDraft() };
    for (let index = 0; index < 3; index++) await expect(requestStudioValidation(input, new AbortController().signal)).rejects.toThrow();
  });
});

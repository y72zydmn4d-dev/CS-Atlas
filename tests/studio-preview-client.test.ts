import { afterEach, describe, expect, it, vi } from "vitest";
import { requestStudioPreview } from "@/lib/studio/preview-client";
import { validationDraft } from "./learn-validation-fixtures";
import { previewFixture } from "./studio-preview-fixtures";
afterEach(() => vi.unstubAllGlobals());
describe("ephemeral preview transport", () => {
  it("sends only context + exact draft, no trusted report/path, uses no-store/cancellation", async () => {
    const input = { subjectId: "python", lessonId: "learn:python:introduction", draft: validationDraft() };
    const expected = previewFixture(input.draft); const fetch = vi.fn().mockResolvedValue(Response.json(expected)); vi.stubGlobal("fetch", fetch);
    const signal = new AbortController().signal;
    expect(await requestStudioPreview(input, signal)).toEqual(expected);
    expect(fetch).toHaveBeenCalledWith("/api/studio/preview", expect.objectContaining({ method: "POST", credentials: "same-origin", cache: "no-store", signal }));
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(input);
  });
  it("rejects malformed, context mismatch, stale candidate and system failure", async () => {
    const input = { subjectId: "python", lessonId: "learn:python:introduction", draft: validationDraft() };
    const stale = previewFixture(); if (!stale.model) throw Error("model"); stale.model.lesson.title.en = "Old draft";
    const wrong = previewFixture(); wrong.report.subjectId = "java";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("failed", { status: 500 })).mockResolvedValueOnce(Response.json({ valid: true })).mockResolvedValueOnce(Response.json(wrong)).mockResolvedValueOnce(Response.json(stale)));
    for (let index = 0; index < 4; index++) await expect(requestStudioPreview(input, new AbortController().signal)).rejects.toThrow();
  });
  it("returns blocked validation as diagnostics, not a service failure", async () => {
    const draft = validationDraft(); draft.lesson.conceptIds = ["legacy:unresolved"];
    const blocked = previewFixture(draft); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(blocked)));
    expect((await requestStudioPreview({ subjectId: "python", lessonId: draft.lesson.id, draft }, new AbortController().signal)).model).toBeNull();
  });
});

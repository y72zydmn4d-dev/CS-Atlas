import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { prepareStudioLessonPreview } from "@/lib/studio/preview.server";
import { isStudioPreviewResponse } from "@/lib/studio/preview";
import { draftFingerprint } from "@/lib/studio/draft";
import { searchIndex } from "@/content";
import { validationDraft } from "./learn-validation-fixtures";
beforeEach(() => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); });
afterEach(() => vi.unstubAllEnvs());
describe("authoritative read-only preview preparation", () => {
  it.each(["learn:python:introduction", "learn:python:lists", "learn:dsa:binary-search", "learn:java:interfaces"])("prepares real %s through canonical validation and shared projection", async (id) => {
    const draft = validationDraft(id); const snapshot = structuredClone(draft);
    const result = await prepareStudioLessonPreview(draft.lesson.subjectId, id, draft);
    expect(isStudioPreviewResponse(result)).toBe(true); expect(result?.report.counts.ERROR).toBe(0);
    expect(result?.model?.lesson).toEqual(draft.lesson); expect(result?.model?.content).toEqual(draft.content);
    expect(draft).toEqual(snapshot);
  });
  it("renders edited unsaved text with the exact new fingerprint, not disk body; Search is unchanged", async () => {
    const draft = validationDraft(); const canonical = structuredClone(draft); const index = JSON.stringify(searchIndex);
    draft.lesson.title.en = "UNSAVED Preview title";
    if (!draft.content) throw Error("body");
    draft.content.blocks.push({ type: "paragraph", id: "unsaved-prose", body: { en: "UNSAVED in-memory paragraph", vi: "Đoạn chưa lưu" } });
    const response = await prepareStudioLessonPreview("python", draft.lesson.id, draft);
    expect(response?.model?.lesson.title.en).toBe("UNSAVED Preview title");
    expect(response?.model?.content?.blocks.at(-1)?.id).toBe("unsaved-prose");
    expect(response?.report.draftFingerprint).toBe(createHash("sha256").update(draftFingerprint(draft)).digest("hex"));
    expect(validationDraft()).toEqual(canonical); expect(JSON.stringify(searchIndex)).toBe(index);
    expect(searchIndex.some((item) => JSON.stringify(item).includes("UNSAVED Preview"))).toBe(false);
  });
  it("blocks malformed / unresolved / immutable identities without rendering or deleting authored values", async () => {
    const malformed = await prepareStudioLessonPreview("python", "learn:python:introduction", { broken: true });
    expect(malformed?.model).toBeNull(); expect(malformed?.report.draftFingerprint).toBeNull();
    const draft = validationDraft(); draft.lesson.conceptIds = ["legacy:unknown"];
    expect((await prepareStudioLessonPreview("python", draft.lesson.id, draft))?.model).toBeNull(); expect(draft.lesson.conceptIds).toEqual(["legacy:unknown"]);
    draft.lesson.conceptIds = []; draft.lesson.slug = "another-route";
    expect((await prepareStudioLessonPreview("python", draft.lesson.id, draft))?.model).toBeNull();
  });
  it("does not confuse safe rendering with permission to persist COMPLETE content", async () => {
    const draft = validationDraft("learn:java:interfaces"); draft.lesson.status = "COMPLETE";
    const result = await prepareStudioLessonPreview("java", draft.lesson.id, draft);
    expect(result?.report).toMatchObject({ renderable: true, canPersistInFuture: false, hasErrors: true });
    expect(result?.model).not.toBeNull(); expect(isStudioPreviewResponse(result)).toBe(true);
  });
  it.each([["production", "true"], ["development", "false"], ["test", "true"]])("denies %s even with flag %s before preview", async (environment, flag) => {
    vi.stubEnv("NODE_ENV", environment); vi.stubEnv("AUTHORING_STUDIO_ENABLED", flag);
    await expect(prepareStudioLessonPreview("python", "learn:python:introduction", {})).rejects.toThrow();
  });
  it("rejects unknown/mismatched contexts", async () => {
    expect(await prepareStudioLessonPreview("unknown", "learn:python:introduction", {})).toBeNull();
    expect(await prepareStudioLessonPreview("java", "learn:python:introduction", {})).toBeNull();
    expect(await prepareStudioLessonPreview("python", "../../etc/passwd", {})).toBeNull();
  });
  it("keeps actual canonical hashes unchanged across valid, unsafe and HTML-like previews", async () => {
    const files = ["content/learn/registry.ts", "content/learn/lesson-content.ts", "content/concepts/registry.ts", "content/exercises.ts", "content/problems.ts"];
    const hashes = () => Promise.all(files.map(async (file) => createHash("sha256").update(await readFile(file)).digest("hex")));
    const before = await hashes(); const draft = validationDraft();
    await prepareStudioLessonPreview("python", draft.lesson.id, draft);
    if (!draft.content) throw Error("body");
    draft.content.blocks.push({ id: "educational-code", type: "code", language: "html", code: '<script>alert(1)</script><button onclick="evil()">Text</button>' });
    expect((await prepareStudioLessonPreview("python", draft.lesson.id, draft))?.model).not.toBeNull();
    await prepareStudioLessonPreview("python", draft.lesson.id, {}); expect(await hashes()).toEqual(before);
  });
});

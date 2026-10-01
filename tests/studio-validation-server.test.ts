import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { validateStudioLessonDraft } from "@/lib/studio/validation.server";
import { isValidationReport } from "@/lib/studio/validation";
import { validationDraft } from "./learn-validation-fixtures";
beforeEach(() => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); });
afterEach(() => vi.unstubAllEnvs());
describe("authoritative Studio validation service", () => {
  it("returns a typed stable fingerprint/context/count report for a real canonical lesson", async () => {
    const draft = validationDraft();
    const report = await validateStudioLessonDraft("python", draft.lesson.id, draft);
    expect(isValidationReport(report)).toBe(true); expect(report).toMatchObject({ hasErrors: false, canPersistInFuture: true, renderable: true, counts: { ERROR: 0 } });
    expect(await validateStudioLessonDraft("python", draft.lesson.id, draft)).toEqual(report);
    draft.lesson.title.en += " edited";
    expect((await validateStudioLessonDraft("python", draft.lesson.id, draft))?.draftFingerprint).not.toBe(report?.draftFingerprint);
  });
  it("accepts a SKELETON absence but rejects COMPLETE false claims", async () => {
    const draft = validationDraft("learn:java:interfaces");
    expect(await validateStudioLessonDraft("java", draft.lesson.id, draft)).toMatchObject({ status: "valid", counts: { ERROR: 0, WARNING: 0, INFO: 0 } });
    draft.lesson.status = "COMPLETE";
    expect(await validateStudioLessonDraft("java", draft.lesson.id, draft)).toMatchObject({ status: "invalid", canPersistInFuture: false, renderable: true }); // E: safe skeleton display, still cannot persist COMPLETE.
  });
  it.each(["id", "subjectId", "sectionId", "slug", "order", "contentSource"] as const)("prevents changing immutable existing %s", async (field) => {
    const draft = validationDraft();
    if (field === "order") draft.lesson.order++;
    else draft.lesson[field] = "forged";
    const report = await validateStudioLessonDraft("python", "learn:python:introduction", draft);
    expect(report?.issues).toContainEqual(expect.objectContaining({ code: "IMMUTABLE_LESSON_FIELD", path: `lesson.${field}` }));
  });
  it("binds server-owned body version and preserves unresolved relationships", async () => {
    const draft = validationDraft(); if (!draft.content) throw Error("body");
    draft.content.version++; draft.lesson.conceptIds = ["legacy:unknown"];
    const report = await validateStudioLessonDraft("python", draft.lesson.id, draft);
    expect(report?.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(["IMMUTABLE_BODY_VERSION", "UNKNOWN_CONCEPT_ID"]));
    expect(draft.lesson.conceptIds).toEqual(["legacy:unknown"]);
  });
  it("does not crash or return a canonical fingerprint for malformed input", async () => {
    const report = await validateStudioLessonDraft("python", "learn:python:introduction", { invalid: true });
    expect(report).toMatchObject({ hasErrors: true, renderable: false, draftFingerprint: null }); expect(isValidationReport(report)).toBe(true);
  });
  it.each([["production", "true"], ["development", "false"], ["development", ""], ["test", "true"]])("denies environment %s with flag %s", async (environment, flag) => {
    vi.stubEnv("NODE_ENV", environment); vi.stubEnv("AUTHORING_STUDIO_ENABLED", flag);
    await expect(validateStudioLessonDraft("python", "learn:python:introduction", {})).rejects.toThrow();
  });
  it.each(["../../etc/passwd", "../package.json", "/Users/test/file", "~/secret", "file:///etc/passwd", "%2e%2e/", "learn:python:../../x", "learn:unknown:lesson"])("rejects path/unknown context %s without file resolution", async (id) => {
    expect(await validateStudioLessonDraft("python", id, validationDraft())).toBeNull();
  });
  it("rejects unknown subjects and mismatched parent/lesson context", async () => {
    expect(await validateStudioLessonDraft("unknown", "learn:python:introduction", {})).toBeNull();
    expect(await validateStudioLessonDraft("java", "learn:python:introduction", {})).toBeNull();
  });
  it("validation never modifies canonical files or source objects", async () => {
    const files = ["content/learn/registry.ts", "content/learn/lesson-content.ts", "content/concepts/registry.ts", "content/exercises.ts", "content/problems.ts"];
    const hashes = () => Promise.all(files.map(async (file) => createHash("sha256").update(await readFile(file)).digest("hex")));
    const before = await hashes(); const draft = validationDraft(); const copy = structuredClone(draft);
    await validateStudioLessonDraft("python", draft.lesson.id, draft);
    draft.lesson.conceptIds = ["unresolved"]; await validateStudioLessonDraft("python", draft.lesson.id, draft);
    expect(await hashes()).toEqual(before); expect(validationDraft()).toEqual(copy);
  });
});

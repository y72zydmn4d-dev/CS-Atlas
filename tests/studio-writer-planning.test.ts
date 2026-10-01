// @vitest-environment node
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { writerFixture, preparedUpdate, type WriterFixture } from "./studio-writer-fixtures";
import { createCanonicalLessonWriter } from "@/lib/studio/writer/service.server";
import { readCanonicalSnapshot } from "@/lib/studio/writer/repository.server";
import { serializeBody, serializeSubject, canonicalJson } from "@/lib/studio/writer/serialization.server";
import { parseSubjectManifest } from "@/lib/domain/learn-validation/subject";
import { parseLessonCandidate } from "@/lib/domain/learn-validation/parse";
import { learnSubjects, learnLessonById } from "@/content/learn/registry";
import { learnLessonContent } from "@/content/learn/lesson-content";
import { createDraftBlock, createRelationshipBlock, editableBlockTypes, relationshipBlockTypes } from "@/lib/studio/draft";

const fixtures: WriterFixture[] = [];
async function fixture() { const result = await writerFixture(); fixtures.push(result); return result; }
beforeEach(() => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); });
afterEach(async () => { await Promise.all(fixtures.splice(0).map((fixture) => fixture.cleanup())); vi.unstubAllEnvs(); });
describe("canonical write planning, validation and serialization", () => {
  it("dry-runs immutable domain-aware changes with no staging, source mutations or draft mutation", async () => {
    const fixture = await fixtureFactory(); const before = await fixture.hashes();
    const { plan, loaded } = await preparedUpdate(fixture);
    const copy = structuredClone(loaded.draft);
    expect(plan.changes).toHaveLength(2); expect(plan.operationType).toBe("UPDATE_EXISTING_LESSON");
    expect(plan.validation.canPersistInFuture).toBe(true); expect(Object.isFrozen(plan.changes[0])).toBe(true);
    expect(plan.changes.map((change) => change.target.kind)).toEqual(["body", "subject"]);
    expect(await fixture.hashes()).toEqual(before); expect(loaded.draft).toEqual(copy);
    expect(await readdir(path.join(fixture.root, "content/learn"))).not.toContain(".authoring-transactions");
  });
  it("same canonical draft has deterministic bytes and logical changes, excluding operation UUID", async () => {
    const fixture = await fixtureFactory();
    const a = await preparedUpdate(fixture); const b = await preparedUpdate(fixture);
    expect(a.plan.changes).toEqual(b.plan.changes); expect(a.plan.operationId).not.toBe(b.plan.operationId);
  });
  it("no-op avoids rewrites/version bump, including semantically unchanged manual JSON formatting", async () => {
    const fixture = await fixtureFactory();
    const bodyPath = path.join(fixture.root, fixture.subject.sections[0].lessons[0].contentSource ?? "invalid");
    await writeFile(bodyPath, JSON.stringify(fixture.body), "utf8");
    const { plan } = await preparedUpdate(fixture, false); expect(plan.changes).toEqual([]);
    const before = await fixture.hashes(); expect(await fixture.writer.executeExistingLessonUpdate(plan)).toMatchObject({ changedFiles: [] }); expect(await fixture.hashes()).toEqual(before);
  });
  it("metadata-only edit leaves body/version unchanged; body edit bumps version exactly once", async () => {
    const fixture = await fixtureFactory(); const loaded = await fixture.writer.loadExistingLesson("java", fixture.body.lessonId);
    loaded.draft.lesson.title.vi += " mới";
    const receipt = await fixture.writer.validateExistingLesson("java", fixture.body.lessonId, loaded.draft);
    const plan = await fixture.writer.planExistingLessonUpdate({ subjectId: "java", lessonId: fixture.body.lessonId, draft: loaded.draft, receipt, baseRevision: loaded.revision });
    expect(plan.changes.map((change) => change.target.kind)).toEqual(["subject"]);
    const full = await preparedUpdate(fixture); expect(JSON.parse(full.plan.changes[0].text).version).toBe(2); expect(full.loaded.draft.content?.version).toBe(1);
  });
  it("rejects invalid/malformed input and unissued/client-forged validation authority", async () => {
    const fixture = await fixtureFactory(); const { request } = await preparedUpdate(fixture);
    request.draft.lesson.conceptIds = ["unresolved:legacy"];
    const invalid = await fixture.writer.validateExistingLesson("java", request.lessonId, request.draft);
    expect(invalid.report.issues.some((issue) => issue.code === "UNKNOWN_CONCEPT_ID")).toBe(true);
    await expect(fixture.writer.planExistingLessonUpdate({ ...request, receipt: invalid })).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    await expect(fixture.writer.planExistingLessonUpdate({ ...request, receipt: { report: { ...invalid.report, hasErrors: false, canPersistInFuture: true } } })).rejects.toMatchObject({ code: "VALIDATION_STALE" });
    expect((await fixture.writer.validateExistingLesson("java", request.lessonId, { invalid: true })).report.hasErrors).toBe(true);
  });
  it("rejects missing, stale or other writer validation receipts", async () => {
    const fixture = await fixtureFactory(); const { request, loaded } = await preparedUpdate(fixture);
    loaded.draft.lesson.description.en += " Changed after validation.";
    await expect(fixture.writer.planExistingLessonUpdate(request)).rejects.toMatchObject({ code: "VALIDATION_STALE" });
    const other = createCanonicalLessonWriter(fixture.configuration);
    await expect(other.planExistingLessonUpdate(request)).rejects.toMatchObject({ code: "VALIDATION_STALE" });
  });
  it("old validation context is stale even when a caller supplies a freshly loaded revision", async () => {
    const fixture = await fixtureFactory(); const { request } = await preparedUpdate(fixture);
    const target = path.join(fixture.root, "content/concepts/registry.ts"); await writeFile(target, await readFile(target, "utf8") + "// external change\n");
    const latest = await fixture.writer.loadExistingLesson("java", request.lessonId);
    await expect(fixture.writer.planExistingLessonUpdate({ ...request, baseRevision: latest.revision })).rejects.toMatchObject({ code: "VALIDATION_STALE" });
  });
  it("unknown ownership/identity and removal of an existing body cannot produce plans", async () => {
    const fixture = await fixtureFactory(); const { request } = await preparedUpdate(fixture); const before = await fixture.hashes();
    await expect(fixture.writer.loadExistingLesson("python", request.lessonId)).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    await expect(fixture.writer.validateExistingLesson("java", "learn:java:unknown", request.draft)).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    const absent = { ...request.draft, content: null };
    const receipt = await fixture.writer.validateExistingLesson("java", request.lessonId, absent);
    expect(receipt.report.issues).toContainEqual(expect.objectContaining({ code: "BODY_REMOVAL_UNSUPPORTED" }));
    await expect(fixture.writer.planExistingLessonUpdate({ ...request, draft: absent, receipt })).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    expect(await fixture.hashes()).toEqual(before);
  });
  it.each(["content/learn/subjects/java.json", "content/learn/lessons/java/interfaces.json", "content/concepts/registry.ts", "content/learn/generated/subject-index.ts"])("external edits to %s invalidate the revision before planning", async (relative) => {
    const fixture = await fixtureFactory(); const { request } = await preparedUpdate(fixture);
    const absolute = path.join(fixture.root, relative); await writeFile(absolute, await readFile(absolute, "utf8") + "\n");
    await expect(fixture.writer.planExistingLessonUpdate(request)).rejects.toMatchObject({ code: "REVISION_CONFLICT" });
  });
  it("canonical reader sees a simple update, with exact UTF8 and ordered block preservation", async () => {
    const fixture = await fixtureFactory(); const { plan, loaded } = await preparedUpdate(fixture);
    await fixture.writer.executeExistingLessonUpdate(plan);
    const current = await readCanonicalSnapshot(fixture.root, fixture.configuration.readDependencies);
    expect(current.lessons.get(fixture.body.lessonId)?.title).toEqual(loaded.draft.lesson.title);
    expect(current.bodies.get(fixture.body.lessonId)).toEqual({ ...loaded.draft.content, version: 2 });
    expect(current.bodies.get(fixture.body.lessonId)?.blocks.map((block) => block.id)).toEqual(fixture.body.blocks.map((block) => block.id));
    await expect(fixture.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "PREFLIGHT_FAILED" });
  });
  it("first body on an existing Skeleton is canonical CREATE + subject association + generated index", async () => {
    const fixture = await fixtureFactory(); const lessonId = "learn:java:classes";
    const loaded = await fixture.writer.loadExistingLesson("java", lessonId);
    loaded.draft.content = { ...structuredClone(fixture.body), lessonId };
    const receipt = await fixture.writer.validateExistingLesson("java", lessonId, loaded.draft);
    const plan = await fixture.writer.planExistingLessonUpdate({ subjectId: "java", lessonId, draft: loaded.draft, baseRevision: loaded.revision, receipt });
    expect(plan.changes.map((change) => [change.target.kind, change.action])).toEqual([["body", "CREATE"], ["subject", "UPDATE"], ["body-index", "UPDATE"]]);
    await fixture.writer.executeExistingLessonUpdate(plan);
    const result = await fixture.writer.loadExistingLesson("java", lessonId);
    expect(result.draft.content?.version).toBe(1); expect(result.draft.lesson.contentSource).toBe("content/learn/lessons/java/classes.json");
  });
  it("round trips every real subject/body with deterministic UTF8 semantics", () => {
    for (const subject of learnSubjects) {
      const text = serializeSubject(subject); expect(text.endsWith("\n")).toBe(true);
      expect(parseSubjectManifest(JSON.parse(text)).subject).toEqual(subject);
      expect(serializeSubject(subject)).toBe(text);
    }
    for (const body of learnLessonContent) {
      const lesson = learnLessonById.get(body.lessonId); if (!lesson) throw Error("missing");
      const text = serializeBody(lesson, body);
      expect(parseLessonCandidate({ lesson, content: JSON.parse(text) }).candidate?.content).toEqual(body);
      expect(serializeBody(lesson, body)).toBe(text);
    }
  });
  it("round trips all16 canonical variants without executing code or altering prose", async () => {
    const fixture = await fixtureFactory();
    const content = { ...fixture.body, blocks: [...editableBlockTypes.map((type) => createDraftBlock(type, [])), ...relationshipBlockTypes.map((type) => createRelationshipBlock(type, [], "canonical-id"))] };
    const text = serializeBody(fixture.subject.sections[0].lessons[0], content);
    expect(JSON.parse(text)).toEqual(content); expect(content.blocks).toHaveLength(16);
  });
  it("subject schema rejects unknown/nested malformed/group/enum fields; serializer rejects cycles/oversize", async () => {
    const fixture = await fixtureFactory();
    expect(parseSubjectManifest({ ...fixture.subject, file: "../x" }).subject).toBeNull();
    expect(parseSubjectManifest({ ...fixture.subject, sections: [{ wrong: true }] }).subject).toBeNull();
    expect(parseSubjectManifest({ ...fixture.subject, quizGroups: [{ id: "q", title: { en: "q", vi: "q" }, lessonIds: [], questionIds: [1] }] }).subject).toBeNull();
    expect(parseSubjectManifest({ ...fixture.subject, category: "fake" }).subject).toBeNull();
    const cycle: { loop?: unknown } = {}; cycle.loop = cycle; expect(() => canonicalJson(cycle)).toThrow("SERIALIZATION_FAILED");
    expect(() => canonicalJson("x".repeat(3 * 1024 * 1024))).toThrow("SERIALIZATION_FAILED");
  });
});
// Avoid local variable shadowing the fixture factory in test bodies.
const fixtureFactory = fixture;

// @vitest-environment node
import { readFile, writeFile, unlink, readdir, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { writerFixture, preparedUpdate, type WriterFixture } from "./studio-writer-fixtures";
import { createCanonicalLessonWriter } from "@/lib/studio/writer/service.server";
import type { WriterDependencies } from "@/lib/studio/writer/types.server";

const fixtures: WriterFixture[] = [];
async function fixture(hooks?: WriterDependencies["hooks"]) { const result = await writerFixture(hooks); fixtures.push(result); return result; }
beforeEach(() => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); });
afterEach(async () => { await Promise.all(fixtures.splice(0).map((fixture) => fixture.cleanup())); vi.unstubAllEnvs(); });
const tx = (fixture: WriterFixture, operationId?: string) => path.join(fixture.root, "content/learn/.authoring-transactions", operationId ?? "");
const fail = async () => { throw Error("Injected fixture failure, not author content"); };
describe("staging, commit, rollback, conflicts and recovery", () => {
  it("stages/flushed outputs and backups before mutation; then removes only its transaction artifacts", async () => {
    let staged = false;
    const f = await fixture({ staged: async () => {
      staged = true;
      expect(await f.hashes()).toEqual(before);
      const dirs = await readdir(tx(f)); const id = dirs.find((entry) => entry !== "writer.lock"); if (!id) throw Error("transaction");
      const journal = JSON.parse(await readFile(path.join(tx(f, id), "journal.json"), "utf8")); expect(journal.state).toBe("PREPARED");
      expect((await stat(tx(f, id))).mode & 0o777).toBe(0o700);
      for (let index = 0; index < 2; index++) expect((await stat(path.join(tx(f, id), `after-${index}`))).mode & 0o777).toBe(0o600);
    } });
    const { plan } = await preparedUpdate(f); const before = await f.hashes();
    await f.writer.executeExistingLessonUpdate(plan); expect(staged).toBe(true); expect(await readdir(tx(f))).toEqual([]);
  });
  it("preparation failure changes no canonical file and removes staging/lock", async () => {
    const f = await fixture({ staged: fail }); const { plan } = await preparedUpdate(f); const before = await f.hashes();
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "STAGING_FAILED" });
    expect(await f.hashes()).toEqual(before); expect(await readdir(tx(f))).toEqual([]);
  });
  it("exclusive staging collision never deletes a directory this operation did not create", async () => {
    const f = await fixture(); const { plan } = await preparedUpdate(f); const before = await f.hashes();
    const original = f.configuration.readDependencies; let injected = false;
    f.configuration.readDependencies = async () => {
      if (!injected) { injected = true; await mkdir(tx(f, plan.operationId)); await writeFile(path.join(tx(f, plan.operationId), "unowned.txt"), "Preserve unowned evidence"); }
      return original();
    };
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "STAGING_FAILED" });
    expect(await readFile(path.join(tx(f, plan.operationId), "unowned.txt"), "utf8")).toBe("Preserve unowned evidence");
    expect(await readdir(tx(f))).toEqual([plan.operationId]); expect(await f.hashes()).toEqual(before);
  });
  it.each([0, 1])("failure after replacement %s rolls back all files to exact previous hashes", async (after) => {
    const f = await fixture({ replaced: async (index) => { if (index === after) await fail(); } });
    const { plan } = await preparedUpdate(f); const before = await f.hashes();
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "COMMIT_FAILED" });
    expect(await f.hashes()).toEqual(before); expect(await readdir(tx(f))).toEqual([]);
  });
  it("post-write verification failure rolls back and verifies every prior hash", async () => {
    const f = await fixture({ verifying: fail }); const { plan } = await preparedUpdate(f); const before = await f.hashes();
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "VERIFY_FAILED" });
    expect(await f.hashes()).toEqual(before);
  });
  it("canonical reparse failure after writing is detected and does not declare success", async () => {
    let failRead = false;
    const f = await fixture({ verifying: async () => { failRead = true; } });
    const original = f.configuration.readDependencies;
    f.configuration.readDependencies = async () => { const dependencies = await original(); if (failRead) dependencies.conceptIds.clear(); return dependencies; };
    const { plan } = await preparedUpdate(f); const before = await f.hashes();
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "VERIFY_FAILED" });
    expect(await f.hashes()).toEqual(before);
  });
  it("CREATE target collision after planning rejects without clobber or unrelated output", async () => {
    const f = await fixture(); const lessonId = "learn:java:classes"; const loaded = await f.writer.loadExistingLesson("java", lessonId);
    loaded.draft.content = { ...structuredClone(f.body), lessonId };
    const receipt = await f.writer.validateExistingLesson("java", lessonId, loaded.draft);
    const plan = await f.writer.planExistingLessonUpdate({ subjectId: "java", lessonId, draft: loaded.draft, baseRevision: loaded.revision, receipt });
    const target = path.join(f.root, "content/learn/lessons/java/classes.json"); await writeFile(target, "external new file"); const before = await f.hashes();
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "REVISION_CONFLICT" });
    expect(await f.hashes()).toEqual(before); expect(await readFile(target, "utf8")).toBe("external new file");
  });
  it("UPDATE disappearing after planning is a conflict, not an implicit recreate", async () => {
    const f = await fixture(); const { plan } = await preparedUpdate(f); await unlink(path.join(f.root, plan.changes[0].relativePath)); const before = await f.hashes();
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "REVISION_CONFLICT" }); expect(await f.hashes()).toEqual(before);
  });
  it("edit after planning or after staging conflicts without overwriting external bytes", async () => {
    const f = await fixture({ staged: async () => { const target = path.join(f.root, "content/learn/lessons/java/interfaces.json"); await writeFile(target, await readFile(target, "utf8") + "\n"); } });
    const { plan } = await preparedUpdate(f); const subjectBefore = await readFile(path.join(f.root, "content/learn/subjects/java.json"), "utf8");
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "REVISION_CONFLICT" });
    expect(await readFile(path.join(f.root, "content/learn/subjects/java.json"), "utf8")).toBe(subjectBefore);
    expect(await readdir(tx(f))).toEqual([]);
  });
  it("rollback failure has a distinct critical code and retains journal, backup and lock", async () => {
    const f = await fixture({ replaced: fail, rollingBack: fail }); const { plan } = await preparedUpdate(f); const before = await f.hashes();
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "ROLLBACK_FAILED", operationId: plan.operationId });
    const journal = JSON.parse(await readFile(path.join(tx(f, plan.operationId), "journal.json"), "utf8")); expect(journal.state).toBe("COMMITTING");
    expect(await readdir(tx(f))).toEqual(expect.arrayContaining(["writer.lock", plan.operationId]));
    const cleanWriter = createCanonicalLessonWriter({ ...f.configuration, hooks: undefined });
    await expect(cleanWriter.recoverAbandonedOperation(plan.operationId, false)).rejects.toMatchObject({ code: "RECOVERY_REQUIRED" });
    await cleanWriter.recoverAbandonedOperation(plan.operationId, true);
    expect(await f.hashes()).toEqual(before); expect(await readdir(tx(f))).toEqual([]);
  });
  it("refuses to overwrite an intervening manual edit during rollback or recovery", async () => {
    const f = await fixture({ replaced: async () => { await writeFile(path.join(f.root, "content/learn/lessons/java/interfaces.json"), "manual editor now owns these bytes"); await fail(); } });
    const { plan } = await preparedUpdate(f);
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "ROLLBACK_FAILED" });
    await expect(f.writer.recoverAbandonedOperation(plan.operationId, true)).rejects.toMatchObject({ code: "ROLLBACK_FAILED" });
    expect(await readFile(path.join(f.root, "content/learn/lessons/java/interfaces.json"), "utf8")).toBe("manual editor now owns these bytes");
    expect(await readdir(tx(f))).toContain(plan.operationId);
  });
  it("rollback removes a transaction-created body and restores metadata/index after three-file failure", async () => {
    const f = await fixture({ verifying: fail }); const lessonId = "learn:java:classes"; const loaded = await f.writer.loadExistingLesson("java", lessonId);
    loaded.draft.content = { ...structuredClone(f.body), lessonId }; const before = await f.hashes();
    const receipt = await f.writer.validateExistingLesson("java", lessonId, loaded.draft);
    const plan = await f.writer.planExistingLessonUpdate({ subjectId: "java", lessonId, draft: loaded.draft, baseRevision: loaded.revision, receipt });
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "VERIFY_FAILED" }); expect(await f.hashes()).toEqual(before);
  });
  it("cross-worker lock is exclusive; never stolen because it is old", async () => {
    let entered = () => {}; let unblock = () => {};
    const reached = new Promise<void>((resolve) => { entered = resolve; }); const hold = new Promise<void>((resolve) => { unblock = resolve; });
    const f = await fixture({ staged: async () => { entered(); await hold; } });
    const a = await preparedUpdate(f); const other = createCanonicalLessonWriter({ ...f.configuration, hooks: undefined });
    const b = await other.planExistingLessonUpdate({ ...a.request, receipt: await other.validateExistingLesson("java", a.request.lessonId, a.request.draft) });
    const running = f.writer.executeExistingLessonUpdate(a.plan); await reached;
    await expect(other.executeExistingLessonUpdate(b)).rejects.toMatchObject({ code: "WRITE_LOCKED" });
    unblock(); await running; expect(await readdir(tx(f))).toEqual([]);
  });
  it("standalone lock denies execution without altering any target", async () => {
    const f = await fixture(); const { plan } = await preparedUpdate(f); const before = await f.hashes();
    await mkdir(tx(f), { mode: 0o700 }); await writeFile(path.join(tx(f), "writer.lock"), '{"operationId":"unrelated-owner"}');
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "WRITE_LOCKED" }); expect(await f.hashes()).toEqual(before);
  });
  it("abandoned journal without a lock blocks a new operation without deleting evidence", async () => {
    const f = await fixture(); const { plan } = await preparedUpdate(f); const before = await f.hashes();
    const orphan = "00000000-0000-4000-8000-000000000001";
    await mkdir(tx(f, orphan), { recursive: true }); await writeFile(path.join(tx(f, orphan), "journal.json"), "incomplete evidence");
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "RECOVERY_REQUIRED" });
    expect(await f.hashes()).toEqual(before); expect(await readdir(tx(f))).toEqual([orphan]);
  });
  it("corrupt/path-shaped recovery journals stop safely and preserve evidence", async () => {
    const f = await fixture({ replaced: fail, rollingBack: fail }); const { plan } = await preparedUpdate(f);
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "ROLLBACK_FAILED" });
    const journalPath = path.join(tx(f, plan.operationId), "journal.json"); const journal = JSON.parse(await readFile(journalPath, "utf8"));
    journal.changes[0].relativePath = "../../outside"; await writeFile(journalPath, JSON.stringify(journal)); const before = await f.hashes();
    await expect(f.writer.recoverAbandonedOperation(plan.operationId, true)).rejects.toMatchObject({ code: "RECOVERY_REQUIRED" });
    expect(await f.hashes()).toEqual(before); expect(await readdir(tx(f))).toContain(plan.operationId);
    await writeFile(journalPath, "{bad JSON"); await expect(f.writer.recoverAbandonedOperation(plan.operationId, true)).rejects.toMatchObject({ code: "RECOVERY_REQUIRED" });
  });
  it.each(["PREPARED", "COMPLETED"])("explicit recovery verifies an abandoned %s journal before cleanup", async (state) => {
    const f = await fixture({ replaced: fail, rollingBack: fail }); const { plan } = await preparedUpdate(f); const before = await f.hashes();
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "ROLLBACK_FAILED" });
    const journalPath = path.join(tx(f, plan.operationId), "journal.json"); const journal = JSON.parse(await readFile(journalPath, "utf8"));
    if (state === "PREPARED") {
      for (let index = 0; index < plan.changes.length; index++) await writeFile(path.join(f.root, plan.changes[index].relativePath), await readFile(path.join(tx(f, plan.operationId), `before-${index}`)));
    } else for (const change of plan.changes) await writeFile(path.join(f.root, change.relativePath), change.text);
    journal.state = state; await writeFile(journalPath, JSON.stringify(journal));
    const writer = createCanonicalLessonWriter({ ...f.configuration, hooks: undefined });
    await writer.recoverAbandonedOperation(plan.operationId, true);
    expect(await readdir(tx(f))).toEqual([]);
    if (state === "PREPARED") expect(await f.hashes()).toEqual(before);
    else expect((await writer.loadExistingLesson("java", f.body.lessonId)).draft.content?.version).toBe(2);
  });
  it("corrupt rollback backup is detected and never replaces canonical bytes", async () => {
    const f = await fixture({ replaced: fail, rollingBack: fail }); const { plan } = await preparedUpdate(f);
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "ROLLBACK_FAILED" });
    await writeFile(path.join(tx(f, plan.operationId), "before-0"), "invalid backup"); const current = await f.hashes();
    await expect(f.writer.recoverAbandonedOperation(plan.operationId, true)).rejects.toMatchObject({ code: "ROLLBACK_FAILED" });
    expect(await f.hashes()).toEqual(current); expect(await readdir(tx(f))).toContain(plan.operationId);
  });
});

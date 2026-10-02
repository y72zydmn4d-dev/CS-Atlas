// @vitest-environment node
import { symlink, link, writeFile, readFile, unlink, readdir } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { writerFixture, preparedUpdate, type WriterFixture } from "./studio-writer-fixtures";
import { targetPath, checkedPath, isContained, discoverRepositoryRoot } from "@/lib/studio/writer/paths.server";
import { checkPlanTargets } from "@/lib/studio/writer/planning.server";
import { sha256 } from "@/lib/studio/writer/serialization.server";
import type { AuthoringWritePlan } from "@/lib/studio/writer/types.server";
import { liveLessonWriter } from "@/lib/studio/writer/live.server";

const fixtures: WriterFixture[] = [];
async function fixture() { const result = await writerFixture(); fixtures.push(result); return result; }
beforeEach(() => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); });
afterEach(async () => { await Promise.all(fixtures.splice(0).map((fixture) => fixture.cleanup())); vi.unstubAllEnvs(); });
const badPaths = ["../../outside", "../package.json", "/Users/test/file", "~/secret", "file:///etc/passwd", "%2e%2e/", "nested/../../../x", "..\\outside", "a/..\\b/x", "java%2f..%2f", "java\u0000"];
describe("internal writer security", () => {
  it.each(badPaths)("rejects malicious canonical identity/path %s", async (input) => {
    const f = await fixture(); const before = await f.hashes();
    expect(() => targetPath({ kind: "subject", subjectId: input })).toThrow("PATH_REJECTED");
    expect(() => targetPath({ kind: "body", subjectId: "java", lessonId: `learn:java:${input}` })).toThrow("PATH_REJECTED");
    await expect(checkedPath(f.root, input, true)).rejects.toMatchObject({ code: "PATH_REJECTED" });
    expect(await f.hashes()).toEqual(before);
  });
  it("containment rejects root equality and sibling-prefix confusion", () => {
    expect(isContained("/safe/root", "/safe/root")).toBe(false); expect(isContained("/safe/root", "/safe/root-other/x")).toBe(false); expect(isContained("/safe/root", "/safe/root/x")).toBe(true);
  });
  it("discovers only verified server-owned repository markers from a nested anchor", async () => {
    const f = await fixture(); expect(await discoverRepositoryRoot(f.configuration.rootAnchor)).toBe(f.root);
    await writeFile(path.join(f.root, "package.json"), '{"name":"other"}');
    await expect(discoverRepositoryRoot(f.configuration.rootAnchor)).rejects.toMatchObject({ code: "STORAGE_NOT_READY" });
  });
  it.each(["content/learn/registry.ts", "content/learn/lesson-content.ts", "content/concepts/registry.ts", "package.json", ".env.local", ".git/config", "content/learn/subjects/java.sh", "content/learn/subjects/java.js"])("rejects hand-maintained/read-only/config/unsupported target %s", async (relativePath) => {
    const f = await fixture(); const { plan } = await preparedUpdate(f); const change = plan.changes[0];
    await expect(checkPlanTargets(f.root, { ...plan, changes: [{ ...change, relativePath }] })).rejects.toMatchObject({ code: "OWNERSHIP_REJECTED" });
  });
  it("rejects requested absolute/path override fields rather than accepting a file API", async () => {
    const f = await fixture(); const { request } = await preparedUpdate(f);
    await expect(f.writer.planExistingLessonUpdate({ ...request, ...{ absolutePath: "/Users/test/file" } })).rejects.toMatchObject({ code: "OWNERSHIP_REJECTED" });
  });
  it("rejects extra logical target fields and duplicate conflicting plan targets", async () => {
    const f = await fixture(); const { plan } = await preparedUpdate(f);
    await expect(checkPlanTargets(f.root, { ...plan, changes: [...plan.changes, plan.changes[0]] })).rejects.toMatchObject({ code: "PREFLIGHT_FAILED" });
    const change = plan.changes[0];
    expect(() => targetPath({ ...change.target, ...{ filename: "arbitrary.json" } })).toThrow("PATH_REJECTED");
    await expect(f.writer.executeExistingLessonUpdate(structuredClone(plan))).rejects.toMatchObject({ code: "PREFLIGHT_FAILED" });
  });
  it("rejects unsupported action/types/hash/serializer/transaction limits", async () => {
    const f = await fixture(); const { plan } = await preparedUpdate(f); const change = plan.changes[0];
    const variations: AuthoringWritePlan[] = [
      { ...plan, changes: Array.from({ length: 4 }, () => change) },
      { ...plan, changes: [{ ...change, nextHash: "wrong" }] },
      { ...plan, changes: [{ ...change, text: "x".repeat(3 * 1024 * 1024) }] },
      { ...plan, changes: [{ ...change, action: "CREATE", previousHash: change.previousHash }] },
    ];
    for (const altered of variations) await expect(checkPlanTargets(f.root, altered)).rejects.toMatchObject({ code: "PREFLIGHT_FAILED" });
  });
  it.each(["directory", "target", "ancestor", "in-root"])("rejects symlink escape or alias at %s", async (kind) => {
    const f = await fixture(); const other = await fixture();
    const relative = kind === "directory" ? "content/learn/lessons/java" : kind === "ancestor" ? "content/learn/subjects" : "content/learn/lessons/java/interfaces.json";
    if (kind === "directory" || kind === "ancestor") {
      const { rename } = await import("node:fs/promises"); await rename(path.join(f.root, relative), path.join(f.root, `${relative}-original`));
    } else await unlink(path.join(f.root, relative));
    await symlink(kind === "in-root" ? path.join(f.root, "content/learn/subjects/java.json") : path.join(other.root, relative), path.join(f.root, relative));
    await expect(checkedPath(f.root, kind === "ancestor" ? `${relative}/java.json` : "content/learn/lessons/java/interfaces.json")).rejects.toMatchObject({ code: "PATH_REJECTED" });
    if (kind !== "in-root") await expect(checkedPath(f.root, `${relative}/new-file.json`, true)).rejects.toMatchObject({ code: "PATH_REJECTED" });
  });
  it("rejects multiply-linked targets and symlink transaction storage", async () => {
    const f = await fixture(); const relative = "content/learn/lessons/java/interfaces.json";
    await link(path.join(f.root, relative), path.join(f.root, "duplicate.json"));
    await expect(checkedPath(f.root, relative)).rejects.toMatchObject({ code: "PATH_REJECTED" });
    await unlink(path.join(f.root, "duplicate.json"));
    const { plan } = await preparedUpdate(f);
    await symlink(path.join(f.root, "content/learn/lessons"), path.join(f.root, "content/learn/.authoring-transactions"));
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "PATH_REJECTED" });
  });
  it.each([["production", "true"], ["development", "false"], ["test", "true"], ["development", "TRUE"], ["development", ""]])("denies %s flag=%s at loader, planner, executor and recovery", async (environment, flag) => {
    const f = await fixture(); const { plan, request } = await preparedUpdate(f); const before = await f.hashes();
    vi.stubEnv("NODE_ENV", environment); vi.stubEnv("AUTHORING_STUDIO_ENABLED", flag);
    await expect(f.writer.loadExistingLesson("java", f.body.lessonId)).rejects.toMatchObject({ code: "WRITE_DISABLED" });
    await expect(f.writer.validateExistingLesson("java", f.body.lessonId, request.draft)).rejects.toMatchObject({ code: "WRITE_DISABLED" });
    await expect(f.writer.planExistingLessonUpdate(request)).rejects.toMatchObject({ code: "WRITE_DISABLED" });
    await expect(f.writer.executeExistingLessonUpdate(plan)).rejects.toMatchObject({ code: "WRITE_DISABLED" });
    await expect(f.writer.recoverAbandonedOperation(plan.operationId, true)).rejects.toMatchObject({ code: "WRITE_DISABLED" });
    expect(await f.hashes()).toEqual(before);
  });
  it("real Atlas content is unchanged by canonical readback and no executor is invoked", async () => {
    const directory = "content";
    async function hashes(relative: string): Promise<Record<string, string>> {
      const entries = await readdir(relative, { withFileTypes: true });
      const result: Record<string, string> = {};
      for (const entry of entries) {
        const next = `${relative}/${entry.name}`;
        if (entry.isDirectory()) Object.assign(result, await hashes(next));
        else result[next] = sha256(await readFile(next));
      }
      return result;
    }
    const before = await hashes(directory);
    const writer = await liveLessonWriter();
    expect((await writer.loadExistingLesson("java", "learn:java:interfaces")).draft.lesson.id).toBe("learn:java:interfaces");
    expect(await hashes(directory)).toEqual(before);
  });
});

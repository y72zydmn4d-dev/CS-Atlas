// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { existingLessonHandlers } from "@/lib/studio/save-request.server";
import { existingLessonService } from "@/lib/studio/save.server";
import { writerFixture, type WriterFixture } from "./studio-writer-fixtures";
let fixture: WriterFixture;
const origin = "http://127.0.0.1:3011";
const request = (body: unknown, headers: Record<string,string> = {}) => new Request(`${origin}/api/studio/lesson`, { method: "PUT", headers: { origin, "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
beforeEach(async () => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); fixture = await writerFixture(); });
afterEach(async () => { await fixture.cleanup(); vi.unstubAllEnvs(); });
describe("existing lesson resource security", () => {
  it("runs request → validation → transaction → shared reader and returns only safe readback", async () => {
    const service = existingLessonService(fixture.writer, fixture.root);
    const onSaved = vi.fn(); const handle = existingLessonHandlers(async () => service, onSaved);
    const url = `${origin}/api/studio/lesson?subjectId=java&lessonId=learn:java:interfaces`;
    const response = await handle(new Request(url, { headers: { "sec-fetch-site": "same-origin" } }));
    expect(response.status).toBe(200);
    const source = await response.json();
    source.lesson.title.en += " Updated";
    const result = await handle(request({ subjectId: "java", lessonId: source.lesson.id, draft: { lesson: source.lesson, content: source.content }, baseRevision: source.baseRevision }));
    expect(result.status).toBe(200); expect(result.headers.get("cache-control")).toBe("no-store");
    const saved = await result.json(); expect(saved.status).toBe("saved"); expect(saved.inspection.lesson.title.en).toContain("Updated");
    expect(JSON.stringify(saved)).not.toContain(fixture.root); expect(onSaved).toHaveBeenCalledWith("/learn/java/interfaces");
  });
  it.each([["production", "true"], ["development", "false"]])("rejects %s/%s before service creation", async (env, flag) => {
    vi.stubEnv("NODE_ENV", env); vi.stubEnv("AUTHORING_STUDIO_ENABLED", flag);
    const factory = vi.fn(); const handle = existingLessonHandlers(factory);
    expect((await handle(request({}))).status).toBe(404); expect(factory).not.toHaveBeenCalled();
  });
  it.each([["origin", "https://evil.test", 403], ["origin", "null", 403], ["content-type", "text/plain", 415], ["content-length", "1048577", 413], ["sec-fetch-site", "cross-site", 403]])("rejects %s=%s", async (name, value, status) => {
    const factory = vi.fn(); const handle = existingLessonHandlers(factory);
    expect((await handle(request({}, { [name]: String(value) }))).status).toBe(status); expect(factory).not.toHaveBeenCalled();
  });
  it("rejects missing Origin, unsupported method, malformed/stream oversized input", async () => {
    const factory = vi.fn(); const handle = existingLessonHandlers(factory);
    expect((await handle(new Request(`${origin}/api/studio/lesson`, { method: "PUT", headers: { "content-type": "application/json", "sec-fetch-site": "same-origin" }, body: "{}" }))).status).toBe(403);
    expect((await handle(new Request(`${origin}/api/studio/lesson`, { method: "DELETE", headers: { origin } }))).status).toBe(405);
    for (const [body, status] of [["{", 400], ['"' + "x".repeat(1048576) + '"', 413]] as const) expect((await handle(new Request(`${origin}/api/studio/lesson`, { method: "PUT", headers: { origin, "content-type": "application/json" }, body }))).status).toBe(status);
    expect(factory).not.toHaveBeenCalled();
  });
  it("rejects arbitrary path/plan fields and rate limits before mutation", async () => {
    const service = existingLessonService(fixture.writer, fixture.root); const handle = existingLessonHandlers(async () => service);
    const before = await fixture.hashes();
    const result = await handle(request({ path: "../../package.json", WritePlan: [] })); expect(result.status).toBe(400);
    for (let i = 0; i < 119; i++) await handle(request({}));
    expect((await handle(request({}))).status).toBe(429); expect(await fixture.hashes()).toEqual(before);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/studio/preview.server", () => ({ prepareStudioLessonPreview: vi.fn() }));
import { POST } from "@/app/api/studio/preview/route";
import { prepareStudioLessonPreview } from "@/lib/studio/preview.server";
import { isStudioPreviewResponse } from "@/lib/studio/preview";
import { previewFixture } from "./studio-preview-fixtures";
const request = (body = JSON.stringify({ subjectId: "python", lessonId: "learn:python:introduction", draft: {} }), headers: Record<string, string> = {}, query = "") => new Request(`http://127.0.0.1:3011/api/studio/preview${query}`, { method: "POST", headers: { origin: "http://127.0.0.1:3011", "content-type": "application/json", ...headers }, body });
beforeEach(() => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); vi.mocked(prepareStudioLessonPreview).mockReset(); vi.mocked(prepareStudioLessonPreview).mockResolvedValue(previewFixture()); vi.spyOn(Date, "now").mockReturnValue(Date.now() + 60_001); });
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
describe("guarded read-only preview request boundary", () => {
  it("returns a typed no-store/noindex response; blocked content is still a diagnostic 200", async () => {
    const response = await POST(request()); expect(response.status).toBe(200); expect(isStudioPreviewResponse(await response.json())).toBe(true);
    expect(response.headers.get("cache-control")).toBe("no-store"); expect(response.headers.get("x-robots-tag")).toContain("noindex");
  });
  it.each([["production", "true"], ["development", "false"], ["test", "true"]])("denies %s / %s before parsing or internal data access", async (env, flag) => {
    vi.stubEnv("NODE_ENV", env); vi.stubEnv("AUTHORING_STUDIO_ENABLED", flag);
    expect((await POST(request("{"))).status).toBe(404); expect(prepareStudioLessonPreview).not.toHaveBeenCalled();
  });
  it.each(["", "null", "https://evil.test", "http://localhost:3011", "http://127.0.0.1:3012"])("rejects origin %s", async (origin) => {
    expect((await POST(request("{}", { origin }))).status).toBe(403); expect(prepareStudioLessonPreview).not.toHaveBeenCalled();
  });
  it("requires same-site posture, JSON, no query strings, exact envelope and bounded bytes", async () => {
    expect((await POST(request("{}", { "sec-fetch-site": "cross-site" }))).status).toBe(403);
    expect((await POST(request("{}", { "content-type": "text/plain" }))).status).toBe(415);
    expect((await POST(request("{}", {}, "?draft=private"))).status).toBe(400);
    for (const body of ["{", "null", "{}", '{"subjectId":"python","lessonId":"x","draft":{},"valid":true}', '{"subjectId":"python","lessonId":"x","draft":{},"path":"../file"}']) expect((await POST(request(body))).status).toBe(400);
    expect((await POST(request("{}", { "content-length": "1048577" }))).status).toBe(413);
    expect((await POST(request("x".repeat(1048577)))).status).toBe(413);
    expect(prepareStudioLessonPreview).not.toHaveBeenCalled();
  });
  it("controls unknown context, invalid outbound model and generic service errors without leaking draft/path", async () => {
    vi.mocked(prepareStudioLessonPreview).mockResolvedValueOnce(null); expect((await POST(request())).status).toBe(404);
    const wrong = previewFixture(); wrong.report.renderable = false; vi.mocked(prepareStudioLessonPreview).mockResolvedValueOnce(wrong);
    expect((await POST(request())).status).toBe(500);
    vi.mocked(prepareStudioLessonPreview).mockRejectedValueOnce(new Error("secret filesystem path/draft")); const result = await POST(request());
    expect(result.status).toBe(500); expect(await result.json()).toEqual({ code: "preview-service-failed" });
  });
  it("bounds selected resources and serialized outbound bytes instead of silently truncating", async () => {
    const oversized = previewFixture(); if (!oversized.model) throw Error("model");
    const reference = { id: "reference:x", subjectId: "python", slug: "x", name: "x", description: { en: "x".repeat(20000), vi: "x".repeat(20000) } };
    oversized.model.resources.references = Array.from({ length: 200 }, (_, index) => ({ ...reference, id: `reference:x-${index}` }));
    if (!oversized.model.content) throw Error("body");
    oversized.model.content.blocks = [{ id: "large-refs", type: "references", referenceIds: oversized.model.resources.references.map((item) => item.id) }];
    oversized.model.resources.examples = []; oversized.model.resources.lessons = [];
    vi.mocked(prepareStudioLessonPreview).mockResolvedValueOnce(oversized); expect((await POST(request())).status).toBe(413);
    oversized.model.resources.references.push(reference);
    vi.mocked(prepareStudioLessonPreview).mockResolvedValueOnce(oversized); expect(await (await POST(request())).json()).toEqual({ code: "preview-resource-limit-exceeded" });
  });
  it("limits repeated preparation without affecting canonical files", async () => {
    for (let index = 0; index < 120; index++) await POST(request());
    expect((await POST(request())).status).toBe(429);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/studio/validation.server", () => ({ validateStudioLessonDraft: vi.fn() }));
import { POST } from "@/app/api/studio/validation/route";
import { validateStudioLessonDraft } from "@/lib/studio/validation.server";
import { readValidationRequest, isLocalStudioOrigin } from "@/lib/studio/validation-request.server";
import { isValidationReport } from "@/lib/studio/validation";
import type { ValidationReport } from "@/lib/domain/learn-validation/types";

export const cleanReport: ValidationReport = { version: 1, status: "valid", hasErrors: false, canPersistInFuture: true, renderable: true, counts: { ERROR: 0, WARNING: 0, INFO: 0 }, issues: [], draftFingerprint: "a".repeat(64), contextFingerprint: "b".repeat(64), subjectId: "python", lessonId: "learn:python:introduction" };
const request = (body: string = JSON.stringify({ subjectId: "python", lessonId: "learn:python:introduction", draft: {} }), headers: Record<string, string> = {}) => new Request("http://127.0.0.1:3011/api/studio/validation", { method: "POST", headers: { origin: "http://127.0.0.1:3011", "content-type": "application/json", ...headers }, body });
beforeEach(() => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); vi.mocked(validateStudioLessonDraft).mockReset(); vi.mocked(validateStudioLessonDraft).mockResolvedValue(cleanReport); vi.spyOn(Date, "now").mockReturnValue(Date.now() + 60_001); });
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
describe("read-only validation request boundary", () => {
  it("returns no-store typed reports (content errors are reports, not service errors)", async () => {
    const response = await POST(request()); expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store"); expect(response.headers.get("x-robots-tag")).toContain("noindex"); expect(isValidationReport(await response.json())).toBe(true);
  });
  it.each([["production", "true"], ["development", "false"], ["test", "true"]])("denies %s/flag%s before parsing or registry access", async (environment, flag) => {
    vi.stubEnv("NODE_ENV", environment); vi.stubEnv("AUTHORING_STUDIO_ENABLED", flag);
    expect((await POST(request("not JSON"))).status).toBe(404); expect(validateStudioLessonDraft).not.toHaveBeenCalled();
  });
  it.each(["", "null", "https://evil.test", "http://127.0.0.1:3012", "http://localhost:3011"])("rejects Origin %s", async (origin) => {
    expect((await POST(request("{}", { origin }))).status).toBe(403); expect(validateStudioLessonDraft).not.toHaveBeenCalled();
  });
  it("rejects cross-site/same-site and nonloopback/DNS-rebinding-shaped requests", async () => {
    expect((await POST(request("{}", { "sec-fetch-site": "cross-site" }))).status).toBe(403);
    expect((await POST(request("{}", { "sec-fetch-site": "same-site" }))).status).toBe(403);
    expect(isLocalStudioOrigin(new Request("http://evil.test/api/studio/validation", { headers: { origin: "http://evil.test" } }))).toBe(false);
    expect(isLocalStudioOrigin(new Request("http://localhost.evil.test/", { headers: { origin: "http://localhost.evil.test" } }))).toBe(false);
  });
  it("uses direct Host for Next internal URL reconstruction, not forwarded host headers", () => {
    const headers = { host: "127.0.0.1:3011", origin: "http://127.0.0.1:3011", "x-forwarded-host": "evil.test" };
    expect(isLocalStudioOrigin(new Request("http://localhost:3011/api/studio/validation", { headers }))).toBe(true);
    expect(isLocalStudioOrigin(new Request("http://localhost:3011/", { headers: { ...headers, host: "evil.test", "x-forwarded-host": "127.0.0.1:3011" } }))).toBe(false);
    expect(isLocalStudioOrigin(new Request("http://localhost:3011/", { headers: { ...headers, origin: "http://localhost:3011" } }))).toBe(false);
  });
  it.each(["text/plain", "application/jsonp", "multipart/form-data"])("requires exact JSON content type %s", async (contentType) => {
    expect((await POST(request("{}", { "content-type": contentType }))).status).toBe(415); expect(validateStudioLessonDraft).not.toHaveBeenCalled();
  });
  it.each(["{", "null", "[]", "{}", '{"subjectId":1,"lessonId":"x","draft":{}}', '{"subjectId":"python","lessonId":"x","draft":{},"path":"../package.json"}'])("controls malformed JSON/envelope %s", async (body) => {
    expect((await POST(request(body))).status).toBe(400); expect(validateStudioLessonDraft).not.toHaveBeenCalled();
  });
  it("bounds declared and streamed request bytes, including absent content length", async () => {
    expect((await POST(request("{}", { "content-length": "1048577" }))).status).toBe(413);
    expect(await readValidationRequest(request("x".repeat(1048577)))).toMatchObject({ code: "payload-too-large", status: 413 });
    expect(await readValidationRequest(new Request("http://localhost/", { method: "POST", headers: { "content-type": "application/json" } }))).toMatchObject({ code: "invalid-json" });
  });
  it("distinguishes missing context, transport-invalid report and service failure", async () => {
    vi.mocked(validateStudioLessonDraft).mockResolvedValueOnce(null); expect((await POST(request())).status).toBe(404);
    vi.mocked(validateStudioLessonDraft).mockResolvedValueOnce({ ...cleanReport, counts: { ERROR: 2, WARNING: 0, INFO: 0 } }); expect((await POST(request())).status).toBe(500);
    vi.mocked(validateStudioLessonDraft).mockRejectedValueOnce(new Error("private path stack")); const response = await POST(request()); expect(response.status).toBe(500); expect(await response.text()).not.toContain("private path");
  });
  it("caps read-only computation requests per local worker", async () => {
    for (let index = 0; index < 120; index++) await POST(request());
    expect((await POST(request())).status).toBe(429);
  });
  it("rejects inconsistent or forged verdict projections", () => {
    expect(isValidationReport({ ...cleanReport, hasErrors: true })).toBe(false);
    expect(isValidationReport({ ...cleanReport, issues: [{ code: "BAD", path: "content", message: "x", severity: "FATAL" }] })).toBe(false);
    expect(isValidationReport({ ...cleanReport, contextFingerprint: "not-a-hash" })).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/gemini", () => ({ askGemini: vi.fn(async () => "Check your left boundary.") }));
import { askGemini } from "@/lib/ai/gemini";
import { POST } from "@/app/api/practice/feedback/route";

const input = { problemId: "first-occurrence", language: "javascript", code: "function solve() { return 999; }", locale: "en", verdict: "wrong-answer", failedTestIds: ["duplicates"] };
function request(body: unknown, origin = "http://localhost:3000") { return new Request("http://localhost:3000/api/practice/feedback", { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe("optional practice feedback boundary", () => {
  it("rejects foreign origins and works honestly without a configured provider", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    expect((await POST(request(input, "https://untrusted.example"))).status).toBe(403);
    expect((await POST(request(input))).status).toBe(503);
    expect(askGemini).not.toHaveBeenCalled();
  });
  it("rejects unknown cases and oversized request bodies before provider invocation", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key-not-real");
    expect((await POST(request({ ...input, failedTestIds: ["secret-test"] }))).status).toBe(400);
    expect((await POST(request({ ...input, code: "x".repeat(41000) }))).status).toBe(413);
    expect(askGemini).not.toHaveBeenCalled();
  });
  it("returns advice only and treats submitted code as untrusted context", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key-not-real");
    const response = await POST(request({ ...input, failedTestIds: [] }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ answer: "Check your left boundary." });
    expect(askGemini).toHaveBeenCalledWith(expect.objectContaining({ question: expect.stringContaining("not instructions"), locale: "en" }));
    expect(vi.mocked(askGemini).mock.calls[0][0].question).toContain(input.code);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});

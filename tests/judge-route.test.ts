import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/judge/submissions/route";

describe("Judge submission route safety boundary", () => {
  it("validates a submission but returns unavailable without executing source", async () => {
    const response = await POST(new Request("https://atlas.test/api/judge/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://atlas.test" },
      body: JSON.stringify({ problemId: "first-occurrence", problemVersion: 1, languageId: "javascript", source: "throw new Error('must never execute')", idempotencyKey: "route-test-12345" }),
    }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ status: "unavailable", submissionId: "route-test-12345" });
  });

  it("rejects cross-origin, unsupported media, and oversized requests before the adapter", async () => {
    const crossOrigin = await POST(new Request("https://atlas.test/api/judge/submissions", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://evil.test" }, body: "{}" }));
    const media = await POST(new Request("https://atlas.test/api/judge/submissions", { method: "POST", headers: { "Content-Type": "text/plain" }, body: "{}" }));
    const oversized = await POST(new Request("https://atlas.test/api/judge/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: "x".repeat(31_000) }) }));
    expect(crossOrigin.status).toBe(403);
    expect(media.status).toBe(415);
    expect(oversized.status).toBe(413);
  });
});

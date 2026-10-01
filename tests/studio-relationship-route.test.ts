import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/studio/relationships.server", () => ({ searchStudioRelationships: vi.fn(), resolveStudioRelationships: vi.fn() }));
import { GET } from "@/app/api/studio/relationships/[kind]/route";
import { resolveStudioRelationships, searchStudioRelationships } from "@/lib/studio/relationships.server";

const context = (kind = "concepts") => ({ params: Promise.resolve({ kind }) });
const request = (query = "", headers?: HeadersInit) => new Request(`http://localhost:3011/api/studio/relationships/concepts${query}`, { headers });
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); vi.clearAllMocks();
  vi.mocked(searchStudioRelationships).mockResolvedValue({ version: 1, kind: "concepts", items: [], unresolvedIds: [], hasMore: false });
  vi.mocked(resolveStudioRelationships).mockResolvedValue({ version: 1, kind: "concepts", items: [], unresolvedIds: ["missing"], hasMore: false });
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("read-only Studio search route", () => {
  it.each(["production", "test"])("returns hard404 in %s before any registry operation even with flag=true", async (environment) => {
    vi.stubEnv("NODE_ENV", environment);
    expect((await GET(request(), context())).status).toBe(404);
    expect(searchStudioRelationships).not.toHaveBeenCalled(); expect(resolveStudioRelationships).not.toHaveBeenCalled();
  });
  it("returns hard404 in disabled dev", async () => {
    vi.stubEnv("AUTHORING_STUDIO_ENABLED", "false");
    expect((await GET(request(), context())).status).toBe(404); expect(searchStudioRelationships).not.toHaveBeenCalled();
  });
  it("returns only validated no-store projections", async () => {
    const result = await GET(request("?q=recursion"), context());
    expect(result.status).toBe(200); expect(result.headers.get("Cache-Control")).toBe("no-store");
    expect(searchStudioRelationships).toHaveBeenCalledExactlyOnceWith("concepts", "recursion");
  });
  it("dispatches explicit ID lookup without accepting a raw registry object or path", async () => {
    expect((await GET(request("?id=missing"), context())).status).toBe(200);
    expect(resolveStudioRelationships).toHaveBeenCalledExactlyOnceWith("concepts", ["missing"]);
    expect(searchStudioRelationships).not.toHaveBeenCalled();
  });
  it.each(["?path=../../package.json", "?q=a&q=b", "?id=a&q=b", "?id=", `?q=${"x".repeat(121)}`, `?${Array.from({ length: 41 }, () => "id=a").join("&")}`])("rejects malformed/broad query %s before registry access", async (query) => {
    expect((await GET(request(query), context())).status).toBe(400); expect(searchStudioRelationships).not.toHaveBeenCalled(); expect(resolveStudioRelationships).not.toHaveBeenCalled();
  });
  it("rejects unknown registry kinds", async () => {
    expect((await GET(request(), context("write-file"))).status).toBe(404); expect(searchStudioRelationships).not.toHaveBeenCalled();
  });
  it.each(["origin", "sec-fetch-site"])("rejects cross-origin browser requests (%s)", async (key) => {
    expect((await GET(request("", [[key, key === "origin" ? "https://evil.example" : "cross-site"]]), context())).status).toBe(403); expect(searchStudioRelationships).not.toHaveBeenCalled();
  });
  it("returns stable errors without raw failure details", async () => {
    vi.mocked(searchStudioRelationships).mockRejectedValue(new Error("private filesystem details"));
    const result = await GET(request(), context());
    expect(result.status).toBe(500); expect(await result.text()).not.toContain("private");
  });
  it("bounds request rate with a fixed local-worker window", async () => {
    vi.useFakeTimers(); vi.setSystemTime(Date.now() + 120_000);
    for (let index = 0; index < 600; index++) expect((await GET(request(), context())).status).toBe(200);
    expect((await GET(request(), context())).status).toBe(429);
    expect(searchStudioRelationships).toHaveBeenCalledTimes(600);
    vi.setSystemTime(Date.now() + 60_000);
    expect((await GET(request(), context())).status).toBe(200);
  });
});

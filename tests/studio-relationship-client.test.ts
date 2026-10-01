import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveStudioOptions, searchStudioOptions } from "@/lib/studio/relationship-client";
import { fixtureSearch } from "@/tests/studio-relationship-fixtures";

afterEach(() => vi.unstubAllGlobals());
describe("Studio read-only relationship transport", () => {
  it("only issues cancellable same-origin GETs with encoded query and validated projections", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json(await fixtureSearch("concepts", "")));
    vi.stubGlobal("fetch", fetcher);
    const signal = new AbortController().signal;
    await searchStudioOptions("concepts", "recursion & aliases", signal);
    expect(fetcher).toHaveBeenCalledExactlyOnceWith("/api/studio/relationships/concepts?q=recursion+%26+aliases", { method: "GET", cache: "no-store", signal });
  });
  it("batches more than40 selected IDs without dropping unknowns or making one request per item", async () => {
    const fetcher = vi.fn().mockImplementation(async (path: string) => {
      const ids = new URL(path, "http://localhost").searchParams.getAll("id");
      return Response.json({ version: 1, kind: "concepts", items: [], unresolvedIds: ids, hasMore: false });
    });
    vi.stubGlobal("fetch", fetcher);
    const ids = Array.from({ length: 81 }, (_, index) => `missing:${index}`);
    expect((await resolveStudioOptions("concepts", [...ids, ids[0]], new AbortController().signal)).unresolvedIds).toEqual(ids);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
  it("rejects HTTP failure and malformed/wrong-kind payloads", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response("", { status: 404 })).mockResolvedValueOnce(Response.json({ version: 1, kind: "problems", items: [], unresolvedIds: [], hasMore: false }));
    vi.stubGlobal("fetch", fetcher);
    await expect(searchStudioOptions("concepts", "", new AbortController().signal)).rejects.toThrow();
    await expect(searchStudioOptions("concepts", "", new AbortController().signal)).rejects.toThrow();
  });
});

// @vitest-environment node
import { performance } from "node:perf_hooks";
import { describe, expect, it } from "vitest";
import { domains, searchIndex } from "@/content";
import { LIBRARY_CONFIG } from "@/lib/library/config";
import { extractDocument } from "@/lib/library/extraction";
import { projectPublicSearchDocuments, searchDocuments } from "@/lib/search/documents";

describe("release performance budgets", () => {
  it("keeps public search projection bounded and responsive", () => {
    const documents = projectPublicSearchDocuments(searchIndex);
    const serializedBytes = Buffer.byteLength(JSON.stringify(documents));
    const samples: number[] = [];
    for (let iteration = 0; iteration < 30; iteration += 1) {
      const startedAt = performance.now();
      for (const query of ["binary search", "độ phức tạp", "gradient descent", "transformers", "arrays"]) searchDocuments({ query, locale: "en", limit: 20, includeLocalPrivate: false }, documents);
      samples.push(performance.now() - startedAt);
    }
    samples.sort((a, b) => a - b);
    const p95Milliseconds = samples[Math.floor(samples.length * 0.95)] ?? Number.POSITIVE_INFINITY;
    process.stdout.write(`[performance] search-documents=${documents.length} serialized-bytes=${serializedBytes} five-query-p95-ms=${p95Milliseconds.toFixed(2)}\n`);
    expect(serializedBytes).toBeLessThan(5_000_000);
    expect(p95Milliseconds).toBeLessThan(100);
  });

  it("keeps authored learning graphs within interactive bounds", () => {
    const maxRoadmapNodes = Math.max(...domains.map((domain) => domain.roadmap.nodes.length));
    const maxRoadmapEdges = Math.max(...domains.map((domain) => domain.roadmap.edges.length));
    const maxMindMapNodes = Math.max(...domains.map((domain) => domain.mindMap.nodes.length));
    const maxMindMapEdges = Math.max(...domains.map((domain) => domain.mindMap.edges.length));
    process.stdout.write(`[performance] graph-max roadmap=${maxRoadmapNodes}/${maxRoadmapEdges} mindmap=${maxMindMapNodes}/${maxMindMapEdges}\n`);
    expect(Math.max(maxRoadmapNodes, maxMindMapNodes)).toBeLessThanOrEqual(100);
    expect(Math.max(maxRoadmapEdges, maxMindMapEdges)).toBeLessThanOrEqual(200);
  });

  it("caps extraction output and measures a worst-case text pass", async () => {
    const input = "x".repeat(LIBRARY_CONFIG.maxExtractedCharacters + 50_000);
    const heapBefore = process.memoryUsage().heapUsed;
    const startedAt = performance.now();
    const result = await extractDocument(new File([input], "budget.txt", { type: "text/plain" }));
    const durationMilliseconds = performance.now() - startedAt;
    const heapDeltaBytes = Math.max(0, process.memoryUsage().heapUsed - heapBefore);
    process.stdout.write(`[performance] extraction-input-bytes=${input.length} output-chars=${result.text.length} heap-delta-bytes=${heapDeltaBytes} duration-ms=${durationMilliseconds.toFixed(2)}\n`);
    expect(result).toMatchObject({ status: "partial" });
    expect(result.text).toHaveLength(LIBRARY_CONFIG.maxExtractedCharacters);
    expect(heapDeltaBytes).toBeLessThan(64 * 1024 * 1024);
    expect(durationMilliseconds).toBeLessThan(1_000);
  });
});

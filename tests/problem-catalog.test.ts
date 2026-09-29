import { describe, expect, it } from "vitest";
import { concepts, problems, validateContent } from "@/content";
import { matchesProblemCatalogFilters, validateProblemCatalog } from "@/lib/problems/catalog";

describe("canonical Problem catalog", () => {
  it("validates authored metadata, publication policy, and canonical links", () => {
    expect(validateProblemCatalog(problems, new Set(concepts.map((concept) => concept.id)))).toEqual([]);
    expect(validateContent()).toEqual([]);
    for (const problem of problems) {
      expect(problem.rating).toBeGreaterThan(0);
      expect(problem.publicExampleIds).toHaveLength(problem.publicTestCount);
      expect(problem.lessonIds.length).toBeGreaterThan(0);
      expect(problem.roadmapIds.length).toBeGreaterThan(0);
      expect(problem.publication).toEqual({ hints: "public", editorial: "public-complexity-guidance", referenceSolution: "server-only", discussion: "unavailable" });
    }
  });

  it("filters localized text, tags, ratings, canonical Concepts, and runtime modes", () => {
    const first = problems.find((problem) => problem.id === "first-occurrence");
    expect(first).toBeDefined();
    if (!first) return;
    expect(matchesProblemCatalogFilters(first, { query: "vi tri xuat hien", tag: "binary-search", rating: "under-1000", conceptId: "topic:searching", language: "javascript" }, "vi")).toBe(true);
    expect(matchesProblemCatalogFilters(first, { rating: "1400-plus" }, "en")).toBe(false);
    expect(matchesProblemCatalogFilters(first, { language: "python" }, "en")).toBe(true);
  });
});

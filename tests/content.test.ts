import { describe, expect, it } from "vitest";
import { algorithms, domains, searchIndex, sources, techniques, topics, validateContent } from "@/content";

describe("content registry", () => {
  it("has valid relationships", () => expect(validateContent()).toEqual([]));
  it("covers the requested atlas surface", () => {
    expect(domains).toHaveLength(10);
    expect(topics.length).toBeGreaterThanOrEqual(70);
    expect(algorithms).toHaveLength(10);
    expect(techniques).toHaveLength(20);
    expect(searchIndex.length).toBeGreaterThan(domains.length + topics.length + algorithms.length + techniques.length + 11);
    expect(sources).toHaveLength(4);
  });
  it("gives every domain distinct roadmap and mind-map models", () => {
    for (const domain of domains) {
      expect(domain.roadmap.nodes.length).toBeGreaterThan(1);
      expect(domain.mindMap.nodes.length).toBeGreaterThan(2);
      expect(domain.roadmap).not.toEqual(domain.mindMap);
    }
  });
  it("ships reference-quality vertical slices", () => {
    for (const id of ["complexity-analysis", "gradient-descent", "linear-regression"]) {
      const topic = topics.find((item) => item.id === id);
      expect(topic?.revision.contentLevel).toBe("Reference-quality");
      expect(topic?.content.length).toBeGreaterThanOrEqual(12);
      expect(topic?.content.filter((block) => block.type === "exercise").length).toBeGreaterThanOrEqual(3);
    }
  });
});

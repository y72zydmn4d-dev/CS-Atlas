import { describe, expect, it } from "vitest";
import { searchIndex } from "@/content";
import { searchContent } from "@/lib/search";

describe("searchContent", () => {
  it("prioritizes exact title matches", () => {
    expect(searchContent("binary search", searchIndex)[0]).toMatchObject({ title: "Binary Search", type: "Algorithm" });
  });
  it("searches hierarchy and keywords", () => {
    const results = searchContent("machine learning generalization", searchIndex);
    expect(results.some((item) => item.title === "Model Evaluation")).toBe(true);
  });
  it("requires every query term", () => {
    expect(searchContent("gradient descent", searchIndex).every((item) => `${item.title} ${item.keywords}`.toLowerCase().includes("gradient") || item.hierarchy.toLowerCase().includes("gradient"))).toBe(true);
  });
});

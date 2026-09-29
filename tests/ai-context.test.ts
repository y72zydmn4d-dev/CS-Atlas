import { describe, expect, it } from "vitest";
import { normalizeAiText, retrieveAtlasSources } from "@/lib/ai/context";

describe("Atlas AI context", () => {
  it("normalizes Vietnamese accents for retrieval", () => {
    expect(normalizeAiText("Độ phức tạp thuật toán")).toBe("do phuc tap thuat toan");
  });
  it("retrieves a matching algorithm with a valid link", () => {
    expect(retrieveAtlasSources("How does binary search work?")[0]).toMatchObject({ title: "Binary Search", href: "/algorithms/binary-search" });
  });
  it("returns no arbitrary sources for an unrelated question", () => {
    expect(retrieveAtlasSources("quasar jellyfish metallurgy")).toEqual([]);
  });
  it("limits the amount of context sent to Gemini", () => {
    expect(retrieveAtlasSources("machine learning", 3)).toHaveLength(3);
  });
});

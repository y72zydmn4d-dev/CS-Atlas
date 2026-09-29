import { describe, expect, it } from "vitest";
import { calculateProgress, deriveStatus, sanitizeProgress } from "@/lib/progress";

describe("progress utilities", () => {
  it("weights in-progress work at half", () => expect(calculateProgress(["a", "b"], { a: "completed", b: "in-progress" })).toBe(75));
  it("derives aggregate status", () => {
    expect(deriveStatus(["a"], {})).toBe("not-started");
    expect(deriveStatus(["a", "b"], { a: "completed" })).toBe("in-progress");
    expect(deriveStatus(["a", "b"], { a: "completed", b: "completed" })).toBe("completed");
  });
  it("removes corrupted stored values", () => expect(sanitizeProgress({ a: "completed", b: "broken", c: 5 })).toEqual({ a: "completed" }));
});

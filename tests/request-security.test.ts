import { describe, expect, it } from "vitest";
import { hasJsonContentType, isSameOriginRequest } from "@/lib/http/request-security";

describe("shared API request security", () => {
  it("compares normalized URL origins instead of trusting Host", () => {
    expect(isSameOriginRequest(new Request("https://atlas.test/api", { headers: { Origin: "https://atlas.test" } }))).toBe(true);
    expect(isSameOriginRequest(new Request("https://atlas.test/api", { headers: { Origin: "https://atlas.test:444" } }))).toBe(false);
    expect(isSameOriginRequest(new Request("https://atlas.test/api", { headers: { Origin: "not a URL" } }))).toBe(false);
  });

  it("accepts JSON media types with parameters only", () => {
    expect(hasJsonContentType(new Request("https://atlas.test/api", { headers: { "Content-Type": "application/json; charset=utf-8" } }))).toBe(true);
    expect(hasJsonContentType(new Request("https://atlas.test/api", { headers: { "Content-Type": "text/plain" } }))).toBe(false);
  });
});

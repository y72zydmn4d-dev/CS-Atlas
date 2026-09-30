import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
// Installed Next16 still exports this helper under its old name.
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config, proxy } from "@/proxy";

afterEach(() => vi.unstubAllEnvs());

describe("Studio pre-render request guard", () => {
  it.each([["production", "true"], ["development", undefined], ["development", "false"], ["test", "true"]])("returns an uncacheable hard404 for %s with flag %s", async (environment, flag) => {
    vi.stubEnv("NODE_ENV", environment);
    vi.stubEnv("AUTHORING_STUDIO_ENABLED", flag);
    const response = proxy();
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(await response.text()).toBe("Not found");
  });

  it("passes explicitly enabled development through to the guarded route", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true");
    expect(proxy().headers.get("x-middleware-next")).toBe("1");
  });

  it.each(["/studio", "/studio?subject=python", "/studio/unknown"])("matches Studio only: %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true);
  });

  it.each(["/", "/home", "/learn", "/learn/python", "/practice", "/api/ai/ask", "/_next/static/x.js", "/backgrounds/cs-atlas-aurora.webp", "/studio-other"])("does not intercept %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(false);
  });
});

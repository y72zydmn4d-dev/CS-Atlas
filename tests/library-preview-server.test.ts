// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { fetchLinkPreview } from "@/lib/library/link-preview-server";
import { POST } from "@/app/api/library/link-preview/route";

describe("server-side preview fetch boundaries", () => {
  it("rejects a redirect to loopback before making the second request", async () => {
    const loader = vi.fn(async () => ({ status: 302, location: "http://127.0.0.1/admin", html: "" }));
    await expect(fetchLinkPreview("https://example.com", loader)).rejects.toThrow("unsafe-host");
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("accepts a public redirect and extracts metadata from HTML", async () => {
    const loader = vi.fn().mockResolvedValueOnce({ status: 302, location: "/article", html: "" }).mockResolvedValueOnce({ status: 200, html: '<html><head><meta property="og:title" content="The article"><meta property="og:image" content="/cover.jpg"></head></html>' });
    const result = await fetchLinkPreview("https://example.com", loader);
    expect(result.preview.title).toBe("The article");
    expect(result.preview.imageUrl).toBe("https://example.com/cover.jpg");
    expect(loader.mock.calls[1][0].pathname).toBe("/article");
  });

  it("rejects redirect loops and excessive chains", async () => {
    const loader = vi.fn(async () => ({ status: 302, location: "/same", html: "" }));
    await expect(fetchLinkPreview("https://example.com/same", loader)).rejects.toThrow("redirect-loop");
  });

  it("rejects unsafe URL requests at the public route without fetching them", async () => {
    const response = await POST(new Request("http://localhost/api/library/link-preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: "http://169.254.169.254/latest/meta-data/" }) }));
    expect(response.status).toBe(400);
    expect((await response.json()).errorCode).toBe("unsafe-host");
  });

  it("rejects foreign origins and non-JSON requests", async () => {
    const foreign = await POST(new Request("http://localhost/api/library/link-preview", { method: "POST", headers: { Origin: "https://evil.example", "Content-Type": "application/json" }, body: "{}" }));
    const media = await POST(new Request("http://localhost/api/library/link-preview", { method: "POST", headers: { "Content-Type": "text/plain" }, body: "{}" }));
    expect(foreign.status).toBe(403);
    expect(media.status).toBe(415);
    expect(foreign.headers.get("Cache-Control")).toBe("no-store");
  });

  it("rejects oversized request bodies before parsing them", async () => {
    const response = await POST(new Request("http://localhost/api/library/link-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com", padding: "x".repeat(5_000) }),
    }));
    expect(response.status).toBe(413);
    expect((await response.json()).errorCode).toBe("request-too-large");
  });
});

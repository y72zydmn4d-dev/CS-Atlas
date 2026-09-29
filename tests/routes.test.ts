import { describe, expect, it } from "vitest";
import { capabilities } from "@/lib/capabilities";
import { breadcrumbMessageKey, metadataForRoute, routePresentationForPath, routePresentations } from "@/lib/routes";

describe("route presentation registry", () => {
  it("owns unique paths and references available capabilities", () => {
    expect(new Set(routePresentations.map((route) => route.path)).size).toBe(routePresentations.length);
    const capabilityIds = new Set(capabilities.map((capability) => capability.id));
    expect(routePresentations.every((route) => capabilityIds.has(route.capability))).toBe(true);
  });

  it("uses the most specific presentation for nested routes", () => {
    expect(routePresentationForPath("/library/import")?.id).toBe("libraryImport");
    expect(routePresentationForPath("/library/item-1")?.id).toBe("library");
    expect(routePresentationForPath("/problems/sorted-pair")?.id).toBe("problems");
  });

  it("shares metadata and breadcrumb labels from one typed registry", () => {
    expect(metadataForRoute("profile")).toMatchObject({ title: "Profile", description: expect.stringContaining("Private") });
    expect(breadcrumbMessageKey("Roadmaps")).toBe("navigation.roadmaps");
    expect(breadcrumbMessageKey("Dynamic title")).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { resolveCanonicalLibraryRelation } from "@/lib/library/concept-relations";

describe("Library canonical relation adapter", () => {
  it("resolves current topic relations without rewriting the stored relation", () => {
    expect(resolveCanonicalLibraryRelation({ entityType: "topic", entityId: "arrays", relation: "supplementary" })).toMatchObject({ status: "resolved", conceptId: "topic:arrays", legacy: { entityId: "arrays" } });
  });

  it("retains non-concept records as legacy references", () => {
    expect(resolveCanonicalLibraryRelation({ entityType: "project", entityId: "route-planner", relation: "reference" })).toMatchObject({ status: "legacy", reason: "not-a-concept" });
  });

  it("accepts a direct canonical concept relation for new records", () => {
    expect(resolveCanonicalLibraryRelation({ entityType: "concept", entityId: "topic:arrays", relation: "reference" })).toMatchObject({ status: "resolved", conceptId: "topic:arrays" });
  });
});

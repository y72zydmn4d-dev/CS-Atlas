import { describe, expect, it } from "vitest";
import { canonicalLibraryEntityReference, matchesLibraryEntity, parseLibraryEntityReference, resolveCanonicalLibraryRelation } from "@/lib/library/concept-relations";

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

  it("matches canonical and source-qualified legacy relations in either direction", () => {
    const legacy = { entityType: "topic" as const, entityId: "arrays", relation: "reference" as const };
    const canonical = { entityType: "concept" as const, entityId: "topic:arrays" };
    expect(matchesLibraryEntity(legacy, canonical)).toBe(true);
    expect(matchesLibraryEntity({ ...canonical, relation: "reference" }, { entityType: "topic", entityId: "arrays" })).toBe(true);
    expect(matchesLibraryEntity(legacy, { entityType: "concept", entityId: "topic:linked-lists" })).toBe(false);
  });

  it("parses canonical entity filters without truncating namespaced IDs", () => {
    expect(parseLibraryEntityReference("concept:topic:arrays")).toEqual({ entityType: "concept", entityId: "topic:arrays" });
    expect(parseLibraryEntityReference("unknown:arrays")).toBeNull();
    expect(canonicalLibraryEntityReference({ entityType: "topic", entityId: "arrays" })).toEqual({ entityType: "concept", entityId: "topic:arrays" });
  });
});

import { describe, expect, it } from "vitest";
import { conceptRelations, conceptValidationIssues, concepts, resolveConcept, validateContent } from "@/content";
import { conceptGraphService } from "@/lib/concepts/service";
import { atlasEntities, buildAtlasModel } from "@/lib/atlas-model";

describe("canonical concept registry", () => {
  it("maps the current registries to unique concepts with valid typed relations", () => {
    expect(conceptValidationIssues).toEqual([]);
    expect(validateContent()).toEqual([]);
    expect(concepts.some((concept) => concept.id === "algorithm:binary-search")).toBe(true);
    expect(conceptRelations.some((relation) => relation.type === "PREREQUISITE_OF" && relation.targetConceptId === "algorithm:binary-search")).toBe(true);
  });

  it("resolves only canonical IDs and type-qualified slugs", () => {
    expect(resolveConcept("algorithm:binary-search")?.slug).toBe("algorithm-binary-search");
    expect(resolveConcept("algorithm-binary-search")?.id).toBe("algorithm:binary-search");
    expect(resolveConcept("arrays")).toBeNull();
  });

  it("returns bounded neighborhoods and projects Atlas topics through canonical routes", () => {
    const graph = conceptGraphService.getNeighborhood({ conceptId: "algorithm:binary-search", depth: 2, limit: 12 });
    expect(graph.concepts.map((concept) => concept.id)).toContain("topic:arrays");
    expect(graph.concepts.length).toBeGreaterThan(1);
    expect(graph.concepts.length).toBeLessThanOrEqual(12);
    expect(atlasEntities("en").find((item) => item.entityId === "arrays")?.href).toBe("/concepts/topic-arrays");
    expect(buildAtlasModel("en", "data-structures-algorithms").edges.some((edge) => edge.kind === "prerequisite")).toBe(true);
  });
});

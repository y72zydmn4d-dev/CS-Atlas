import { describe, expect, it } from "vitest";
import { algorithms, concepts, domains, exercises, problems, techniques, topics, validateContent } from "@/content";
import { legacyConceptCollisions, legacyConceptMappings, resolveLegacyConceptMapping } from "@/content/concepts/legacy-map";
import { resolveConcept } from "@/content/concepts/registry";
import { getConceptGraphView, validateConceptGraphView, validateRoadmapPrerequisiteOrder } from "@/lib/concepts/views";

describe("canonical Concept migration parity", () => {
  it("maps every source-qualified legacy entity without merging raw ID collisions", () => {
    expect(legacyConceptMappings).toHaveLength(topics.length + algorithms.length + techniques.length);
    expect(new Set(legacyConceptMappings.map((item) => `${item.kind}:${item.legacyId}`)).size).toBe(legacyConceptMappings.length);
    expect(new Set(legacyConceptMappings.map((item) => item.conceptId)).size).toBe(legacyConceptMappings.length);
    expect(concepts).toHaveLength(legacyConceptMappings.length);
    expect(legacyConceptCollisions).toContainEqual({ legacyId: "two-pointers", conceptIds: ["algorithm:two-pointers", "technique:two-pointers"] });
  });

  it("keeps both legacy and canonical destinations resolvable from the mapping", () => {
    for (const mapping of legacyConceptMappings) {
      const concept = resolveConcept(mapping.conceptId);
      expect(concept).toMatchObject({ id: mapping.conceptId, slug: mapping.canonicalSlug, kind: mapping.kind });
      expect(mapping.legacyHref).toMatch(new RegExp(`^/${mapping.kind === "topic" ? "topics" : `${mapping.kind}s`}/`));
      expect(mapping.canonicalHref).toBe(`/concepts/${concept?.slug}`);
      expect(resolveLegacyConceptMapping(mapping.kind, mapping.legacyId)).toEqual(mapping);
      expect(resolveLegacyConceptMapping(mapping.kind, mapping.legacySlug)).toEqual(mapping);
    }
  });

  it("preserves authored relations, citations, graph references, exercises, and problems", () => {
    expect(validateContent()).toEqual([]);
    for (const domain of domains) {
      for (const kind of ["roadmap", "mindmap"] as const) {
        const view = getConceptGraphView(domain, kind);
        expect(validateConceptGraphView(view)).toEqual([]);
        expect(validateRoadmapPrerequisiteOrder(view)).toEqual([]);
        for (const node of view.nodes.filter((item) => item.topicId)) {
          expect(resolveConcept(node.conceptId ?? "")).not.toBeNull();
          expect(node.canonicalName).toBeDefined();
          expect(node.href).toMatch(/^\/concepts\//);
          expect("label" in node).toBe(false);
        }
      }
    }
    for (const exercise of exercises) for (const conceptId of exercise.conceptIds) expect(resolveConcept(conceptId)).not.toBeNull();
    for (const problem of problems) for (const conceptId of problem.conceptIds) expect(resolveConcept(conceptId)).not.toBeNull();
  });
});

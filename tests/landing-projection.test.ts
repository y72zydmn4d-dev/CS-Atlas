import { describe, expect, it } from "vitest";
import { knowledgePreview } from "@/content/landing/knowledge-preview";
import { conceptGraphService } from "@/lib/concepts/service";
import { buildLandingProjection } from "@/lib/concepts/landing-projection";

describe("bounded public knowledge projection", () => {
  it("resolves all names, URLs and semantic edges from canonical records", () => {
    const result = buildLandingProjection(conceptGraphService, knowledgePreview);
    expect(result.nodes).toHaveLength(12);
    expect(result.edges).toHaveLength(13);
    expect(Buffer.byteLength(JSON.stringify(result))).toBeLessThan(12 * 1024);
    for (const node of result.nodes) {
      const concept = conceptGraphService.getConcept(node.id);
      expect(node.name).toEqual(concept?.name);
      expect(node.href).toBe(`/concepts/${concept?.slug}`);
      expect(node.summary.en.length).toBeLessThanOrEqual(140);
    }
    expect(result.nodes.filter((node) => node.compact)).toHaveLength(8);
    expect(result.nodes.filter((node) => node.tablet)).toHaveLength(6);
  });
  it("rejects duplicate/missing concepts, edges, invalid coordinates and invented relationships", () => {
    const invalid = [
      { ...knowledgePreview, nodes: [...knowledgePreview.nodes.slice(0,11), knowledgePreview.nodes[0]] },
      { ...knowledgePreview, nodes: [{ id: "topic:missing", rank: "anchor" as const, wide: [42,42] as const }] },
      { ...knowledgePreview, relations: [knowledgePreview.relations[0], knowledgePreview.relations[0]] },
      { ...knowledgePreview, relations: [{ source: "topic:python", target: "topic:python", type: "RELATED_TO" as const, routes: {} }] },
      { ...knowledgePreview, relations: [{ source: "topic:arrays", target: "topic:linear-algebra", type: "PREREQUISITE_OF" as const, routes: {} }] },
      { ...knowledgePreview, relations: [{ ...knowledgePreview.relations[0], routes: {} }] },
      { ...knowledgePreview, relations: [{ ...knowledgePreview.relations[0], routes: { wide: { sourceSide: "right" as const, targetSide: "left" as const, controls: [[-1,24],[200,24]] as const } } }] },
      { ...knowledgePreview, nodes: [{ ...knowledgePreview.nodes[0], wide: [-10,42] as const }] },
    ];
    for (const presentation of invalid) expect(() => buildLandingProjection(conceptGraphService,presentation)).toThrow();
  });
});

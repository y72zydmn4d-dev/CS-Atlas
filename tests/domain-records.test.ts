import { describe, expect, it } from "vitest";
import { domains, exercises, lessonReferences, lessons, problems, resources } from "@/content";
import { getConceptGraphView, type MindMapRecord, type RoadmapRecord } from "@/lib/concepts/views";
import { deriveLocalMastery } from "@/lib/domain/learning";

describe("cross-feature canonical records", () => {
  it("keeps Roadmap and MindMap records semantically distinct", () => {
    const domain = domains[0];
    const roadmap: RoadmapRecord = getConceptGraphView(domain, "roadmap");
    const mindMap: MindMapRecord = getConceptGraphView(domain, "mindmap");
    expect(roadmap.kind).toBe("roadmap");
    expect(mindMap.kind).toBe("mindmap");
    expect(roadmap.id).not.toBe(mindMap.id);
  });

  it("uses canonical Concept anchors across independent records", () => {
    const anchored = [...lessons, ...lessonReferences, ...exercises, ...problems, ...resources];
    expect(anchored.length).toBeGreaterThan(0);
    for (const record of anchored) {
      expect(record.conceptIds.length).toBeGreaterThan(0);
      expect(record.conceptIds.every((id) => /^(topic|algorithm|technique):/.test(id))).toBe(true);
    }
    expect(deriveLocalMastery("topic:arrays", [])).toMatchObject({ conceptId: "topic:arrays", modelVersion: 1 });
  });

  it("keeps public Resources distinct from private Library items", () => {
    expect(resources.every((resource) => resource.id.startsWith("resource:") && resource.provenance.source === "domain-registry")).toBe(true);
  });
});

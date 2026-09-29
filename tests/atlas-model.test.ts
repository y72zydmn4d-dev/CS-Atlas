import { describe, expect, it } from "vitest";
import { domains, topics, topicById } from "@/content";
import { atlasEntities, buildAtlasModel, findAtlasEntities } from "@/lib/atlas-model";
import { activeTopics, nextDomainTopic } from "@/lib/learning-path";
import { storage } from "@/lib/storage";
import { workspaceEn, workspaceVi } from "@/i18n/messages/workspace";

describe("knowledge atlas model", () => {
  it("has unique stable entity IDs and canonical destinations", () => {
    const entities = atlasEntities("en");
    expect(entities).toHaveLength(domains.length + topics.length);
    expect(new Set(entities.map((item) => item.id)).size).toBe(entities.length);
    expect(entities.find((item) => item.entityId === "mathematics-ai")?.href).toBe("/domains/mathematics-for-ai");
    expect(atlasEntities("vi").map((item) => item.id)).toEqual(entities.map((item) => item.id));
  });
  it.each(["", "missing-domain", ...domains.map((domain) => domain.id)])("keeps %s graph edges valid, unique and deterministic", (domainId) => {
    const graph = buildAtlasModel("en", domainId);
    const ids = new Set(graph.nodes.map((node) => node.id));
    expect(new Set(graph.edges.map((edge) => edge.id)).size).toBe(graph.edges.length);
    for (const edge of graph.edges) {
      expect(ids.has(edge.source)).toBe(true); expect(ids.has(edge.target)).toBe(true);
      expect(edge.source).not.toBe(edge.target);
    }
    expect(buildAtlasModel("en", domainId)).toEqual(graph);
  });
  it("overview edges are justified by actual cross-domain prerequisite relationships", () => {
    for (const edge of buildAtlasModel("en").edges) {
      expect(topics.some((topic) => `domain:${topic.domainId}` === edge.target && topic.prerequisiteIds.some((id) => `domain:${topicById.get(id)?.domainId}` === edge.source))).toBe(true);
    }
  });
  it("includes external prerequisites in a field view", () => {
    const graph = buildAtlasModel("en", "machine-learning");
    const ids = new Set(graph.nodes.map((item) => item.entityId));
    for (const id of domains.find((domain) => domain.id === "machine-learning")!.topicIds) {
      for (const prerequisite of topicById.get(id)!.prerequisiteIds) expect(ids.has(prerequisite)).toBe(true);
    }
  });
  it.each(["độ phức tạp", "do phuc tap", "Complexity Analysis"])("searches both languages for %s", (query) => {
    expect(findAtlasEntities(query, atlasEntities("vi"))[0]?.entityId).toBe("complexity-analysis");
  });
  it("handles empty and unmatched searches", () => {
    expect(findAtlasEntities(" ", atlasEntities("en"))).toEqual([]);
    expect(findAtlasEntities("xyz-no-concept", atlasEntities("en"))).toEqual([]);
  });
});

describe("workspace recommendations and preferences", () => {
  it("resumes active work without recommending completed topics", () => {
    const domain = domains[0];
    expect(nextDomainTopic(domain, { python: "in-progress" })?.id).toBe("python");
    expect(activeTopics({ python: "in-progress", arrays: "completed", unknown: "in-progress" }).map((topic) => topic.id)).toEqual(["python"]);
    expect(nextDomainTopic(domain, Object.fromEntries(domain.topicIds.map((id) => [id, "completed"])))).toBeUndefined();
  });
  it("validates sidebar preference and recovers from malformed storage", () => {
    for (const value of ["garbage", "null", '"true"', "{}", "false"]) {
      localStorage.setItem("cs-atlas.sidebar-collapsed.v1", value);
      expect(storage.loadSidebarCollapsed()).toBe(false);
    }
    storage.saveSidebarCollapsed(true); expect(storage.loadSidebarCollapsed()).toBe(true);
    storage.saveSidebarCollapsed(false); expect(storage.loadSidebarCollapsed()).toBe(false);
  });
  it("provides complete bilingual workspace messages", () => {
    expect(Object.keys(workspaceEn).sort()).toEqual(Object.keys(workspaceVi).sort());
    expect(Object.values(workspaceVi).every((value) => value.trim().length > 0)).toBe(true);
  });
});

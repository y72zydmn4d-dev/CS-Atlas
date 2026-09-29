import { fireEvent, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { GraphNodeAction } from "@/components/graph-explorer";
import { domains, topicById, validateContent } from "@/content";
import { buildAdjacencyMap, getGraphNodeHref } from "@/lib/graph";
import type { GraphNode } from "@/lib/types";
import { renderWithLocale } from "@/tests/test-utils";

const resolveTopicSlug = (topicId: string) => topicById.get(topicId)?.slug;

describe("graph navigation", () => {
  it("resolves topic nodes through the topic registry", () => {
    const node: GraphNode = { id: "array-node", label: "Arrays", topicId: "arrays", x: 0, y: 0 };
    expect(getGraphNodeHref(node, "data-structures-algorithms", resolveTopicSlug)).toBe("/topics/arrays");
  });

  it("does not create an invalid topic URL for a branch node", () => {
    const node: GraphNode = { id: "structures", label: "Data Structures", kind: "branch", x: 0, y: 0 };
    expect(getGraphNodeHref(node, "data-structures-algorithms", resolveTopicSlug)).toBeUndefined();
  });

  it("routes root nodes without topics to the domain overview", () => {
    const node: GraphNode = { id: "root", label: "DSA", kind: "root", x: 0, y: 0 };
    expect(getGraphNodeHref(node, "data-structures-algorithms", resolveTopicSlug)).toBe("/domains/data-structures-algorithms");
  });

  it("makes the entire topic node an accessible navigation control", () => {
    const navigate = vi.fn();
    renderWithLocale(<GraphNodeAction label="Dynamic Programming" href="/topics/dynamic-programming" status="not-started" mode="roadmap" entranceOrder={4} onNavigate={navigate} onFocusChange={() => undefined} />);
    const node = screen.getByRole("button", { name: "Open topic: Dynamic Programming" });
    node.focus();
    expect(node).toHaveFocus();
    fireEvent.click(node);
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("/topics/dynamic-programming");
  });

  it("keeps non-topic branch nodes non-navigating", () => {
    const navigate = vi.fn();
    renderWithLocale(<GraphNodeAction label="Algorithms" kind="branch" status="not-started" mode="mindmap" entranceOrder={1} onNavigate={navigate} onFocusChange={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Explore branch: Algorithms" }));
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe("graph relationships", () => {
  it("includes siblings for mind maps but not roadmap adjacency", () => {
    const domain = domains.find((item) => item.id === "data-structures-algorithms")!;
    const mindMap = buildAdjacencyMap(domain.mindMap.nodes, domain.mindMap.edges, "mindmap");
    const roadmap = buildAdjacencyMap(domain.roadmap.nodes, domain.roadmap.edges, "roadmap");
    expect(mindMap.get("arrays")).toContain("hash-tables");
    expect(roadmap.get("arrays")).not.toContain("recursion");
  });

  it("keeps roadmap and mind-map models separate and valid", () => {
    for (const domain of domains) expect(domain.roadmap).not.toBe(domain.mindMap);
    expect(validateContent()).toEqual([]);
  });

  it("keeps React Flow positioning wrappers free of transform animation", () => {
    const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
    const wrapperRule = css.match(/\.atlas-flow \.react-flow__node\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(wrapperRule).not.toContain("animation:");
    expect(css).toContain(".graph-entering.graph-roadmap .flow-node-surface");
    expect(css).toContain(".graph-entering.graph-mindmap .flow-node-surface");
    expect(css).toContain(".graph-entering .atlas-flow .atlas-edge .react-flow__edge-path");
  });
});

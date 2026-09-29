import { canonicalConceptIdForTopic } from "@/content/concepts/registry";
import type { Domain, GraphEdge, GraphNode } from "@/lib/types";

export type ConceptGraphViewKind = "roadmap" | "mindmap";

export interface ConceptGraphViewNode extends GraphNode {
  conceptId?: string;
}

export interface ConceptGraphView {
  id: string;
  kind: ConceptGraphViewKind;
  domainId: string;
  nodes: ConceptGraphViewNode[];
  edges: GraphEdge[];
}

export function getConceptGraphView(domain: Domain, kind: ConceptGraphViewKind): ConceptGraphView {
  const graph = kind === "roadmap" ? domain.roadmap : domain.mindMap;
  return {
    id: `${kind}:${domain.id}`,
    kind,
    domainId: domain.id,
    nodes: graph.nodes.map((node) => ({ ...node, conceptId: node.topicId ? canonicalConceptIdForTopic(node.topicId) : undefined })),
    edges: graph.edges,
  };
}

export function validateConceptGraphView(view: ConceptGraphView): string[] {
  const nodeIds = new Set(view.nodes.map((node) => node.id));
  const errors: string[] = [];
  for (const edge of view.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) errors.push(`${view.id} edge ${edge.id} references a missing node`);
  }
  return errors;
}

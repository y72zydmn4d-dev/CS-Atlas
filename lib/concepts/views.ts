import { canonicalConceptIdForTopic, conceptRelations, resolveConcept } from "@/content/concepts/registry";
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
  unresolvedNodes: Array<{ nodeId: string; topicId: string }>;
}

export function getConceptGraphView(domain: Domain, kind: ConceptGraphViewKind): ConceptGraphView {
  const graph = kind === "roadmap" ? domain.roadmap : domain.mindMap;
  const nodes = graph.nodes.map((node) => {
    const candidate = node.topicId ? canonicalConceptIdForTopic(node.topicId) : undefined;
    return { ...node, conceptId: candidate && resolveConcept(candidate) ? candidate : undefined };
  });
  return {
    id: `${kind}:${domain.id}`,
    kind,
    domainId: domain.id,
    nodes,
    edges: graph.edges,
    unresolvedNodes: nodes.flatMap((node) => node.topicId && !node.conceptId ? [{ nodeId: node.id, topicId: node.topicId }] : []),
  };
}

export function validateConceptGraphView(view: ConceptGraphView): string[] {
  const errors: string[] = [];
  const nodeIdList = view.nodes.map((node) => node.id);
  const nodeIds = new Set(nodeIdList);
  if (nodeIds.size !== nodeIdList.length) errors.push(`${view.id} contains duplicate node IDs`);
  const edgeIds = new Set<string>();
  const edgePairs = new Set<string>();
  for (const node of view.nodes) {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) errors.push(`${view.id} node ${node.id} has invalid layout coordinates`);
    if (node.topicId && !node.conceptId) errors.push(`${view.id} node ${node.id} cannot resolve topic ${node.topicId}`);
  }
  for (const edge of view.edges) {
    if (edgeIds.has(edge.id)) errors.push(`${view.id} contains duplicate edge ID ${edge.id}`);
    edgeIds.add(edge.id);
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) errors.push(`${view.id} edge ${edge.id} references a missing node`);
    if (edge.source === edge.target) errors.push(`${view.id} edge ${edge.id} is a self-loop`);
    const pair = `${edge.source}->${edge.target}`;
    if (edgePairs.has(pair)) errors.push(`${view.id} contains duplicate edge ${pair}`);
    edgePairs.add(pair);
  }
  return errors;
}

export function validateRoadmapPrerequisiteOrder(view: ConceptGraphView): string[] {
  if (view.kind !== "roadmap") return [];
  const nodeByConceptId = new Map(view.nodes.flatMap((node) => node.conceptId ? [[node.conceptId, node.id] as const] : []));
  const adjacency = new Map(view.nodes.map((node) => [node.id, [] as string[]]));
  for (const edge of view.edges) adjacency.get(edge.source)?.push(edge.target);
  const canReach = (source: string, target: string) => {
    const seen = new Set<string>();
    const visit = (id: string): boolean => {
      if (id === target) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return (adjacency.get(id) ?? []).some(visit);
    };
    return visit(source);
  };
  const errors: string[] = [];
  for (const relation of conceptRelations.filter((item) => item.type === "PREREQUISITE_OF")) {
    const source = nodeByConceptId.get(relation.sourceConceptId);
    const target = nodeByConceptId.get(relation.targetConceptId);
    if (source && target && !canReach(source, target)) errors.push(`${view.id} does not place ${relation.sourceConceptId} before ${relation.targetConceptId}`);
  }
  return errors;
}

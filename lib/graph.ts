import type { GraphEdge, GraphNode } from "@/lib/types";

export type GraphMode = "roadmap" | "mindmap";

export function getGraphNodeHref(
  node: Pick<GraphNode, "kind" | "topicId">,
  domainSlug: string,
  resolveTopicSlug: (topicId: string) => string | undefined,
): string | undefined {
  if (node.topicId) {
    const slug = resolveTopicSlug(node.topicId);
    return slug ? `/topics/${slug}` : undefined;
  }
  return node.kind === "root" ? `/domains/${domainSlug}` : undefined;
}

export function buildAdjacencyMap(nodes: Array<Pick<GraphNode, "id">>, edges: GraphEdge[], mode: GraphMode) {
  const direct = new Map(nodes.map((node) => [node.id, new Set<string>([node.id])]));
  const parents = new Map(nodes.map((node) => [node.id, new Set<string>()]));

  for (const edge of edges) {
    direct.get(edge.source)?.add(edge.target);
    direct.get(edge.target)?.add(edge.source);
    parents.get(edge.target)?.add(edge.source);
  }

  if (mode === "mindmap") {
    for (const node of nodes) {
      for (const parent of parents.get(node.id) ?? []) {
        const siblings = edges.filter((edge) => edge.source === parent).map((edge) => edge.target);
        for (const sibling of siblings) direct.get(node.id)?.add(sibling);
      }
    }
  }

  return direct;
}

export function buildEntranceOrder(nodes: Array<Pick<GraphNode, "id" | "kind">>, edges: GraphEdge[], mode: GraphMode) {
  if (mode === "roadmap") return new Map(nodes.map((node, index) => [node.id, index]));
  const order = new Map<string, number>();
  const roots = nodes.filter((node) => node.kind === "root");
  const queue = roots.map((node) => ({ id: node.id, depth: 0 }));
  while (queue.length) {
    const current = queue.shift()!;
    if (order.has(current.id)) continue;
    order.set(current.id, current.depth);
    for (const edge of edges) if (edge.source === current.id) queue.push({ id: edge.target, depth: current.depth + 1 });
  }
  for (const node of nodes) if (!order.has(node.id)) order.set(node.id, node.kind === "branch" ? 1 : 2);
  return order;
}

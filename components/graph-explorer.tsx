"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Background, Controls, Handle, MiniMap, Position, ReactFlow, type Node, type NodeProps } from "@xyflow/react";
import type { Domain, GraphNode } from "@/lib/types";
import { topicById } from "@/content";
import { useAtlas } from "@/components/atlas-provider";
import { buildAdjacencyMap, buildEntranceOrder, getGraphNodeHref, type GraphMode } from "@/lib/graph";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/locale-provider";
import { localizedLabel, localizeTopic } from "@/i18n/content";

type NodeStatus = "not-started" | "in-progress" | "completed";

export interface GraphNodeActionProps {
  label: string;
  href?: string;
  kind?: GraphNode["kind"];
  status: NodeStatus;
  mode: GraphMode;
  dimmed?: boolean;
  related?: boolean;
  justCompleted?: boolean;
  entranceOrder: number;
  onNavigate: (href: string) => void;
  onFocusChange: (focused: boolean) => void;
}

export function GraphNodeAction({ label, href, kind, status, mode, dimmed, related, justCompleted, entranceOrder, onNavigate, onFocusChange }: GraphNodeActionProps) {
  const { t } = useI18n();
  const targetType = href?.startsWith("/topics/") ? "topic" : href ? "domain" : "branch";
  const accessibleLabel = targetType === "topic" ? t("graph.openTopic", { label }) : targetType === "domain" ? t("graph.openDomain", { label }) : t("graph.exploreBranch", { label });
  return (
    <button
      type="button"
      className={cn("flow-node-surface", "nodrag", "nopan", mode, status, kind === "root" && "root", href && "navigable", dimmed && "dimmed", related && "related", justCompleted && "just-completed")}
      style={{ "--entrance-order": entranceOrder } as CSSProperties}
      aria-label={accessibleLabel}
      title={href ? accessibleLabel : label}
      onClick={() => { if (href) onNavigate(href); }}
      onFocus={() => onFocusChange(true)}
      onBlur={() => onFocusChange(false)}
    >
      <span className="flow-state" aria-hidden="true" />
      <span>{label}</span>
      {href && <span className="flow-open-mark" aria-hidden="true">↗</span>}
    </button>
  );
}

type AtlasNodeData = {
  id: string;
  label: string;
  href?: string;
  kind?: GraphNode["kind"];
  status: NodeStatus;
  mode: GraphMode;
  dimmed: boolean;
  related: boolean;
  justCompleted: boolean;
  entranceOrder: number;
  onNavigate: (href: string) => void;
  onFocusNode: (id: string | null) => void;
};

function AtlasNode({ data }: NodeProps<Node<AtlasNodeData>>) {
  return (
    <div className="flow-node">
      <Handle type="target" position={Position.Left} />
      <GraphNodeAction
        label={data.label}
        href={data.href}
        kind={data.kind}
        status={data.status}
        mode={data.mode}
        dimmed={data.dimmed}
        related={data.related}
        justCompleted={data.justCompleted}
        entranceOrder={data.entranceOrder}
        onNavigate={data.onNavigate}
        onFocusChange={(focused) => data.onFocusNode(focused ? data.id : null)}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { atlas: AtlasNode };

export function GraphExplorer({ domain, mode }: { domain: Domain; mode: GraphMode }) {
  const router = useRouter();
  const { progress, ready } = useAtlas();
  const { locale, t } = useI18n();
  const graph = domain[mode === "roadmap" ? "roadmap" : "mindMap"];
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [entering, setEntering] = useState(true);
  const [celebrating, setCelebrating] = useState<Set<string>>(new Set());
  const previousStatuses = useRef<Record<string, NodeStatus> | null>(null);
  const navigate = useCallback((href: string) => router.push(href), [router]);
  const setFocusedNode = useCallback((id: string | null) => setActiveNodeId(id), []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setEntering(false), 1050);
    return () => window.clearTimeout(timeout);
  }, [domain.id, mode]);

  const adjacency = useMemo(() => buildAdjacencyMap(graph.nodes, graph.edges, mode), [graph.edges, graph.nodes, mode]);
  const entranceOrder = useMemo(() => buildEntranceOrder(graph.nodes, graph.edges, mode), [graph.edges, graph.nodes, mode]);
  const baseNodes = useMemo(() => graph.nodes.map((node) => ({
    id: node.id,
    type: "atlas",
    position: { x: node.x, y: node.y },
    label: node.topicId && topicById.get(node.topicId) ? localizeTopic(topicById.get(node.topicId)!, locale).title : localizedLabel(node.label, locale),
    href: getGraphNodeHref(node, domain.slug, (topicId) => topicById.get(topicId)?.slug),
    kind: node.kind,
    topicId: node.topicId,
    entranceOrder: entranceOrder.get(node.id) ?? 0,
  })), [domain.slug, entranceOrder, graph.nodes, locale]);
  const baseEdges = useMemo(() => graph.edges.map((edge, index) => ({ ...edge, animated: false, type: "smoothstep", entranceOrder: index })), [graph.edges]);
  const statuses = useMemo<Record<string, NodeStatus>>(() => Object.fromEntries(baseNodes.map((node) => [node.id, node.topicId ? progress[node.topicId] ?? "not-started" : "not-started"])), [baseNodes, progress]);

  useEffect(() => {
    if (!ready) return;
    if (!previousStatuses.current) { previousStatuses.current = statuses; return; }
    const completed = baseNodes.filter((node) => previousStatuses.current?.[node.id] !== "completed" && statuses[node.id] === "completed").map((node) => node.id);
    previousStatuses.current = statuses;
    if (!completed.length) return;
    setCelebrating(new Set(completed));
    const timeout = window.setTimeout(() => setCelebrating(new Set()), 650);
    return () => window.clearTimeout(timeout);
  }, [baseNodes, ready, statuses]);

  const relatedIds = useMemo(() => activeNodeId ? adjacency.get(activeNodeId) ?? new Set([activeNodeId]) : null, [activeNodeId, adjacency]);
  const nodes = useMemo<Node<AtlasNodeData>[]>(() => baseNodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    initialWidth: 190,
    initialHeight: 40,
    data: {
      id: node.id,
      label: node.label,
      href: node.href,
      kind: node.kind,
      status: statuses[node.id],
      mode,
      dimmed: Boolean(relatedIds && !relatedIds.has(node.id)),
      related: Boolean(relatedIds?.has(node.id)),
      justCompleted: celebrating.has(node.id),
      entranceOrder: node.entranceOrder,
      onNavigate: navigate,
      onFocusNode: setFocusedNode,
    },
  })), [baseNodes, celebrating, mode, navigate, relatedIds, setFocusedNode, statuses]);
  const edges = useMemo(() => baseEdges.map((edge) => {
    const highlighted = !activeNodeId || edge.source === activeNodeId || edge.target === activeNodeId;
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated,
      type: edge.type,
      className: cn("atlas-edge", mode, highlighted && "highlighted", activeNodeId && !highlighted && "dimmed"),
      style: { "--edge-sequence": edge.entranceOrder } as CSSProperties,
    };
  }), [activeNodeId, baseEdges, mode]);
  const handleNodeEnter = useCallback((_: React.MouseEvent, node: Node<AtlasNodeData>) => setActiveNodeId(node.id), []);
  const handleNodeLeave = useCallback(() => setActiveNodeId(null), []);

  return (
    <div className={cn("graph-shell", `graph-${mode}`, entering && "graph-entering")}>
      <div className="graph-legend"><span><i className="legend-dot" />{t("graph.notStarted")}</span><span><i className="legend-dot progress" />{t("graph.inProgress")}</span><span><i className="legend-dot complete" />{t("graph.completed")}</span></div>
      <p className="graph-instruction">{t("graph.instruction")}</p>
      <ReactFlow
        className="atlas-flow"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeMouseEnter={handleNodeEnter}
        onNodeMouseLeave={handleNodeLeave}
        fitView
        fitViewOptions={{ padding: .2, duration: 420, minZoom: .65, maxZoom: 1.15 }}
        minZoom={.65}
        maxZoom={1.8}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background gap={mode === "mindmap" ? 32 : 24} size={1} color="var(--border)" />
        <Controls showInteractive={false} />
        <MiniMap
          className="atlas-minimap"
          style={{ width: 140, height: 92 }}
          bgColor="transparent"
          maskColor="rgba(100, 116, 139, .12)"
          maskStrokeColor="rgba(100, 116, 139, .32)"
          nodeBorderRadius={8}
          nodeStrokeWidth={1}
          nodeStrokeColor="rgba(109, 93, 252, .7)"
          pannable={false}
          zoomable={false}
          nodeColor={(node) => node.data.status === "completed" ? "#34d399" : node.data.status === "in-progress" ? "#fbbf24" : "#8b95a7"}
        />
      </ReactFlow>
    </div>
  );
}

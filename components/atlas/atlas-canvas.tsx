"use client";
import { useEffect, useMemo, type CSSProperties } from "react";
import { Background, Handle, MarkerType, Position, ReactFlow, ReactFlowProvider, useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { Maximize, Minus, Plus } from "lucide-react";
import type { AtlasConnection, AtlasEntity } from "@/lib/atlas-model";
import { useI18n } from "@/components/locale-provider";
import { useAtlas } from "@/components/atlas-provider";
import type { ProgressStatus } from "@/lib/types";

type EntityNode = Node<{ entity: AtlasEntity; selected: boolean; status: ProgressStatus; onSelect: (entity: AtlasEntity) => void }>;
function Coordinate({ data }: NodeProps<EntityNode>) {
  const { t } = useI18n();
  return <><Handle type="target" position={Position.Left} /><button className={`coordinate-node nodrag nopan ${data.selected ? "selected" : ""}`} style={{ "--domain-accent": data.entity.accent } as CSSProperties} onClick={() => data.onSelect(data.entity)} aria-label={t("workspace.inspect", { name: data.entity.label })} aria-pressed={data.selected}><small>{t(data.entity.kind === "domain" ? "common.domain" : "common.topic")}</small><strong>{data.entity.label}</strong>{data.entity.kind === "topic" && <span className={`coordinate-status ${data.status}`}>{t(data.status === "completed" ? "status.completed" : data.status === "in-progress" ? "status.inProgress" : "status.notStarted")}</span>}</button><Handle type="source" position={Position.Right} /></>;
}
const nodeTypes = { coordinate: Coordinate };
export interface AtlasCanvasProps { nodes: AtlasEntity[]; edges: AtlasConnection[]; selectedId?: string; focusId?: string; onSelect: (entity: AtlasEntity) => void }
function Canvas({ nodes: entities, edges: connections, selectedId, focusId, onSelect }: AtlasCanvasProps) {
  const { t } = useI18n();
  const { progress } = useAtlas();
  const flow = useReactFlow();
  const fit = () => void flow.fitView({ padding: .18, minZoom: window.matchMedia("(max-width: 650px)").matches ? .8 : .45 });
  const nodes = useMemo<EntityNode[]>(() => entities.map((entity) => ({ id: entity.id, type: "coordinate", position: entity.position, data: { entity, selected: entity.id === selectedId, status: progress[entity.entityId] ?? "not-started", onSelect } })), [entities, onSelect, progress, selectedId]);
  const edges = useMemo(() => connections.map((edge) => ({ ...edge, type: "default", style: { stroke: edge.kind === "membership" ? "var(--border-strong)" : "var(--accent)", strokeDasharray: edge.kind === "membership" ? "4 5" : undefined, opacity: selectedId && edge.source !== selectedId && edge.target !== selectedId ? .15 : .65 }, markerEnd: edge.kind === "prerequisite" ? { type: MarkerType.ArrowClosed, color: "var(--accent)" } : undefined })), [connections, selectedId]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260;
      const entity = entities.find((item) => item.id === focusId);
      if (entity) void flow.setCenter(entity.position.x + 110, entity.position.y + 50, { zoom: 1, duration });
      else void flow.fitView({ padding: .18, duration, minZoom: window.matchMedia("(max-width: 650px)").matches ? .8 : .45 });
    });
    return () => cancelAnimationFrame(frame);
  }, [entities, flow, focusId]);
  return <div className="atlas-canvas"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={.25} maxZoom={1.6} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} nodesFocusable={false} edgesFocusable={false} proOptions={{ hideAttribution: false }}><Background gap={24} size={1} color="var(--border-strong)" /></ReactFlow><div className="atlas-camera"><button className="icon-button" onClick={() => void flow.zoomIn()} aria-label={t("workspace.zoomIn")}><Plus size={17} /></button><button className="icon-button" onClick={() => void flow.zoomOut()} aria-label={t("workspace.zoomOut")}><Minus size={17} /></button><button className="icon-button" onClick={fit} aria-label={t("workspace.fit")}><Maximize size={17} /></button></div></div>;
}
export default function AtlasCanvas(props: AtlasCanvasProps) { return <ReactFlowProvider><Canvas {...props} /></ReactFlowProvider>; }

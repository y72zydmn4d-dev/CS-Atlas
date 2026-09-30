"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { landingDimensions, type LandingLayout, type LandingProjection } from "@/lib/concepts/landing-projection";
import { landingBox, landingCurvePath, landingCurves } from "@/lib/concepts/landing-geometry";
import { useLandingMotion } from "./use-landing-motion";
import { useKnowledgeGeometry } from "./use-knowledge-geometry";

export function KnowledgeAtlasVisual({ projection }: { projection: LandingProjection }) {
  const { locale, t } = useI18n();
  const instanceId = useId().replace(/:/g, "");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [pointerInside, setPointerInside] = useState(false);
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const active = hovered ?? focused ?? selected;
  const node = projection.nodes.find((item) => item.id === active);
  const selectedNode = projection.nodes.find((item) => item.id === selected);
  const { setElement, eligible, enabled, atmosphereEnabled, setEnabled, paused } = useLandingMotion(selected !== null || open || pointerInside);
  const { layerRef, measurements } = useKnowledgeGeometry(locale);
  function select(id: string, announce: boolean) {
    const next = selected === id ? null : id;
    setSelected(next);
    if (announce) {
      const concept = projection.nodes.find((item) => item.id === next);
      setAnnouncement(concept ? `${concept.name[locale]}. ${concept.summary[locale]}` : t("landing.graphHint"));
    }
  }
  return <section className="knowledge-preview" aria-label={t("landing.graphTitle")} onKeyDown={(event) => { if (event.key === "Escape") { setSelected(null); setHovered(null); setFocused(null); setAnnouncement(t("landing.graphHint")); } }}>
    <div ref={setElement} className="knowledge-graphic" aria-hidden="true" onPointerEnter={() => setPointerInside(true)} onPointerLeave={() => { setHovered(null); setPointerInside(false); }} data-motion={enabled ? "enabled" : "disabled"} data-atmosphere-motion={atmosphereEnabled ? "enabled" : "disabled"} data-paused={paused}>
      <div ref={layerRef} className="knowledge-drift-layer">
        {(["wide", "compact", "tablet"] as const).map((layout: LandingLayout) => {
          const [width,height] = landingDimensions[layout];
          const nodes = projection.nodes.filter((item) => item[layout]);
          const visibleEdges = projection.edges.filter((edge) => nodes.some((item) => item.id === edge.source) && nodes.some((item) => item.id === edge.target));
          const neighbors = new Set(visibleEdges.filter((edge) => edge.source === active || edge.target === active).flatMap((edge) => [edge.source,edge.target]));
          return <div className={`knowledge-layout knowledge-${layout}`} key={layout}>
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" focusable="false">
              <defs><marker id={`${instanceId}-${layout}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5" fill="context-stroke" /></marker></defs>
              {visibleEdges.map((edge) => {
                const sourceNode = nodes.find((item) => item.id === edge.source);
                const targetNode = nodes.find((item) => item.id === edge.target);
                const source = sourceNode?.[layout];
                const target = targetNode?.[layout];
                const route = edge.routes[layout];
                if (!source || !target || !sourceNode || !targetNode || !route) return null;
                const measurement = measurements[layout];
                const box = (item: typeof sourceNode, point: typeof source) => landingBox(point,measurement?.sizes[item.id] ?? [layout === "wide" ? item.focal ? 180 : item.rank === "anchor" ? 164 : 148 : layout === "compact" ? 140 : 128,layout === "wide" ? item.focal ? 88 : item.rank === "anchor" ? 72 : 64 : 64],measurement?.viewport ?? [width,height],[width,height]);
                const incident = edge.source === active || edge.target === active;
                return <path key={edge.id} d={landingCurvePath(landingCurves(box(sourceNode,source),box(targetNode,target),route,edge.type === "PREREQUISITE_OF"))} className={`knowledge-edge ${sourceNode.focal || targetNode.focal ? "focal" : ""} ${edge.type === "RELATED_TO" ? "related" : ""} ${active ? incident ? "incident" : "dimmed" : ""}`} markerEnd={edge.type === "PREREQUISITE_OF" ? `url(#${instanceId}-${layout})` : undefined} />;
              })}
            </svg>
            {nodes.map((item) => {
              const point = item[layout];
              if (!point) return null;
              return <span key={item.id} data-concept={item.id} className={`knowledge-node rank-${item.rank} ${item.focal ? "focal" : ""} ${active === item.id ? "active" : active && neighbors.has(item.id) ? "neighbor" : active ? "unrelated" : ""}`} style={{ left:`${point[0]/width*100}%`, top:`${point[1]/height*100}%` }} onPointerEnter={() => setHovered(item.id)} onPointerLeave={() => setHovered(null)} onClick={() => select(item.id,false)}><i /><span>{item.name[locale]}</span></span>;
            })}
          </div>;
        })}
      </div>
    </div>
    <p className="knowledge-mobile-example">{t("landing.mobileConnection")}</p>
    <div className="knowledge-caption">
      <p>{node ? <><strong>{node.name[locale]}</strong><span>{node.summary[locale]}</span></> : t("landing.caption")}</p>
      <Link href="/atlas" prefetch={false}>{t("landing.viewAtlas")} <span aria-hidden="true">↗</span></Link>
    </div>
    <div className="knowledge-utilities">
    <details className="knowledge-connections" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{t("landing.connections")}</summary>
      <div className="knowledge-connections-body">
      <p className="knowledge-list-hint">{t("landing.graphHint")}</p>
      <p className="knowledge-list-hint">{t("landing.sliceNote")}</p>
      <ul className="knowledge-node-list">{projection.nodes.map((item) => <li key={item.id}><button type="button" aria-pressed={selected === item.id} onFocus={() => setFocused(item.id)} onBlur={() => setFocused(null)} onClick={() => { setFocused(null); select(item.id,true); }}>{item.name[locale]}</button></li>)}</ul>
      {selectedNode && <div className="knowledge-selected-detail"><h3>{selectedNode.name[locale]}</h3><p>{selectedNode.summary[locale]}</p><ul>{projection.edges.filter((edge) => edge.source === selected || edge.target === selected).map((edge) => {
        const neighbor = projection.nodes.find((item) => item.id === (edge.source === selected ? edge.target : edge.source));
        return <li key={edge.id}><span>{t(edge.type === "RELATED_TO" ? "landing.related" : edge.source === selected ? "landing.prerequisite" : "landing.requires")}: </span>{neighbor?.name[locale]}</li>;
      })}</ul><Link href={selectedNode.href} prefetch={false}>{t("landing.openConcept")} <span aria-hidden="true">↗</span></Link></div>}
      </div>
    </details>
    {eligible && <button type="button" className="knowledge-motion-control" aria-pressed={atmosphereEnabled} onClick={() => setEnabled(!atmosphereEnabled)}>{t(atmosphereEnabled ? "landing.pauseMotion" : "landing.enableMotion")}</button>}
    </div>
    <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
  </section>;
}

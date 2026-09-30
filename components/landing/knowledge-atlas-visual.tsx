"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { landingDimensions, landingEdgePath, type LandingLayout, type LandingProjection } from "@/lib/concepts/landing-projection";
import { useLandingMotion } from "./use-landing-motion";

export function KnowledgeAtlasVisual({ projection }: { projection: LandingProjection }) {
  const { locale, t } = useI18n();
  const instanceId = useId().replace(/:/g, "");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const active = hovered ?? selected;
  const node = projection.nodes.find((item) => item.id === active);
  const selectedNode = projection.nodes.find((item) => item.id === selected);
  const { setElement, eligible, enabled, setEnabled, paused } = useLandingMotion(selected !== null || open);
  function select(id: string, announce: boolean) {
    const next = selected === id ? null : id;
    setSelected(next);
    if (announce) {
      const concept = projection.nodes.find((item) => item.id === next);
      setAnnouncement(concept ? `${concept.name[locale]}. ${concept.summary[locale]}` : t("landing.graphHint"));
    }
  }
  return <section ref={setElement} className="knowledge-preview" aria-label={t("landing.graphTitle")} onKeyDown={(event) => { if (event.key === "Escape") { setSelected(null); setHovered(null); setAnnouncement(t("landing.graphHint")); } }}>
    <div className="knowledge-graphic" aria-hidden="true" onPointerLeave={() => setHovered(null)} data-motion={enabled ? "enabled" : "disabled"} data-paused={paused}>
      <div className="knowledge-drift-layer">
        {(["wide", "compact", "tablet"] as const).map((layout: LandingLayout) => {
          const [width,height] = landingDimensions[layout];
          const nodes = projection.nodes.filter((item) => item[layout]);
          return <div className={`knowledge-layout knowledge-${layout}`} key={layout}>
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" focusable="false">
              <defs><marker id={`${instanceId}-${layout}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5" fill="context-stroke" /></marker></defs>
              {projection.edges.map((edge) => {
                const source = nodes.find((item) => item.id === edge.source)?.[layout];
                const target = nodes.find((item) => item.id === edge.target)?.[layout];
                if (!source || !target) return null;
                const incident = edge.source === active || edge.target === active;
                return <path key={edge.id} d={landingEdgePath(source,target,layout)} className={`knowledge-edge ${edge.type === "RELATED_TO" ? "related" : ""} ${active ? incident ? "incident" : "dimmed" : ""}`} markerEnd={edge.type === "PREREQUISITE_OF" ? `url(#${instanceId}-${layout})` : undefined} />;
              })}
            </svg>
            {nodes.map((item) => {
              const point = item[layout];
              if (!point) return null;
              return <span key={item.id} className={`knowledge-node rank-${item.rank} ${active === item.id ? "active" : ""}`} style={{ left:`${point[0]/width*100}%`, top:`${point[1]/height*100}%` }} onPointerEnter={() => setHovered(item.id)} onClick={() => select(item.id,false)}><i /><span>{item.name[locale]}</span></span>;
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
    <details className="knowledge-connections" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{t("landing.connections")}</summary>
      <p className="knowledge-list-hint">{t("landing.graphHint")}</p>
      <p className="knowledge-list-hint">{t("landing.sliceNote")}</p>
      <ul className="knowledge-node-list">{projection.nodes.map((item) => <li key={item.id}><button type="button" aria-pressed={selected === item.id} onClick={() => select(item.id,true)}>{item.name[locale]}</button></li>)}</ul>
      {selectedNode && <div className="knowledge-selected-detail"><h3>{selectedNode.name[locale]}</h3><p>{selectedNode.summary[locale]}</p><ul>{projection.edges.filter((edge) => edge.source === selected || edge.target === selected).map((edge) => {
        const neighbor = projection.nodes.find((item) => item.id === (edge.source === selected ? edge.target : edge.source));
        return <li key={edge.id}><span>{t(edge.type === "RELATED_TO" ? "landing.related" : edge.source === selected ? "landing.prerequisite" : "landing.requires")}: </span>{neighbor?.name[locale]}</li>;
      })}</ul><Link href={selectedNode.href} prefetch={false}>{t("landing.openConcept")} <span aria-hidden="true">↗</span></Link></div>}
    </details>
    <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    {eligible && <button type="button" className="knowledge-motion-control" aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>{t(enabled ? "landing.pauseMotion" : "landing.enableMotion")}</button>}
  </section>;
}

"use client";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { useI18n } from "@/components/locale-provider";
import { buildAtlasModel } from "@/lib/atlas-model";

export function KnowledgeAtlasPreview() {
  const { locale, t } = useI18n();
  const [active, setActive] = useState<string | null>(null);
  const model = buildAtlasModel(locale);
  const nodes = model.nodes.filter((_, i) => [0, 2, 4, 5, 8, 9].includes(i));
  const points = new Map(nodes.map((node, i) => [node.id, { x: 18 + i % 3 * 32, y: 28 + Math.floor(i / 3) * 44 }]));
  const edges = model.edges.filter((edge) => points.has(edge.source) && points.has(edge.target));
  return <div className="workspace-preview" aria-label={t("workspace.atlas")}>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{edges.map((edge) => { const a = points.get(edge.source)!; const b = points.get(edge.target)!; return <line key={edge.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={active && edge.source !== active && edge.target !== active ? "dimmed" : ""} />; })}</svg>
    {nodes.map((node) => { const point = points.get(node.id)!; return <Link key={node.id} href={node.href} className="preview-coordinate" style={{ left: point.x + "%", top: point.y + "%", "--domain-accent": node.accent } as CSSProperties} onMouseEnter={() => setActive(node.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(node.id)} onBlur={() => setActive(null)}><i /><span>{node.label}</span></Link>; })}
  </div>;
}

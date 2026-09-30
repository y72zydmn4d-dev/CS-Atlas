import type { LocalizedConceptText } from "@/lib/domain/concepts";
import type { ConceptGraphService } from "@/lib/concepts/service";
import type { LandingRoute } from "./landing-geometry";

export type LandingLayout = "wide" | "compact" | "tablet";
type Point = readonly [number, number];
type PreviewRelationType = "PREREQUISITE_OF" | "RELATED_TO";
export interface LandingNodeLayout {
  id: string;
  rank: "anchor" | "bridge" | "supporting";
  wide: Point;
  compact?: Point;
  tablet?: Point;
}
export interface LandingPresentation {
  nodes: LandingNodeLayout[];
  relations: Array<{ source: string; target: string; type: PreviewRelationType; routes: Partial<Record<LandingLayout, LandingRoute>> }>;
}
export interface LandingNode extends LandingNodeLayout {
  name: LocalizedConceptText;
  summary: LocalizedConceptText;
  href: string;
}
export interface LandingEdge { id: string; source: string; target: string; type: PreviewRelationType; routes: Partial<Record<LandingLayout, LandingRoute>> }
export interface LandingProjection { nodes: LandingNode[]; edges: LandingEdge[] }
export const landingDimensions: Record<LandingLayout, Point> = { wide: [800,360], compact: [560,280], tablet: [440,232] };

/** Pure, bounded adapter: source registry never crosses the public client boundary. */
export function buildLandingProjection(service: ConceptGraphService, presentation: LandingPresentation): LandingProjection {
  if (presentation.nodes.length > 12 || presentation.relations.length > 16) throw new Error("Landing projection exceeds its public budget");
  const ids = new Set<string>();
  const nodes = presentation.nodes.map((layout) => {
    if (ids.has(layout.id)) throw new Error(`Duplicate landing concept: ${layout.id}`);
    ids.add(layout.id);
    const concept = service.getConcept(layout.id);
    if (!concept || concept.status !== "active") throw new Error(`Missing landing concept: ${layout.id}`);
    for (const variant of ["wide", "compact", "tablet"] as const) {
      const point = layout[variant];
      if (point && (!point.every(Number.isFinite) || point[0] < 12 || point[1] < 12 || point[0] > landingDimensions[variant][0] - 12 || point[1] > landingDimensions[variant][1] - 12)) throw new Error("Invalid landing coordinates");
    }
    return { ...layout, name: concept.name, summary: { en: concept.summary.en.slice(0,140), vi: concept.summary.vi.slice(0,140) }, href: `/concepts/${concept.slug}` };
  });
  const edgeIds = new Set<string>();
  const edges = presentation.relations.map((selector) => {
    if (selector.source === selector.target || !ids.has(selector.source) || !ids.has(selector.target)) throw new Error("Invalid landing relation endpoints");
    const relation = service.listRelations({ conceptId: selector.source, types: [selector.type], direction: "both", limit: 100 }).find((item) =>
      item.sourceConceptId === selector.source && item.targetConceptId === selector.target ||
      selector.type === "RELATED_TO" && item.sourceConceptId === selector.target && item.targetConceptId === selector.source);
    if (!relation) throw new Error(`Missing landing relation: ${selector.source} / ${selector.target}`);
    for (const variant of ["wide", "compact", "tablet"] as const) {
      const route = selector.routes?.[variant];
      const visible = presentation.nodes.find((node) => node.id === selector.source)?.[variant] && presentation.nodes.find((node) => node.id === selector.target)?.[variant];
      if (visible && !route) throw new Error("Visible landing relation requires a route");
      if (route && (![2,5].includes(route.controls.length) || route.controls.some((point) => !point.every(Number.isFinite) || point[0] < 12 || point[1] < 12 || point[0] > landingDimensions[variant][0]-12 || point[1] > landingDimensions[variant][1]-12))) throw new Error("Invalid landing route controls");
    }
    if (edgeIds.has(relation.id)) throw new Error("Duplicate landing relation");
    edgeIds.add(relation.id);
    return { id: relation.id, ...selector };
  });
  return { nodes, edges };
}

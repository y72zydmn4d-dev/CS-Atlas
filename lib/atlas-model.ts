import { domains, domainById, topicById } from "@/content";
import { concepts, conceptRelations } from "@/content/concepts/registry";
import { localizeDomain, localizeTopic } from "@/i18n/content";
import type { Locale } from "@/lib/types";

export interface AtlasEntity {
  id: string;
  entityId: string;
  kind: "domain" | "topic";
  domainId: string;
  label: string;
  searchText: string;
  summary: string;
  href: string;
  accent: string;
  position: { x: number; y: number };
}
export interface AtlasConnection { id: string; source: string; target: string; kind: "membership" | "prerequisite" }
export function normalizeAtlasQuery(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replaceAll("đ", "d").trim();
}
export function atlasEntities(locale: Locale): AtlasEntity[] {
  return [
    ...domains.map((domain, i): AtlasEntity => ({ id: `domain:${domain.id}`, entityId: domain.id, kind: "domain", domainId: domain.id, label: localizeDomain(domain, locale).name, searchText: `${domain.name} ${localizeDomain(domain, "vi").name}`, summary: localizeDomain(domain, locale).description, href: `/domains/${domain.slug}`, accent: domain.accent, position: { x: i % 3 * 340, y: Math.floor(i / 3) * 180 } })),
    ...concepts.filter((concept) => concept.kind === "topic" && concept.domainId).flatMap((concept): AtlasEntity[] => {
      const topic = topicById.get(concept.provenance.legacyId);
      if (!topic || !concept.domainId) return [];
      return [{ id: concept.id, entityId: topic.id, kind: "topic", domainId: concept.domainId, label: localizeTopic(topic, locale).title, searchText: `${concept.name.en} ${concept.name.vi}`, summary: localizeTopic(topic, locale).summary, href: `/concepts/${concept.slug}`, accent: domainById.get(concept.domainId)?.accent ?? "var(--accent)", position: { x: 0, y: 0 } }];
    }),
  ];
}

/** Overview aggregates real cross-field prerequisites. Field detail adds its immediate prerequisites. */
export function buildAtlasModel(locale: Locale, domainId = "") {
  const all = atlasEntities(locale);
  const edges = new Map<string, AtlasConnection>();
  const add = (source: string, target: string, kind: AtlasConnection["kind"]) => {
    if (source !== target) edges.set(`${kind}:${source}>${target}`, { id: `${kind}:${source}>${target}`, source, target, kind });
  };
  if (!domainId || !domainById.has(domainId)) {
    const nodes = all.filter((item) => item.kind === "domain");
    for (const relation of conceptRelations.filter((relation) => relation.type === "PREREQUISITE_OF")) {
      const prerequisite = all.find((item) => item.id === relation.sourceConceptId);
      const target = all.find((item) => item.id === relation.targetConceptId);
      if (prerequisite?.kind === "topic" && target?.kind === "topic" && domainById.has(prerequisite.domainId) && domainById.has(target.domainId)) add(`domain:${prerequisite.domainId}`, `domain:${target.domainId}`, "prerequisite");
    }
    return { nodes, edges: [...edges.values()] };
  }
  const domain = domainById.get(domainId)!;
  const ids = new Set(domain.topicIds);
  for (const relation of conceptRelations.filter((relation) => relation.type === "PREREQUISITE_OF")) {
    const target = all.find((item) => item.id === relation.targetConceptId);
    const source = all.find((item) => item.id === relation.sourceConceptId);
    if (target?.kind === "topic" && ids.has(target.entityId) && source?.kind === "topic") ids.add(source.entityId);
  }
  const mainTopics = all.filter((item) => item.kind === "topic" && ids.has(item.entityId) && item.domainId === domainId);
  const external = all.filter((item) => item.kind === "topic" && ids.has(item.entityId) && item.domainId !== domainId);
  const root = all.find((item) => item.id === `domain:${domainId}`)!;
  const nodes = [{ ...root, position: { x: 0, y: 80 } }, ...mainTopics.map((item, i) => ({ ...item, position: { x: 340 + i % 3 * 290, y: Math.floor(i / 3) * 150 } })), ...external.map((item, i) => ({ ...item, position: { x: 0, y: 250 + i * 140 } }))];
  for (const item of mainTopics) add(root.id, item.id, "membership");
  for (const relation of conceptRelations.filter((relation) => relation.type === "PREREQUISITE_OF")) {
    const source = all.find((item) => item.id === relation.sourceConceptId);
    const target = all.find((item) => item.id === relation.targetConceptId);
    if (source?.kind === "topic" && target?.kind === "topic" && ids.has(source.entityId) && ids.has(target.entityId)) add(source.id, target.id, "prerequisite");
  }
  return { nodes, edges: [...edges.values()] };
}

export function findAtlasEntities(query: string, entities: AtlasEntity[]) {
  const terms = normalizeAtlasQuery(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return entities.filter((item) => terms.every((term) => normalizeAtlasQuery(item.searchText).includes(term)))
    .sort((a, b) => Number(normalizeAtlasQuery(b.label).startsWith(terms.join(" "))) - Number(normalizeAtlasQuery(a.label).startsWith(terms.join(" ")))).slice(0, 8);
}

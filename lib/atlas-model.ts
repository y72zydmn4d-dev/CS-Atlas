import { domains, topics, domainById, topicById } from "@/content";
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
    ...topics.map((topic): AtlasEntity => ({ id: `topic:${topic.id}`, entityId: topic.id, kind: "topic", domainId: topic.domainId, label: localizeTopic(topic, locale).title, searchText: `${topic.title} ${localizeTopic(topic, "vi").title}`, summary: localizeTopic(topic, locale).summary, href: `/topics/${topic.slug}`, accent: domainById.get(topic.domainId)?.accent ?? "var(--accent)", position: { x: 0, y: 0 } })),
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
    for (const topic of topics) for (const prerequisiteId of topic.prerequisiteIds) {
      const prerequisite = topicById.get(prerequisiteId);
      if (prerequisite && domainById.has(prerequisite.domainId) && domainById.has(topic.domainId)) add(`domain:${prerequisite.domainId}`, `domain:${topic.domainId}`, "prerequisite");
    }
    return { nodes, edges: [...edges.values()] };
  }
  const domain = domainById.get(domainId)!;
  const ids = new Set(domain.topicIds);
  for (const id of domain.topicIds) for (const prerequisite of topicById.get(id)?.prerequisiteIds ?? []) if (topicById.has(prerequisite)) ids.add(prerequisite);
  const mainTopics = all.filter((item) => item.kind === "topic" && ids.has(item.entityId) && item.domainId === domainId);
  const external = all.filter((item) => item.kind === "topic" && ids.has(item.entityId) && item.domainId !== domainId);
  const root = all.find((item) => item.id === `domain:${domainId}`)!;
  const nodes = [{ ...root, position: { x: 0, y: 80 } }, ...mainTopics.map((item, i) => ({ ...item, position: { x: 340 + i % 3 * 290, y: Math.floor(i / 3) * 150 } })), ...external.map((item, i) => ({ ...item, position: { x: 0, y: 250 + i * 140 } }))];
  for (const item of mainTopics) add(root.id, item.id, "membership");
  for (const item of [...mainTopics, ...external]) for (const id of topicById.get(item.entityId)?.prerequisiteIds ?? []) if (ids.has(id)) add(`topic:${id}`, item.id, "prerequisite");
  return { nodes, edges: [...edges.values()] };
}

export function findAtlasEntities(query: string, entities: AtlasEntity[]) {
  const terms = normalizeAtlasQuery(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return entities.filter((item) => terms.every((term) => normalizeAtlasQuery(item.searchText).includes(term)))
    .sort((a, b) => Number(normalizeAtlasQuery(b.label).startsWith(terms.join(" "))) - Number(normalizeAtlasQuery(a.label).startsWith(terms.join(" ")))).slice(0, 8);
}

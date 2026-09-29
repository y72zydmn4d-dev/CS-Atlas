import { algorithms, domains, projects, techniques, topics } from "@/content";
import { domainTranslationsVi, topicTranslationsVi } from "@/content/translations/vi";
import type { Locale } from "@/lib/types";
import type { LibraryEntityType, LibraryRelation } from "@/lib/library/types";

export interface LibraryEntityOption { id: string; type: LibraryEntityType; label: string; labelVi?: string; hierarchy: string; hierarchyVi?: string }

const domainName = new Map(domains.map((domain) => [domain.id, domain.name]));
const domainNameVi = new Map(domains.map((domain) => [domain.id, domainTranslationsVi[domain.id]?.name ?? domain.name]));

export const libraryEntityOptions: LibraryEntityOption[] = [
  ...domains.map((item) => ({ id: item.id, type: "domain" as const, label: item.name, labelVi: domainTranslationsVi[item.id]?.name, hierarchy: "Domain", hierarchyVi: "Lĩnh vực" })),
  ...topics.map((item) => ({ id: item.id, type: "topic" as const, label: item.title, labelVi: topicTranslationsVi[item.id]?.title, hierarchy: `${domainName.get(item.domainId) ?? "Atlas"} · Topic`, hierarchyVi: `${domainNameVi.get(item.domainId) ?? "Atlas"} · Chủ đề` })),
  ...algorithms.map((item) => ({ id: item.id, type: "algorithm" as const, label: item.name, hierarchy: `${item.category} · Algorithm`, hierarchyVi: `${item.category} · Thuật toán` })),
  ...techniques.map((item) => ({ id: item.id, type: "technique" as const, label: item.name, hierarchy: `${item.family} · Technique`, hierarchyVi: `${item.family} · Kỹ thuật` })),
  ...projects.map((item) => ({ id: item.id, type: "project" as const, label: item.title, hierarchy: `${domainName.get(item.domainId) ?? "Atlas"} · Project`, hierarchyVi: `${domainNameVi.get(item.domainId) ?? "Atlas"} · Dự án` })),
  ...domains.flatMap((domain) => domain.syllabus.map((module) => ({ id: module.id, type: "module" as const, label: module.title, hierarchy: `${domain.name} · Module`, hierarchyVi: `${domainTranslationsVi[domain.id]?.name ?? domain.name} · Học phần` }))),
];

const entityMap = new Map(libraryEntityOptions.map((item) => [`${item.type}:${item.id}`, item]));

export function resolveLibraryRelation(relation: LibraryRelation, locale: Locale = "en") {
  const entity = entityMap.get(`${relation.entityType}:${relation.entityId}`);
  if (!entity) return null;
  return { ...entity, displayLabel: locale === "vi" ? entity.labelVi ?? entity.label : entity.label, displayHierarchy: locale === "vi" ? entity.hierarchyVi ?? entity.hierarchy : entity.hierarchy };
}

export function isValidLibraryRelation(relation: LibraryRelation) {
  return entityMap.has(`${relation.entityType}:${relation.entityId}`);
}

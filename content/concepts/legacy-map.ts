import { algorithms } from "@/content/algorithms";
import { techniques } from "@/content/techniques";
import { topics } from "@/content/topics";
import { conceptIdForAlgorithm, conceptIdForTechnique, conceptIdForTopic, type ConceptKind } from "@/lib/domain/concepts";

export interface LegacyConceptMapping {
  kind: ConceptKind;
  legacyId: string;
  legacySlug: string;
  legacyHref: string;
  conceptId: string;
  canonicalSlug: string;
  canonicalHref: string;
}

export const legacyConceptMappings: LegacyConceptMapping[] = [
  ...topics.map((item) => ({
    kind: "topic" as const,
    legacyId: item.id,
    legacySlug: item.slug,
    legacyHref: `/topics/${item.slug}`,
    conceptId: conceptIdForTopic(item.id),
    canonicalSlug: `topic-${item.slug}`,
    canonicalHref: `/concepts/topic-${item.slug}`,
  })),
  ...algorithms.map((item) => ({
    kind: "algorithm" as const,
    legacyId: item.id,
    legacySlug: item.slug,
    legacyHref: `/algorithms/${item.slug}`,
    conceptId: conceptIdForAlgorithm(item.id),
    canonicalSlug: `algorithm-${item.slug}`,
    canonicalHref: `/concepts/algorithm-${item.slug}`,
  })),
  ...techniques.map((item) => ({
    kind: "technique" as const,
    legacyId: item.id,
    legacySlug: item.slug,
    legacyHref: `/techniques/${item.slug}`,
    conceptId: conceptIdForTechnique(item.id),
    canonicalSlug: `technique-${item.slug}`,
    canonicalHref: `/concepts/technique-${item.slug}`,
  })),
];

const mappingBySourceId = new Map(legacyConceptMappings.map((item) => [`${item.kind}:${item.legacyId}`, item]));
const mappingBySourceSlug = new Map(legacyConceptMappings.map((item) => [`${item.kind}:${item.legacySlug}`, item]));

export function resolveLegacyConceptMapping(kind: ConceptKind, idOrSlug: string) {
  return mappingBySourceId.get(`${kind}:${idOrSlug}`) ?? mappingBySourceSlug.get(`${kind}:${idOrSlug}`) ?? null;
}

const mappingsByRawId = new Map<string, LegacyConceptMapping[]>();
for (const mapping of legacyConceptMappings) {
  const matches = mappingsByRawId.get(mapping.legacyId) ?? [];
  matches.push(mapping);
  mappingsByRawId.set(mapping.legacyId, matches);
}

export const legacyConceptCollisions = [...mappingsByRawId.entries()]
  .filter(([, mappings]) => mappings.length > 1)
  .map(([legacyId, mappings]) => ({ legacyId, conceptIds: mappings.map((item) => item.conceptId).sort() }))
  .sort((a, b) => a.legacyId.localeCompare(b.legacyId));

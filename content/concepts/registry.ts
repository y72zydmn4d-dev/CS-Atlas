import { algorithms } from "@/content/algorithms";
import { techniques } from "@/content/techniques";
import { topicTranslationsVi } from "@/content/translations/vi";
import { topics } from "@/content/topics";
import type { Concept, ConceptId, ConceptRelation, ConceptRelationType } from "@/lib/domain/concepts";
import { conceptIdForAlgorithm, conceptIdForTechnique, conceptIdForTopic, validateConceptRegistry } from "@/lib/domain/concepts";

export const canonicalConceptIdForTopic = conceptIdForTopic;
export const canonicalConceptIdForAlgorithm = conceptIdForAlgorithm;
export const canonicalConceptIdForTechnique = conceptIdForTechnique;

export const concepts: Concept[] = [
  ...topics.map((topic) => ({
    id: conceptIdForTopic(topic.id),
    slug: `topic-${topic.slug}`,
    aliases: [`topic:${topic.id}`, `topic-${topic.slug}`],
    kind: "topic" as const,
    domainId: topic.domainId,
    name: { en: topic.title, vi: topicTranslationsVi[topic.id]?.title ?? topic.title },
    summary: { en: topic.summary, vi: topicTranslationsVi[topic.id]?.summary ?? topic.summary },
    status: "active" as const,
    provenance: { source: "topic-registry" as const, legacyId: topic.id, contentVersion: topic.revision.version },
  })),
  ...algorithms.map((algorithm) => ({
    id: conceptIdForAlgorithm(algorithm.id),
    slug: `algorithm-${algorithm.slug}`,
    aliases: [`algorithm:${algorithm.id}`, `algorithm-${algorithm.slug}`],
    kind: "algorithm" as const,
    name: { en: algorithm.name, vi: algorithm.name },
    summary: { en: algorithm.summary, vi: algorithm.summary },
    status: "active" as const,
    provenance: { source: "algorithm-registry" as const, legacyId: algorithm.id, contentVersion: 1 },
  })),
  ...techniques.map((technique) => ({
    id: conceptIdForTechnique(technique.id),
    slug: `technique-${technique.slug}`,
    aliases: [`technique:${technique.id}`, `technique-${technique.slug}`],
    kind: "technique" as const,
    name: { en: technique.name, vi: technique.name },
    summary: { en: technique.summary, vi: technique.summary },
    status: "active" as const,
    provenance: { source: "technique-registry" as const, legacyId: technique.id, contentVersion: 1 },
  })),
];

export const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));
export const conceptBySlug = new Map(concepts.map((concept) => [concept.slug, concept]));

function resolveTopicConceptId(id: string): ConceptId | null {
  return concepts.some((concept) => concept.id === conceptIdForTopic(id)) ? conceptIdForTopic(id) : null;
}

function resolveAlgorithmConceptId(id: string): ConceptId | null {
  return concepts.some((concept) => concept.id === conceptIdForAlgorithm(id)) ? conceptIdForAlgorithm(id) : null;
}

function resolveTechniqueConceptId(id: string): ConceptId | null {
  return concepts.some((concept) => concept.id === conceptIdForTechnique(id)) ? conceptIdForTechnique(id) : null;
}

// Legacy topic records only carried one unqualified related ID. Resolve it
// within that known field, never through the public canonical resolver.
function resolveTopicRelatedConceptId(id: string): ConceptId | null {
  return resolveTopicConceptId(id) ?? resolveAlgorithmConceptId(id) ?? resolveTechniqueConceptId(id);
}

function relationId(type: ConceptRelationType, sourceConceptId: string, targetConceptId: string) {
  const ordered = type === "RELATED_TO" ? [sourceConceptId, targetConceptId].sort() : [sourceConceptId, targetConceptId];
  return `${type.toLowerCase()}:${ordered.join("->")}`;
}

function createRelation(
  sourceConceptId: ConceptId | null,
  targetConceptId: ConceptId | null,
  type: ConceptRelationType,
  provenance: ConceptRelation["provenance"],
): ConceptRelation | null {
  if (!sourceConceptId || !targetConceptId || sourceConceptId === targetConceptId) return null;
  return {
    id: relationId(type, sourceConceptId, targetConceptId),
    sourceConceptId,
    targetConceptId,
    type,
    provenance,
    relationVersion: 1,
  };
}

const derivedRelations = [
  ...topics.flatMap((topic) => [
    ...topic.prerequisiteIds.map((prerequisiteId) => createRelation(resolveTopicConceptId(prerequisiteId), conceptIdForTopic(topic.id), "PREREQUISITE_OF", "legacy-topic-links")),
    ...topic.relatedTopicIds.map((relatedId) => createRelation(conceptIdForTopic(topic.id), resolveTopicRelatedConceptId(relatedId), "RELATED_TO", "legacy-topic-links")),
  ]),
  ...algorithms.flatMap((algorithm) => [
    ...algorithm.prerequisiteIds.map((prerequisiteId) => createRelation(resolveTopicConceptId(prerequisiteId) ?? resolveAlgorithmConceptId(prerequisiteId), conceptIdForAlgorithm(algorithm.id), "PREREQUISITE_OF", "legacy-algorithm-links")),
    ...algorithm.relatedIds.map((relatedId) => createRelation(conceptIdForAlgorithm(algorithm.id), resolveAlgorithmConceptId(relatedId) ?? resolveTechniqueConceptId(relatedId) ?? resolveTopicConceptId(relatedId), "RELATED_TO", "legacy-algorithm-links")),
    ...algorithm.techniqueIds.map((techniqueId) => createRelation(conceptIdForAlgorithm(algorithm.id), resolveTechniqueConceptId(techniqueId), "USES", "legacy-algorithm-links")),
  ]),
  ...techniques.flatMap((technique) => [
    ...technique.topicIds.map((topicId) => createRelation(conceptIdForTechnique(technique.id), resolveTopicConceptId(topicId), "USES", "legacy-technique-links")),
    ...technique.algorithmIds.map((algorithmId) => createRelation(conceptIdForTechnique(technique.id), resolveAlgorithmConceptId(algorithmId), "BUILDS_ON", "legacy-technique-links")),
  ]),
].filter((relation): relation is ConceptRelation => relation !== null);

export const conceptRelations = Array.from(new Map(derivedRelations.map((relation) => [relation.id, relation])).values());
export const conceptValidationIssues = validateConceptRegistry(concepts, conceptRelations);

export function resolveConcept(value: string): Concept | null {
  return conceptById.get(value) ?? conceptBySlug.get(value) ?? null;
}

export const conceptRelationTypes = [
  "PREREQUISITE_OF",
  "RELATED_TO",
  "PART_OF",
  "USES",
  "BUILDS_ON",
  "NEXT_TOPIC",
] as const;

export type ConceptRelationType = (typeof conceptRelationTypes)[number];
export type ConceptKind = "topic" | "algorithm" | "technique";
export type ConceptStatus = "active" | "deprecated";
export type ConceptId = string;

export const conceptIdForTopic = (legacyId: string): ConceptId => `topic:${legacyId}`;
export const conceptIdForAlgorithm = (legacyId: string): ConceptId => `algorithm:${legacyId}`;
export const conceptIdForTechnique = (legacyId: string): ConceptId => `technique:${legacyId}`;

export interface LocalizedConceptText {
  en: string;
  vi: string;
}

export interface ConceptProvenance {
  source: "topic-registry" | "algorithm-registry" | "technique-registry";
  legacyId: string;
  contentVersion: number;
}

export interface Concept {
  id: ConceptId;
  slug: string;
  aliases: string[];
  kind: ConceptKind;
  domainId?: string;
  name: LocalizedConceptText;
  summary: LocalizedConceptText;
  status: ConceptStatus;
  provenance: ConceptProvenance;
}

export interface ConceptRelation {
  id: string;
  sourceConceptId: ConceptId;
  targetConceptId: ConceptId;
  type: ConceptRelationType;
  provenance: "legacy-topic-links" | "legacy-algorithm-links" | "legacy-technique-links";
  relationVersion: 1;
}

export interface ConceptValidationIssue {
  code: "duplicate-concept" | "duplicate-alias" | "invalid-relation" | "relation-cycle";
  message: string;
}

const acyclicRelationTypes = new Set<ConceptRelationType>(["PREREQUISITE_OF", "PART_OF"]);

export function validateConceptRegistry(concepts: Concept[], relations: ConceptRelation[]): ConceptValidationIssue[] {
  const issues: ConceptValidationIssue[] = [];
  const conceptIds = new Set<string>();
  const aliases = new Set<string>();

  for (const concept of concepts) {
    if (conceptIds.has(concept.id)) issues.push({ code: "duplicate-concept", message: `Duplicate concept ID: ${concept.id}` });
    conceptIds.add(concept.id);
    const ownAliases = new Set<string>();
    for (const alias of [concept.slug, ...concept.aliases]) {
      const normalized = alias.trim().toLowerCase();
      if (!normalized) issues.push({ code: "duplicate-alias", message: `Empty alias on concept ${concept.id}` });
      else if (ownAliases.has(normalized)) continue;
      else if (aliases.has(normalized)) issues.push({ code: "duplicate-alias", message: `Duplicate concept alias: ${alias}` });
      else { ownAliases.add(normalized); aliases.add(normalized); }
    }
  }

  const relationIds = new Set<string>();
  const relationPairs = new Set<string>();
  for (const relation of relations) {
    if (relationIds.has(relation.id)) issues.push({ code: "invalid-relation", message: `Duplicate relation ID: ${relation.id}` });
    relationIds.add(relation.id);
    if (!conceptIds.has(relation.sourceConceptId) || !conceptIds.has(relation.targetConceptId)) {
      issues.push({ code: "invalid-relation", message: `Relation ${relation.id} references an unknown concept` });
    }
    if (relation.sourceConceptId === relation.targetConceptId) {
      issues.push({ code: "invalid-relation", message: `Relation ${relation.id} is a self relation` });
    }
    const pair = relation.type === "RELATED_TO"
      ? [relation.sourceConceptId, relation.targetConceptId].sort().join("|")
      : `${relation.sourceConceptId}|${relation.targetConceptId}`;
    const key = `${relation.type}|${pair}`;
    if (relationPairs.has(key)) issues.push({ code: "invalid-relation", message: `Duplicate relation semantics: ${key}` });
    relationPairs.add(key);
  }

  for (const type of acyclicRelationTypes) {
    const adjacency = new Map<string, string[]>();
    for (const concept of concepts) adjacency.set(concept.id, []);
    for (const relation of relations) {
      if (relation.type === type) adjacency.get(relation.sourceConceptId)?.push(relation.targetConceptId);
    }
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string): boolean => {
      if (visiting.has(id)) return true;
      if (visited.has(id)) return false;
      visiting.add(id);
      for (const target of adjacency.get(id) ?? []) if (visit(target)) return true;
      visiting.delete(id);
      visited.add(id);
      return false;
    };
    if (concepts.some((concept) => visit(concept.id))) {
      issues.push({ code: "relation-cycle", message: `${type} relations contain a cycle` });
    }
  }

  return issues;
}

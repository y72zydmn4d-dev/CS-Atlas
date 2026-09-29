import { resolveConcept } from "@/content/concepts/registry";
import { conceptIdForAlgorithm, conceptIdForTechnique, conceptIdForTopic } from "@/lib/domain/concepts";
import type { LibraryEntityType, LibraryRelation } from "@/lib/library/types";

export type CanonicalLibraryRelation =
  | { status: "resolved"; conceptId: string; relation: LibraryRelation["relation"]; legacy: LibraryRelation }
  | { status: "legacy"; reason: "not-a-concept" | "unresolved"; legacy: LibraryRelation };

/**
 * Compatibility adapter for existing IndexedDB metadata. It never rewrites a
 * relation, so invalid historical references remain exportable and repairable.
 */
export function resolveCanonicalLibraryRelation(relation: LibraryRelation): CanonicalLibraryRelation {
  const conceptId = relation.entityType === "concept"
    ? relation.entityId
    : relation.entityType === "topic"
    ? conceptIdForTopic(relation.entityId)
    : relation.entityType === "algorithm"
      ? conceptIdForAlgorithm(relation.entityId)
      : relation.entityType === "technique"
        ? conceptIdForTechnique(relation.entityId)
        : null;
  if (!conceptId) return { status: "legacy", reason: "not-a-concept", legacy: relation };
  return resolveConcept(conceptId)
    ? { status: "resolved", conceptId, relation: relation.relation, legacy: relation }
    : { status: "legacy", reason: "unresolved", legacy: relation };
}

export interface LibraryEntityReference {
  entityType: LibraryEntityType;
  entityId: string;
}

/**
 * Treat a canonical Concept relation and its source-qualified legacy relation
 * as the same lookup target. This is intentionally read-only compatibility:
 * stored IndexedDB metadata is preserved until a user explicitly edits it.
 */
export function matchesLibraryEntity(relation: LibraryRelation, target: LibraryEntityReference) {
  if (relation.entityType === target.entityType && relation.entityId === target.entityId) return true;
  const resolvedRelation = resolveCanonicalLibraryRelation(relation);
  const resolvedTarget = resolveCanonicalLibraryRelation({ ...target, relation: relation.relation });
  return resolvedRelation.status === "resolved"
    && resolvedTarget.status === "resolved"
    && resolvedRelation.conceptId === resolvedTarget.conceptId;
}

export function canonicalLibraryEntityReference(target: LibraryEntityReference): LibraryEntityReference {
  const resolved = resolveCanonicalLibraryRelation({ ...target, relation: "reference" });
  return resolved.status === "resolved"
    ? { entityType: "concept", entityId: resolved.conceptId }
    : target;
}

export function parseLibraryEntityReference(value: string): LibraryEntityReference | null {
  const separator = value.indexOf(":");
  if (separator <= 0 || separator === value.length - 1) return null;
  const entityType = value.slice(0, separator);
  if (!["concept", "domain", "topic", "algorithm", "technique", "project", "module"].includes(entityType)) return null;
  return { entityType: entityType as LibraryEntityType, entityId: value.slice(separator + 1) };
}

import { resolveConcept } from "@/content/concepts/registry";
import { conceptIdForAlgorithm, conceptIdForTechnique, conceptIdForTopic } from "@/lib/domain/concepts";
import type { LibraryRelation } from "@/lib/library/types";

export type CanonicalLibraryRelation =
  | { status: "resolved"; conceptId: string; relation: LibraryRelation["relation"]; legacy: LibraryRelation }
  | { status: "legacy"; reason: "not-a-concept" | "unresolved"; legacy: LibraryRelation };

/**
 * Compatibility adapter for existing IndexedDB metadata. It never rewrites a
 * relation, so invalid historical references remain exportable and repairable.
 */
export function resolveCanonicalLibraryRelation(relation: LibraryRelation): CanonicalLibraryRelation {
  const conceptId = relation.entityType === "topic"
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

import {
  conceptRelations,
  concepts,
  resolveConcept,
} from "@/content/concepts/registry";
import type { Concept, ConceptId, ConceptRelation, ConceptRelationType, ConceptValidationIssue } from "@/lib/domain/concepts";
import { validateConceptRegistry } from "@/lib/domain/concepts";

export interface ConceptNeighborhood {
  concepts: Concept[];
  relations: ConceptRelation[];
}

export interface ConceptGraphService {
  getConcept(idOrAlias: string): Concept | null;
  listRelations(input: { conceptId: ConceptId; types?: ConceptRelationType[]; direction?: "in" | "out" | "both"; limit?: number }): ConceptRelation[];
  getNeighborhood(input: { conceptId: ConceptId; types?: ConceptRelationType[]; depth: 1 | 2; limit: number }): ConceptNeighborhood;
  validateRelations(): ConceptValidationIssue[];
}

function filteredRelations(
  conceptId: ConceptId,
  types: ConceptRelationType[] | undefined,
  direction: "in" | "out" | "both",
) {
  return conceptRelations.filter((relation) => {
    if (types && !types.includes(relation.type)) return false;
    if (direction === "in") return relation.targetConceptId === conceptId;
    if (direction === "out") return relation.sourceConceptId === conceptId;
    return relation.sourceConceptId === conceptId || relation.targetConceptId === conceptId;
  });
}

export const conceptGraphService: ConceptGraphService = {
  getConcept: resolveConcept,
  listRelations({ conceptId, types, direction = "both", limit = 40 }) {
    return filteredRelations(conceptId, types, direction).slice(0, Math.max(1, Math.min(limit, 100)));
  },
  getNeighborhood({ conceptId, types, depth, limit }) {
    const cappedLimit = Math.max(1, Math.min(limit, 100));
    const seen = new Set<ConceptId>([conceptId]);
    let frontier = [conceptId];
    const relations: ConceptRelation[] = [];
    for (let level = 0; level < depth && frontier.length && seen.size < cappedLimit; level += 1) {
      const next: ConceptId[] = [];
      for (const current of frontier) {
        for (const relation of filteredRelations(current, types, "both")) {
          if (!relations.some((item) => item.id === relation.id)) relations.push(relation);
          const neighbor = relation.sourceConceptId === current ? relation.targetConceptId : relation.sourceConceptId;
          if (!seen.has(neighbor) && seen.size < cappedLimit) {
            seen.add(neighbor);
            next.push(neighbor);
          }
        }
      }
      frontier = next;
    }
    return {
      concepts: concepts.filter((concept) => seen.has(concept.id)),
      relations: relations.filter((relation) => seen.has(relation.sourceConceptId) && seen.has(relation.targetConceptId)),
    };
  },
  validateRelations() {
    return validateConceptRegistry(concepts, conceptRelations);
  },
};

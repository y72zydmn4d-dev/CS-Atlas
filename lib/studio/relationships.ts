import type { LocalizedConceptText } from "@/lib/domain/concepts";

/** Presentation-only projections, never persisted authoring records. */
export const relationshipKinds = ["concepts", "exercises", "problems", "references", "examples", "lessons"] as const;
export type RelationshipKind = (typeof relationshipKinds)[number];
export const relationshipSearchLimit = 20;
export const relationshipResolveLimit = 40;
export const relationshipQueryLimit = 120;

export interface RelationshipOption {
  kind: RelationshipKind;
  id: string;
  label: LocalizedConceptText;
  description: LocalizedConceptText;
  metadata: string[];
}
export interface RelationshipResponse {
  version: 1;
  kind: RelationshipKind;
  items: RelationshipOption[];
  unresolvedIds: string[];
  hasMore: boolean;
}
export function isRelationshipKind(value: string): value is RelationshipKind {
  return relationshipKinds.some((kind) => kind === value);
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function text(value: unknown, max: number): value is string { return typeof value === "string" && value.length <= max; }
function localized(value: unknown): boolean { return record(value) && text(value.en, 240) && text(value.vi, 240); }

/** Transport validation only; canonical draft/graph validation belongs to D. */
export function isRelationshipResponse(value: unknown, kind: RelationshipKind): value is RelationshipResponse {
  return record(value) && value.version === 1 && value.kind === kind && typeof value.hasMore === "boolean"
    && Array.isArray(value.items) && value.items.length <= relationshipResolveLimit
    && value.items.every((item) => record(item) && item.kind === kind && text(item.id, 200) && item.id.length > 0
      && localized(item.label) && localized(item.description) && Array.isArray(item.metadata)
      && item.metadata.length <= 12 && item.metadata.every((entry) => text(entry, 200)))
    && Array.isArray(value.unresolvedIds) && value.unresolvedIds.length <= relationshipResolveLimit
    && value.unresolvedIds.every((id) => text(id, 200))
    && new Set(value.items.map((item) => item.id)).size === value.items.length;
}

/** Preserve original legacy duplicates until explicitly repaired; never add another. */
export function addRelationshipId(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? [...ids] : [...ids, id];
}

import { isRelationshipResponse, relationshipResolveLimit, type RelationshipKind, type RelationshipResponse } from "@/lib/studio/relationships";

async function read(kind: RelationshipKind, query: URLSearchParams, signal: AbortSignal): Promise<RelationshipResponse> {
  const response = await fetch(`/api/studio/relationships/${kind}?${query}`, { method: "GET", cache: "no-store", signal });
  if (!response.ok) throw new Error("relationship-read-failed");
  const value: unknown = await response.json();
  if (!isRelationshipResponse(value, kind)) throw new Error("invalid-relationship-response");
  return value;
}
export function searchStudioOptions(kind: RelationshipKind, query: string, signal: AbortSignal) {
  return read(kind, new URLSearchParams({ q: query }), signal);
}
export async function resolveStudioOptions(kind: RelationshipKind, ids: readonly string[], signal: AbortSignal): Promise<RelationshipResponse> {
  const items: RelationshipResponse["items"] = [];
  const unresolvedIds: string[] = [];
  const unique = [...new Set(ids)];
  // Large legacy lists remain intact; sequential bounded requests, never one request per chip.
  for (let offset = 0; offset < unique.length; offset += relationshipResolveLimit) {
    const query = new URLSearchParams();
    unique.slice(offset, offset + relationshipResolveLimit).forEach((id) => query.append("id", id));
    const result = await read(kind, query, signal);
    items.push(...result.items); unresolvedIds.push(...result.unresolvedIds);
  }
  return { version: 1, kind, items, unresolvedIds, hasMore: false };
}

import type { Locale, SearchResult, SearchResultType } from "@/lib/types";
import { searchContent } from "@/lib/search";

export const SEARCH_DOCUMENT_SCHEMA_VERSION = 1 as const;
export type SearchVisibility = "public" | "owner-private";

export interface SearchDocument extends SearchResult {
  schemaVersion: typeof SEARCH_DOCUMENT_SCHEMA_VERSION;
  entityType: SearchResultType;
  canonicalId: string;
  visibility: SearchVisibility;
  sourceVersion: string;
  ownerScope?: "local-browser";
}

function project(result: SearchResult, visibility: SearchVisibility, sourceVersion: string): SearchDocument {
  return {
    ...result,
    schemaVersion: SEARCH_DOCUMENT_SCHEMA_VERSION,
    entityType: result.type,
    canonicalId: result.canonicalId ?? `${result.type.toLocaleLowerCase()}:${result.id}`,
    visibility,
    sourceVersion,
    ...(visibility === "owner-private" ? { ownerScope: "local-browser" as const } : {}),
  };
}

export function projectPublicSearchDocuments(results: SearchResult[]) {
  return results.map((result) => project(result, "public", "content-registry:v1"));
}

export function projectLocalPrivateSearchDocuments(results: SearchResult[]) {
  return results.map((result) => project(result, "owner-private", "library-metadata:v2"));
}

export function validateSearchDocuments(documents: SearchDocument[]) {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const document of documents) {
    const key = `${document.visibility}:${document.entityType}:${document.id}`;
    if (ids.has(key)) errors.push(`Duplicate search document: ${key}`);
    ids.add(key);
    if (document.schemaVersion !== SEARCH_DOCUMENT_SCHEMA_VERSION || !document.canonicalId || !document.sourceVersion) errors.push(`Stale or invalid search document: ${key}`);
    if (document.visibility === "owner-private" ? document.ownerScope !== "local-browser" : document.ownerScope !== undefined) errors.push(`Invalid search ownership: ${key}`);
    if (!document.href.startsWith("/") && !document.href.startsWith("https://")) errors.push(`Unsafe search destination: ${key}`);
  }
  return errors;
}

export function searchDocuments(input: { query: string; locale: Locale; type?: SearchResultType; limit: number; includeLocalPrivate: boolean }, documents: SearchDocument[]) {
  const visible = documents.filter((document) => (document.visibility === "public" || input.includeLocalPrivate) && (!input.type || document.entityType === input.type));
  // The compatibility matcher remains the deterministic fallback adapter.
  return searchContent(input.query, visible).slice(0, Math.max(1, Math.min(input.limit, 100)));
}

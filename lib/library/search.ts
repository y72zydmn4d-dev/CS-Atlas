import type { LibraryItem, LibrarySearchResult } from "@/lib/library/types";
import { resolveLibraryRelation } from "@/lib/library/entities";
import type { SearchResult } from "@/lib/types";
import { LIBRARY_CONFIG } from "@/lib/library/config";

export function normalizeLibraryText(value: string) {
  return value.toLowerCase().replaceAll("đ", "d").normalize("NFKD").replace(/\p{M}/gu, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

export function searchLibraryItems(query: string, items: LibraryItem[], limit = 30): LibrarySearchResult[] {
  const terms = normalizeLibraryText(query).split(" ").filter(Boolean);
  const ranked = items.map((item) => {
    const title = normalizeLibraryText(item.title);
    const tags = normalizeLibraryText(item.tags.join(" "));
    const metadata = normalizeLibraryText([item.description, item.authors?.join(" "), item.sourceName, item.notes, item.fileName, item.url, item.linkPreview?.title, item.linkPreview?.description, item.linkPreview?.siteName, item.linkPreview?.author, item.linkPreview?.providerLabel].filter(Boolean).join(" "));
    const relations = item.relatedEntities.map((relation) => resolveLibraryRelation(relation)?.label ?? "").join(" ");
    const body = normalizeLibraryText(item.extractedText?.slice(0, LIBRARY_CONFIG.searchBodyCharacters) ?? "");
    if (terms.length && !terms.every((term) => `${title} ${tags} ${metadata} ${normalizeLibraryText(relations)} ${body}`.includes(term))) return null;
    const score = terms.reduce((sum, term) => sum + (title === term ? 120 : title.startsWith(term) ? 70 : title.includes(term) ? 45 : tags.includes(term) ? 30 : metadata.includes(term) ? 14 : normalizeLibraryText(relations).includes(term) ? 12 : body.includes(term) ? 2 : 0), 0);
    return { item, score, context: item.relatedEntities.map((relation) => resolveLibraryRelation(relation)?.label).find(Boolean) ?? item.sourceName ?? item.fileFormat ?? "Library" };
  }).filter((entry): entry is LibrarySearchResult => Boolean(entry));
  return ranked.sort((a, b) => b.score - a.score || Date.parse(b.item.updatedAt) - Date.parse(a.item.updatedAt)).slice(0, limit);
}

export function libraryItemsToSearchResults(items: LibraryItem[]): SearchResult[] {
  return items.map((item) => {
    const context = item.relatedEntities.map((relation) => resolveLibraryRelation(relation)?.label).find(Boolean) ?? item.sourceName ?? "Library";
    return { id: item.id, title: item.title, type: "Library" as const, hierarchy: `${item.type === "link" ? "Link" : item.fileFormat?.toUpperCase() ?? "File"} · ${context}`, href: `/library/${item.id}`, keywords: [item.description, item.authors?.join(" "), item.sourceName, item.collection, item.tags.join(" "), item.notes, item.extractedText?.slice(0, LIBRARY_CONFIG.searchBodyCharacters), item.url, item.linkPreview?.title, item.linkPreview?.description, item.linkPreview?.siteName, item.linkPreview?.author, item.linkPreview?.providerLabel, ...item.relatedEntities.map((relation) => resolveLibraryRelation(relation)?.label)].filter(Boolean).join(" ") };
  });
}

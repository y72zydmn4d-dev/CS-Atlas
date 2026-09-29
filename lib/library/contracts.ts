import type { LibraryCollection, LibraryFileObject, LibraryItem, LibraryNote, LibraryResourceLink } from "@/lib/library/types";
import { LOCAL_LIBRARY_OWNER } from "@/lib/library/types";

export function fileObjectForLibraryItem(item: LibraryItem): LibraryFileObject | null {
  if (item.type !== "file" || item.fileSize === undefined) return null;
  return { itemId: item.id, owner: LOCAL_LIBRARY_OWNER, storage: "indexeddb", blobKey: item.id, size: item.fileSize, mimeType: item.mimeType, contentHash: item.contentHash };
}

export function noteForLibraryItem(item: LibraryItem): LibraryNote | null {
  if (!item.notes?.trim()) return null;
  return { id: `library-note:${item.id}`, itemId: item.id, owner: LOCAL_LIBRARY_OWNER, body: item.notes, visibility: "private", schemaVersion: 1 };
}

export function collectionForLibraryItems(title: string, items: LibraryItem[]): LibraryCollection | null {
  const normalized = title.trim();
  if (!normalized) return null;
  return { id: `library-collection:${encodeURIComponent(normalized.toLocaleLowerCase())}`, owner: LOCAL_LIBRARY_OWNER, title: normalized, itemIds: items.filter((item) => item.collection === normalized).map((item) => item.id), visibility: "private", schemaVersion: 1 };
}

export function resourceLinkForLibraryItem(item: LibraryItem): LibraryResourceLink | null {
  if (item.type !== "link" || !item.url) return null;
  return { id: `library-resource-link:${item.id}`, itemId: item.id, owner: LOCAL_LIBRARY_OWNER, url: item.url, canonicalUrl: item.canonicalUrl };
}

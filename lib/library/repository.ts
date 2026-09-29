import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { LIBRARY_CONFIG } from "@/lib/library/config";
import { matchesLibraryEntity } from "@/lib/library/concept-relations";
import { searchLibraryItems } from "@/lib/library/search";
import { LIBRARY_SCHEMA_VERSION, type CreateLibraryItemInput, type LibraryExport, type LibraryImportResult, type LibraryItem, type LibraryQuery, type LibraryRepository, type LibrarySearchResult, type UpdateLibraryItemInput } from "@/lib/library/types";
import { migrateLibraryItem, validateLibraryExport, validateLibraryItem } from "@/lib/library/validation";

interface LibraryDatabase extends DBSchema {
  items: { key: string; value: LibraryItem; indexes: { "by-updated": string; "by-canonical-url": string; "by-fingerprint": string; "by-hash": string } };
  files: { key: string; value: Blob };
}

let databasePromise: Promise<IDBPDatabase<LibraryDatabase>> | null = null;

function getDatabase() {
  if (typeof indexedDB === "undefined") throw new Error("indexeddb-unavailable");
  if (!databasePromise) databasePromise = openDB<LibraryDatabase>(LIBRARY_CONFIG.databaseName, LIBRARY_CONFIG.databaseVersion, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("items")) {
        const store = database.createObjectStore("items", { keyPath: "id" });
        store.createIndex("by-updated", "updatedAt");
        store.createIndex("by-canonical-url", "canonicalUrl");
        store.createIndex("by-fingerprint", "fileFingerprint");
        store.createIndex("by-hash", "contentHash");
      }
      if (!database.objectStoreNames.contains("files")) database.createObjectStore("files");
    },
    blocking() { databasePromise = null; },
    terminated() { databasePromise = null; },
  });
  return databasePromise;
}

function notifyChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("cs-atlas:library-changed"));
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `library-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function matches(item: LibraryItem, query?: LibraryQuery) {
  if (!query) return true;
  if (query.type && query.type !== "all" && item.type !== query.type) return false;
  if (query.format && query.format !== "all" && item.fileFormat !== query.format) return false;
  if (query.tag && !item.tags.includes(query.tag)) return false;
  const entityId = query.entityId;
  if (entityId && !item.relatedEntities.some((relation) => query.entityType
    ? matchesLibraryEntity(relation, { entityType: query.entityType, entityId })
    : relation.entityId === entityId)) return false;
  return true;
}

export class IndexedDbLibraryRepository implements LibraryRepository {
  async list(options?: LibraryQuery) {
    const database = await getDatabase();
    const values: unknown[] = await database.getAll("items");
    const valid: LibraryItem[] = [];
    for (const value of values) {
      const item = migrateLibraryItem(value);
      if (item) { valid.push(item); if ((value as LibraryItem).schemaVersion !== LIBRARY_SCHEMA_VERSION) await database.put("items", item); }
      else if (value && typeof value === "object" && "id" in value && typeof value.id === "string") await database.delete("items", value.id);
    }
    return valid.filter((item) => matches(item, options)).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }

  async get(id: string) {
    const database = await getDatabase();
    const value = await database.get("items", id);
    if (!value) return null;
    const item = migrateLibraryItem(value);
    if (!item) { await this.remove(id); return null; }
    if (value.schemaVersion !== LIBRARY_SCHEMA_VERSION) await database.put("items", item);
    return item;
  }

  async create(input: CreateLibraryItemInput) {
    const database = await getDatabase();
    const now = new Date().toISOString();
    const { file, id: inputId, ...fields } = input;
    const metadata: LibraryItem = { ...fields, schemaVersion: LIBRARY_SCHEMA_VERSION, id: inputId ?? makeId(), importedAt: now, updatedAt: now };
    if (!validateLibraryItem(metadata)) throw new Error("invalid-library-item");
    const transaction = database.transaction(["items", "files"], "readwrite");
    await transaction.objectStore("items").add(metadata);
    if (file) await transaction.objectStore("files").put(file, metadata.id);
    await transaction.done;
    notifyChanged();
    return metadata;
  }

  async update(id: string, patch: UpdateLibraryItemInput) {
    const database = await getDatabase();
    const existing = await this.get(id);
    if (!existing) throw new Error("library-item-not-found");
    const item: LibraryItem = { ...existing, ...patch, id, schemaVersion: LIBRARY_SCHEMA_VERSION, importedAt: existing.importedAt, updatedAt: new Date().toISOString() };
    if (!validateLibraryItem(item)) throw new Error("invalid-library-item");
    await database.put("items", item);
    notifyChanged();
    return item;
  }

  async remove(id: string) {
    const database = await getDatabase();
    const transaction = database.transaction(["items", "files"], "readwrite");
    await Promise.all([transaction.objectStore("items").delete(id), transaction.objectStore("files").delete(id)]);
    await transaction.done;
    notifyChanged();
  }

  async getFile(id: string) { return (await getDatabase()).get("files", id).then((value) => value ?? null); }
  async putFile(id: string, file: Blob) { await (await getDatabase()).put("files", file, id); notifyChanged(); }
  async search(query: string, limit = LIBRARY_CONFIG.searchResultLimit): Promise<LibrarySearchResult[]> { return searchLibraryItems(query, await this.list(), limit); }

  async findDuplicate(input: { canonicalUrl?: string; fileFingerprint?: string; contentHash?: string }) {
    const database = await getDatabase();
    if (input.canonicalUrl) { const match = await database.getFromIndex("items", "by-canonical-url", input.canonicalUrl); if (match) return migrateLibraryItem(match); }
    if (input.contentHash) { const match = await database.getFromIndex("items", "by-hash", input.contentHash); if (match) return migrateLibraryItem(match); }
    if (input.fileFingerprint) { const match = await database.getFromIndex("items", "by-fingerprint", input.fileFingerprint); if (match) return migrateLibraryItem(match); }
    return null;
  }

  async exportMetadata(): Promise<LibraryExport> {
    const items = (await this.list()).map((item) => {
      // A metadata transfer deliberately excludes extracted file text and its
      // excerpt. Those are derived from private source bytes and require an
      // explicit file re-import on the receiving browser.
      if (item.type !== "file") return item;
      const metadata = { ...item };
      delete metadata.extractedText;
      delete metadata.excerpt;
      return metadata;
    });
    return { schemaVersion: LIBRARY_SCHEMA_VERSION, exportedAt: new Date().toISOString(), items };
  }

  async importMetadata(value: unknown): Promise<LibraryImportResult> {
    if (!validateLibraryExport(value)) throw new Error("invalid-library-export");
    const database = await getDatabase();
    const result: LibraryImportResult = { created: 0, skipped: 0, invalid: 0, filesNeedingReimport: 0 };
    for (const rawItem of value.items) {
      const item = migrateLibraryItem(rawItem);
      if (!item) { result.invalid += 1; continue; }
      if (await database.get("items", item.id)) { result.skipped += 1; continue; }
      // A metadata export intentionally has no blob. Preserve its record and
      // extraction metadata, but make the missing original explicit.
      const restored = item.type === "file"
        ? { ...item, status: "failed" as const, errorCode: "storage" as const, extractionStatus: item.extractionStatus === "unsupported" ? "unsupported" as const : "failed" as const, extractedText: undefined, excerpt: item.excerpt ?? "Original file must be imported again after metadata restore." }
        : item;
      await database.put("items", restored);
      result.created += 1;
      if (restored.type === "file") result.filesNeedingReimport += 1;
    }
    notifyChanged();
    return result;
  }
}

export const libraryRepository: LibraryRepository = new IndexedDbLibraryRepository();

export async function resetLibraryDatabaseForTests() {
  if (databasePromise) { const database = await databasePromise; database.close(); }
  databasePromise = null;
}

import { LIBRARY_CONFIG } from "@/lib/library/config";
import { LIBRARY_SCHEMA_VERSION, type LibraryFileFormat, type LibraryItem, type LibraryRelation, type LinkPreviewMetadata } from "@/lib/library/types";

const formats = new Set<LibraryFileFormat>(["pdf", "docx", "markdown", "text", "other"]);
const relationTypes = new Set(["concept", "domain", "topic", "algorithm", "technique", "project", "module"]);
const relationKinds = new Set(["primary", "prerequisite", "supplementary", "example", "exercise", "reference"]);

export function canonicalizeUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    if ((url.protocol === "https:" && url.port === "443") || (url.protocol === "http:" && url.port === "80")) url.port = "";
    if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch { return null; }
}

export function validateRelation(value: unknown): value is LibraryRelation {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.entityId === "string" && item.entityId.length > 0 && relationTypes.has(String(item.entityType)) && relationKinds.has(String(item.relation));
}

export function validateLibraryItem(value: unknown): value is LibraryItem {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (item.schemaVersion !== LIBRARY_SCHEMA_VERSION || typeof item.id !== "string" || !item.id) return false;
  if (item.type !== "file" && item.type !== "link") return false;
  if (typeof item.title !== "string" || !item.title.trim() || item.title.length > 300) return false;
  if (typeof item.importedAt !== "string" || typeof item.updatedAt !== "string") return false;
  if (!Array.isArray(item.tags) || !item.tags.every((tag) => typeof tag === "string" && tag.length <= 80)) return false;
  if (item.collection !== undefined && (typeof item.collection !== "string" || item.collection.length > 120)) return false;
  if (!Array.isArray(item.relatedEntities) || !item.relatedEntities.every(validateRelation)) return false;
  if (!["ready", "processing", "failed", "unsupported"].includes(String(item.status))) return false;
  if (!["not-needed", "pending", "complete", "partial", "failed", "unsupported"].includes(String(item.extractionStatus))) return false;
  if (item.type === "link") return typeof item.url === "string" && canonicalizeUrl(item.url) !== null && (item.linkPreview === undefined || validateLinkPreview(item.linkPreview));
  return typeof item.fileName === "string" && typeof item.fileSize === "number" && item.fileSize >= 0 && item.fileSize <= LIBRARY_CONFIG.maxFileBytes && formats.has(item.fileFormat as LibraryFileFormat);
}

export function validateLinkPreview(value: unknown): value is LinkPreviewMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const preview = value as Record<string, unknown>;
  if (!["idle", "loading", "ready", "partial", "failed", "manual"].includes(String(preview.status))) return false;
  for (const key of ["canonicalUrl", "title", "description", "siteName", "author", "publishedAt", "fetchedAt", "errorCode", "providerLabel"]) {
    if (preview[key] !== undefined && (typeof preview[key] !== "string" || preview[key].length > 2_000)) return false;
  }
  for (const key of ["imageUrl", "manualImageUrl", "faviconUrl"]) {
    if (preview[key] !== undefined && (typeof preview[key] !== "string" || preview[key].length > 2_000 || canonicalizeUrl(preview[key]) === null)) return false;
  }
  if (preview.suppressImage !== undefined && typeof preview.suppressImage !== "boolean") return false;
  return preview.provider === undefined || ["youtube", "github", "website"].includes(String(preview.provider));
}

export function migrateLibraryItem(value: unknown): LibraryItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const old = value as Record<string, unknown>;
  if (old.schemaVersion === LIBRARY_SCHEMA_VERSION) return validateLibraryItem(value) ? value : null;
  if (old.schemaVersion !== 1) return null;
  const migrated = { ...old, schemaVersion: LIBRARY_SCHEMA_VERSION, linkPreview: old.type === "link" ? { status: "idle" } : undefined };
  return validateLibraryItem(migrated) ? migrated : null;
}

export function sanitizeLibraryItems(value: unknown): LibraryItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(validateLibraryItem);
}

export function validateLibraryExport(value: unknown): value is { schemaVersion: number; exportedAt: string; items: unknown[] } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  return data.schemaVersion === LIBRARY_SCHEMA_VERSION
    && typeof data.exportedAt === "string"
    && !Number.isNaN(Date.parse(data.exportedAt))
    && Array.isArray(data.items);
}

export function normalizeTags(value: string | string[]): string[] {
  const values = Array.isArray(value) ? value : value.split(",");
  return [...new Set(values.map((tag) => tag.trim()).filter(Boolean).map((tag) => tag.slice(0, 80)))].slice(0, 20);
}

export function validateFileSize(file: Pick<File, "size">): "empty" | "too-large" | null {
  if (file.size <= 0) return "empty";
  if (file.size > LIBRARY_CONFIG.maxFileBytes) return "too-large";
  return null;
}

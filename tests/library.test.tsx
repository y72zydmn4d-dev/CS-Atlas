import "fake-indexeddb/auto";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { openDB } from "idb";
import { Blob as NodeBlob } from "node:buffer";
import { beforeEach, describe, expect, it } from "vitest";
import { LibraryList } from "@/components/library/library-list";
import { LIBRARY_CONFIG } from "@/lib/library/config";
import { isValidLibraryRelation } from "@/lib/library/entities";
import { extractDocument } from "@/lib/library/extraction";
import { detectFileFormat, fileFingerprint, safeFileName } from "@/lib/library/files";
import { IndexedDbLibraryRepository, resetLibraryDatabaseForTests } from "@/lib/library/repository";
import { searchLibraryItems } from "@/lib/library/search";
import { LIBRARY_SCHEMA_VERSION, type LibraryItem } from "@/lib/library/types";
import { canonicalizeUrl, sanitizeLibraryItems, validateFileSize, validateLibraryExport, validateLibraryItem } from "@/lib/library/validation";
import { renderWithLocale } from "@/tests/test-utils";

async function clearDatabase() {
  await resetLibraryDatabaseForTests();
  await new Promise<void>((resolve, reject) => { const request = indexedDB.deleteDatabase(LIBRARY_CONFIG.databaseName); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); request.onblocked = () => reject(new Error("blocked")); });
}

const linkInput = { type: "link" as const, title: "Attention Is All You Need", url: "https://example.com/paper?version=1#section", canonicalUrl: "https://example.com/paper?version=1", sourceName: "Example", tags: ["transformers"], language: "en" as const, status: "ready" as const, extractionStatus: "not-needed" as const, relatedEntities: [{ entityType: "topic" as const, entityId: "transformers", relation: "reference" as const }] };

describe("library validation and detection", () => {
  it("accepts only safe canonical URLs and preserves meaningful queries", () => {
    expect(canonicalizeUrl("HTTPS://Example.COM/path/?q=rag#top")).toBe("https://example.com/path?q=rag");
    expect(canonicalizeUrl("javascript:alert(1)")).toBeNull();
    expect(canonicalizeUrl("file:///private/note.txt")).toBeNull();
  });

  it("detects signatures instead of trusting extensions alone", async () => {
    expect(await detectFileFormat(new File(["%PDF-1.7\n"], "notes.txt", { type: "text/plain" }))).toBe("pdf");
    expect(await detectFileFormat(new File(["not a pdf"], "fake.pdf", { type: "application/pdf" }))).toBe("other");
    expect(await detectFileFormat(new File(["# Heading"], "guide.md", { type: "text/markdown" }))).toBe("markdown");
  });

  it("enforces configured size limits and stable fingerprints", () => {
    expect(validateFileSize({ size: 0 })).toBe("empty");
    expect(validateFileSize({ size: LIBRARY_CONFIG.maxFileBytes + 1 })).toBe("too-large");
    expect(fileFingerprint(new File(["hello"], "Ghi chú.txt", { lastModified: 42 }))).toContain("Ghi chú.txt::5::42");
    expect(safeFileName("../../ghi\u0000chu.txt")).toBe("ghichu.txt");
  });

  it("validates versioned records and drops corrupted backups", () => {
    const valid: LibraryItem = { ...linkInput, schemaVersion: LIBRARY_SCHEMA_VERSION, id: "one", importedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    expect(validateLibraryItem(valid)).toBe(true);
    expect(sanitizeLibraryItems([valid, { id: "broken" }])).toEqual([valid]);
  });

  it("validates relationships against the atlas registry", () => {
    expect(isValidLibraryRelation({ entityType: "topic", entityId: "gradient-descent", relation: "supplementary" })).toBe(true);
    expect(isValidLibraryRelation({ entityType: "topic", entityId: "removed-topic", relation: "supplementary" })).toBe(false);
  });
});

describe("IndexedDB library repository", () => {
  beforeEach(clearDatabase);

  it("creates, reads, updates, searches, and removes metadata plus blobs", async () => {
    const repository = new IndexedDbLibraryRepository(); const file = new NodeBlob(["local notes"], { type: "text/plain" }) as unknown as Blob;
    const created = await repository.create({ type: "file", title: "Ghi chú Gradient Descent", fileFormat: "text", fileName: "notes.txt", mimeType: "text/plain", fileSize: file.size, fileLastModified: 1, fileFingerprint: "notes.txt::11::1", tags: ["toi-uu"], language: "vi", status: "ready", extractionStatus: "complete", extractedText: "dao ham va huong ha doc", relatedEntities: [{ entityType: "topic", entityId: "gradient-descent", relation: "supplementary" }], file });
    expect((await repository.getFile(created.id))?.size).toBe(file.size);
    expect((await repository.search("ha doc"))[0]?.item.id).toBe(created.id);
    expect((await repository.update(created.id, { notes: "Ôn lại đạo hàm" })).notes).toContain("đạo hàm");
    await repository.remove(created.id);
    expect(await repository.get(created.id)).toBeNull(); expect(await repository.getFile(created.id)).toBeNull();
  });

  it("detects canonical URL and file duplicates without overwriting", async () => {
    const repository = new IndexedDbLibraryRepository(); const created = await repository.create(linkInput);
    expect((await repository.findDuplicate({ canonicalUrl: linkInput.canonicalUrl }))?.id).toBe(created.id);
    await expect(repository.create(linkInput)).resolves.not.toHaveProperty("id", created.id);
    expect((await repository.list()).length).toBe(2);
  });

  it("queries canonical concepts through legacy relations and legacy pages through canonical relations", async () => {
    const repository = new IndexedDbLibraryRepository();
    const legacy = await repository.create(linkInput);
    const canonical = await repository.create({ ...linkInput, title: "Canonical arrays", canonicalUrl: "https://example.com/canonical-arrays", url: "https://example.com/canonical-arrays", relatedEntities: [{ entityType: "concept", entityId: "topic:arrays", relation: "reference" }] });
    await repository.update(legacy.id, { relatedEntities: [{ entityType: "topic", entityId: "arrays", relation: "reference" }] });
    expect((await repository.list({ entityType: "concept", entityId: "topic:arrays" })).map((item) => item.id).sort()).toEqual([canonical.id, legacy.id].sort());
    expect((await repository.list({ entityType: "topic", entityId: "arrays" })).map((item) => item.id).sort()).toEqual([canonical.id, legacy.id].sort());
  });

  it("recovers by removing corrupted metadata records", async () => {
    const repository = new IndexedDbLibraryRepository(); await repository.create(linkInput); await resetLibraryDatabaseForTests();
    const database = await openDB(LIBRARY_CONFIG.databaseName, LIBRARY_CONFIG.databaseVersion); await database.put("items", { id: "broken", title: 42 }); database.close();
    expect((await repository.list()).length).toBe(1);
  });

  it("upgrades stored version-one links without losing relations or originals", async () => {
    const repository = new IndexedDbLibraryRepository();
    const created = await repository.create(linkInput);
    await resetLibraryDatabaseForTests();
    const database = await openDB(LIBRARY_CONFIG.databaseName, LIBRARY_CONFIG.databaseVersion);
    await database.put("items", { ...created, schemaVersion: 1, linkPreview: undefined });
    database.close();
    const migrated = await repository.get(created.id);
    expect(migrated?.schemaVersion).toBe(LIBRARY_SCHEMA_VERSION);
    expect(migrated?.linkPreview?.status).toBe("idle");
    expect(migrated?.relatedEntities).toEqual(created.relatedEntities);
    await resetLibraryDatabaseForTests();
    const after = await openDB(LIBRARY_CONFIG.databaseName, LIBRARY_CONFIG.databaseVersion);
    expect((await after.get("items", created.id)).schemaVersion).toBe(LIBRARY_SCHEMA_VERSION);
    after.close();
  });

  it("exports portable metadata and restores files as explicit reimport records", async () => {
    const source = new IndexedDbLibraryRepository();
    const file = new NodeBlob(["private local source"], { type: "text/plain" }) as unknown as Blob;
    const created = await source.create({ type: "file", title: "Private source", fileFormat: "text", fileName: "source.txt", mimeType: "text/plain", fileSize: file.size, fileLastModified: 1, fileFingerprint: "source.txt::20::1", tags: [], collection: "ML", language: "en", status: "ready", extractionStatus: "complete", extractedText: "private local source", relatedEntities: [{ entityType: "concept", entityId: "topic:gradient-descent", relation: "reference" }], file });
    const exported = await source.exportMetadata();
    expect(validateLibraryExport(exported)).toBe(true);
    expect(JSON.stringify(exported)).not.toContain("private local source");
    await clearDatabase();
    const destination = new IndexedDbLibraryRepository();
    await expect(destination.importMetadata(exported)).resolves.toMatchObject({ created: 1, filesNeedingReimport: 1 });
    expect(await destination.getFile(created.id)).toBeNull();
    expect(await destination.get(created.id)).toMatchObject({ collection: "ML", status: "failed", errorCode: "storage", relatedEntities: [{ entityType: "concept", entityId: "topic:gradient-descent" }] });
  });
});

describe("extraction and search", () => {
  it("extracts text and markdown safely and rejects unsupported formats", async () => {
    const text = await extractDocument(new File(["alpha\nβeta"], "notes.txt", { type: "text/plain" }));
    expect(text.status).toBe("complete"); expect(text.text).toContain("βeta");
    const unsupported = await extractDocument(new File(["data"], "archive.bin", { type: "application/octet-stream" }));
    expect(unsupported.status).toBe("unsupported");
  });

  it("turns damaged PDF and DOCX parser failures into recoverable results", async () => {
    const pdf = await extractDocument(new File(["%PDF-not-a-document"], "broken.pdf", { type: "application/pdf" }));
    const docx = await extractDocument(new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00])], "broken.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }));
    expect(pdf.status).toBe("failed");
    expect(docx.status).toBe("failed");
  });

  it("ranks titles and tags above extracted body and finds Vietnamese without accents", () => {
    const base = { ...linkInput, schemaVersion: LIBRARY_SCHEMA_VERSION, importedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const items: LibraryItem[] = [{ ...base, id: "body", title: "Optimization notes", tags: [], extractedText: "hạ dốc" }, { ...base, id: "title", title: "Ghi chú Hạ Dốc", tags: [], extractedText: "" }, { ...base, id: "tag", title: "Lecture", tags: ["ha doc"], extractedText: "" }];
    expect(searchLibraryItems("ha doc", items).map((result) => result.item.id)).toEqual(["title", "tag", "body"]);
  });
});

describe("library UI", () => {
  beforeEach(clearDatabase);
  it("renders a useful empty state and persisted items", async () => {
    const repository = new IndexedDbLibraryRepository(); const view = renderWithLocale(<LibraryList />);
    expect(await screen.findByText("Your library is ready")).toBeInTheDocument();
    await repository.create(linkInput); window.dispatchEvent(new CustomEvent("cs-atlas:library-changed"));
    expect(await screen.findByText("Attention Is All You Need")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));
    expect(view.container.querySelector(".library-grid")).toHaveAttribute("data-view", "grid");
    expect(screen.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.change(screen.getByPlaceholderText(/Search titles/), { target: { value: "transformers" } });
    await waitFor(() => expect(screen.getByText("Attention Is All You Need")).toBeVisible());
    view.unmount();
    const reopened = renderWithLocale(<LibraryList />);
    await screen.findByText("Attention Is All You Need");
    expect(reopened.container.querySelector(".library-grid")).toHaveAttribute("data-view", "grid");
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(reopened.container.querySelector(".library-grid")).toHaveAttribute("data-view", "list");
    reopened.unmount();
  });
});

import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DocumentReader } from "@/components/library/document-reader";
import { LinkPreviewCard } from "@/components/library/link-preview-card";
import { assertSafePreviewUrl, getProviderPreview, isPublicIpv4, mergePreview, parseHtmlPreview } from "@/lib/library/link-preview";
import { LIBRARY_SCHEMA_VERSION, type LibraryItem } from "@/lib/library/types";
import { libraryItemsToSearchResults, searchLibraryItems } from "@/lib/library/search";
import { migrateLibraryItem } from "@/lib/library/validation";
import { renderWithLocale } from "@/tests/test-utils";

const base: LibraryItem = {
  schemaVersion: LIBRARY_SCHEMA_VERSION, id: "preview-test", type: "link", title: "A useful resource",
  url: "https://example.com/guide", importedAt: "2026-09-28T00:00:00.000Z", updatedAt: "2026-09-28T00:00:00.000Z",
  tags: [], relatedEntities: [], status: "ready", extractionStatus: "not-needed",
};

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("link preview metadata", () => {
  it("rejects private, local, special-use and unsafe redirect destinations", () => {
    for (const value of ["http://127.0.0.1", "http://10.1.1.1", "http://169.254.169.254", "http://192.168.0.1", "http://localhost", "http://printer.local", "http://[::1]", "file:///etc/passwd", "http://example.com:8080"]) {
      expect(() => assertSafePreviewUrl(value)).toThrow();
    }
    expect(isPublicIpv4("8.8.8.8")).toBe(true);
    expect(assertSafePreviewUrl("https://example.com/article").hostname).toBe("example.com");
  });

  it("parses OG, Twitter, HTML and relative assets with correct precedence", () => {
    const og = parseHtmlPreview('<head><meta content="OG &amp; title" property="og:title"><meta name="twitter:title" content="Twitter title"><meta property="og:image" content="/cover.png"><link rel="icon" href="/icon.ico"><title>HTML title</title></head>', "https://example.com/post");
    expect(og.title).toBe("OG & title");
    expect(og.imageUrl).toBe("https://example.com/cover.png");
    expect(og.faviconUrl).toBe("https://example.com/icon.ico");
    expect(parseHtmlPreview('<head><meta name="twitter:title" content="Twitter title"><meta name="description" content="Summary"></head>', "https://example.com").title).toBe("Twitter title");
    expect(parseHtmlPreview("<head><title>Only HTML</title></head>", "https://example.com").title).toBe("Only HTML");
    expect(parseHtmlPreview('<head><meta property="og:image" content="http://127.0.0.1/private.png"></head>', "https://example.com").imageUrl).toBeUndefined();
  });

  it("recognizes video, playlist and repository without inventing a playlist thumbnail", () => {
    expect(getProviderPreview("https://youtu.be/dQw4w9WgXcQ").imageUrl).toBe("https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
    expect(getProviderPreview("https://www.youtube.com/playlist?list=PLabcdef123").imageUrl).toBeUndefined();
    expect(getProviderPreview("https://github.com/openai/codex").providerLabel).toBe("openai/codex");
  });

  it("keeps manually entered metadata ahead of fetched metadata", () => {
    const merged = mergePreview({ status: "manual", title: "My title", imageUrl: "https://example.com/manual.png" }, { title: "Remote title", imageUrl: "https://example.com/remote.png", description: "Real summary" }, {});
    expect(merged.title).toBe("My title");
    expect(merged.imageUrl).toContain("manual.png");
    expect(merged.description).toBe("Real summary");
  });

  it("migrates version-one records without losing the saved URL", () => {
    const old = { ...base, schemaVersion: 1, linkPreview: undefined };
    const migrated = migrateLibraryItem(old);
    expect(migrated?.schemaVersion).toBe(2);
    expect(migrated?.url).toBe(base.url);
    expect(migrated?.linkPreview?.status).toBe("idle");
  });

  it("indexes saved preview metadata in Library and global search", () => {
    const item: LibraryItem = { ...base, linkPreview: { status: "ready", title: "Graph traversal", description: "Breadth first exploration", siteName: "Research notes" } };
    expect(searchLibraryItems("traversal", [item])[0]?.item.id).toBe(item.id);
    expect(libraryItemsToSearchResults([item])[0].keywords).toContain("Breadth first exploration");
  });
});

describe("link and document UI", () => {
  it("shows a real saved thumbnail and falls back when the image fails", () => {
    const item: LibraryItem = { ...base, linkPreview: { status: "ready", imageUrl: "https://example.com/image.jpg", siteName: "Example" } };
    renderWithLocale(<LinkPreviewCard item={item} />);
    const image = screen.getByAltText("Preview image for A useful resource");
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
    fireEvent.error(image);
    expect(screen.getByText("Preview image unavailable")).toBeInTheDocument();
  });

  it("labels an image-free link as a fallback rather than implying a real thumbnail", () => {
    renderWithLocale(<LinkPreviewCard item={base} />);
    expect(screen.queryByRole("img", { name: /preview image/i })).not.toBeInTheDocument();
    expect(screen.getByText("No image supplied by this source")).toBeInTheDocument();
  });

  it("shows PDF loading, failure fallback, and original file actions", () => {
    vi.useFakeTimers();
    const item: LibraryItem = { ...base, type: "file", fileFormat: "pdf", fileName: "guide.pdf", fileSize: 1_024 };
    renderWithLocale(<DocumentReader item={item} blobUrl="blob:http://localhost/guide" />);
    const frame = screen.getByTitle(item.title);
    expect(frame).toHaveAttribute("src", "blob:http://localhost/guide");
    expect(screen.getByRole("status")).toHaveTextContent("Loading preview");
    act(() => vi.advanceTimersByTime(12_001));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open original/i })).toHaveAttribute("href", "blob:http://localhost/guide");
    expect(screen.getByRole("link", { name: /Download original/i })).toHaveAttribute("download", "guide.pdf");
  });

  it("opens Focus mode, closes it with Escape, and restores keyboard focus", async () => {
    const originalShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
    const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");
    const showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute("open", ""); });
    const close = vi.fn(function (this: HTMLDialogElement) { this.removeAttribute("open"); });
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: showModal });
    Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: close });
    const item: LibraryItem = { ...base, type: "file", fileFormat: "text", fileName: "notes.txt", fileSize: 10, extractedText: "A readable long note." };
    renderWithLocale(<DocumentReader item={item} blobUrl={null} />);
    const trigger = screen.getByRole("button", { name: "Focus mode" });
    trigger.focus(); fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Focus mode" });
    await waitFor(() => expect(showModal).toHaveBeenCalled());
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(close).toHaveBeenCalled());
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
    if (originalShow) Object.defineProperty(HTMLDialogElement.prototype, "showModal", originalShow); else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
    if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, "close", originalClose); else Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  });
});

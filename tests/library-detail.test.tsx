import "fake-indexeddb/auto";
import { Blob as NodeBlob } from "node:buffer";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LibraryDetail } from "@/components/library/library-detail";
import { AtlasProvider } from "@/components/atlas-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { LIBRARY_CONFIG } from "@/lib/library/config";
import { libraryRepository, resetLibraryDatabaseForTests } from "@/lib/library/repository";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

async function clearDatabase() {
  await resetLibraryDatabaseForTests();
  await new Promise<void>((resolve, reject) => { const request = indexedDB.deleteDatabase(LIBRARY_CONFIG.databaseName); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); request.onblocked = () => reject(new Error("blocked")); });
}

describe("library document viewer lifecycle", () => {
  beforeEach(clearDatabase);

  it("creates one object URL and revokes it when the viewer unmounts", async () => {
    const createObjectURL = vi.fn(() => "blob:test-document"); const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    const file = new NodeBlob(["persistent local content"], { type: "text/plain" }) as unknown as Blob;
    const item = await libraryRepository.create({ type: "file", title: "Local file", fileFormat: "text", fileName: "local.txt", mimeType: "text/plain", fileSize: file.size, fileLastModified: 1, fileFingerprint: "local.txt::24::1", tags: [], language: "en", status: "ready", extractionStatus: "complete", extractedText: "persistent local content", relatedEntities: [], file });
    const view = render(<LocaleProvider><AtlasProvider><LibraryDetail id={item.id} /></AtlasProvider></LocaleProvider>);
    expect(await screen.findByRole("heading", { name: "Local file" })).toBeInTheDocument();
    await waitFor(() => expect(createObjectURL).toHaveBeenCalledOnce());
    expect(screen.getByRole("heading", { name: "Local file" }).closest(".library-reading-page")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Hide details" }));
    expect(screen.getByRole("button", { name: "Show details" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("heading", { name: "Related knowledge" })).not.toBeInTheDocument();
    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-document");
  });
});

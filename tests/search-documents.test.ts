import { describe, expect, it } from "vitest";
import { searchIndex } from "@/content";
import { searchContent } from "@/lib/search";
import { projectLocalPrivateSearchDocuments, projectPublicSearchDocuments, searchDocuments, validateSearchDocuments } from "@/lib/search/documents";
import type { SearchResult } from "@/lib/types";

const privateResult: SearchResult = { id: "private-note", canonicalId: "library:private-note", title: "Private gradient notes", type: "Library", hierarchy: "Local file", href: "/library/private-note", keywords: "gradient descent personal" };

describe("versioned search documents", () => {
  it("preserves fallback ranking parity for public content in both locales", () => {
    const documents = projectPublicSearchDocuments(searchIndex);
    expect(validateSearchDocuments(documents)).toEqual([]);
    for (const query of ["binary search", "do phuc tap", "machine learning roadmap"]) {
      expect(searchDocuments({ query, locale: "vi", limit: 100, includeLocalPrivate: false }, documents).map((item) => item.id)).toEqual(searchContent(query, searchIndex).map((item) => item.id));
    }
  });

  it("filters owner-private Library documents before ranking", () => {
    const documents = [...projectPublicSearchDocuments(searchIndex), ...projectLocalPrivateSearchDocuments([privateResult])];
    expect(searchDocuments({ query: "private gradient notes", locale: "en", limit: 20, includeLocalPrivate: false }, documents).some((item) => item.id === privateResult.id)).toBe(false);
    expect(searchDocuments({ query: "private gradient notes", locale: "en", limit: 20, includeLocalPrivate: true }, documents).some((item) => item.id === privateResult.id)).toBe(true);
  });

  it("rejects stale versions, duplicate projections, unsafe links, and invalid ownership", () => {
    const valid = projectPublicSearchDocuments([searchIndex[0]])[0];
    if (!valid) throw new Error("missing fixture");
    expect(validateSearchDocuments([valid, valid, { ...valid, id: "stale", sourceVersion: "" }, { ...valid, id: "unsafe", href: "javascript:alert(1)" }, { ...valid, id: "owner", visibility: "owner-private" }])).toHaveLength(4);
  });
});

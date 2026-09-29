"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { searchIndex } from "@/content";
import { useI18n } from "@/components/locale-provider";
import { useLibraryItems } from "@/hooks/use-library";
import { libraryItemsToSearchResults } from "@/lib/library/search";
import { projectLocalPrivateSearchDocuments, projectPublicSearchDocuments, searchDocuments } from "@/lib/search/documents";
import type { SearchResultType } from "@/lib/types";

export function SearchPageView() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | SearchResultType>("all");
  const { locale, t } = useI18n();
  const { items: libraryItems, loading, error } = useLibraryItems();
  const index = useMemo(() => [...projectPublicSearchDocuments(searchIndex), ...projectLocalPrivateSearchDocuments(libraryItemsToSearchResults(libraryItems))], [libraryItems]);
  const types = useMemo(() => Array.from(new Set(index.map((item) => item.type))).sort(), [index]);
  const results = useMemo(() => searchDocuments({ query, locale, type: type === "all" ? undefined : type, limit: 50, includeLocalPrivate: true }, index), [index, locale, query, type]);
  return <div className="search-page-view">
    <section className="search-page-controls"><label className="catalog-search"><Search size={19} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search.pagePlaceholder")} aria-label={t("actions.searchAtlas")} /><kbd>⌘ K</kbd></label><label className="form-field"><span>{t("search.allTypes")}</span><select value={type} onChange={(event) => setType(event.target.value as "all" | SearchResultType)}><option value="all">{t("search.allTypes")}</option>{types.map((item) => <option value={item} key={item}>{item}</option>)}</select></label></section>
    <p className="search-result-count" aria-live="polite">{t("search.results", { count: results.length })}</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="panel flush search-page-results">{results.slice(0, 50).map((result) => { const title = locale === "vi" ? result.titleVi ?? result.title : result.title; const hierarchy = locale === "vi" ? result.hierarchyVi ?? result.hierarchy : result.hierarchy; return <Link className="search-result" href={result.href} key={`${result.type}-${result.id}`}><span className="result-icon">{title.charAt(0)}</span><span><strong>{title}</strong><small>{result.type} · {hierarchy}{result.type === "Library" && <><LockKeyhole size={11} />{t("search.private")}</>}</small></span><ArrowRight size={16} /></Link>; })}{loading && <p className="search-loading" role="status">{t("library.loading")}</p>}{!loading && !results.length && <div className="empty-state"><Search /><strong>{t("search.noResults")}</strong><span>{t("search.tryBroader")}</span></div>}</div>
  </div>;
}

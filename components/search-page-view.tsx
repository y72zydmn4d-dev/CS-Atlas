"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { searchIndex } from "@/content";
import { searchContent } from "@/lib/search";
import { useI18n } from "@/components/locale-provider";
import { useLibraryItems } from "@/hooks/use-library";
import { libraryItemsToSearchResults } from "@/lib/library/search";
export function SearchPageView(){const [query,setQuery]=useState("");const {locale,t}=useI18n();const {items:libraryItems}=useLibraryItems();const results=useMemo(()=>searchContent(query,[...searchIndex,...libraryItemsToSearchResults(libraryItems)]),[libraryItems,query]);return <><label className="catalog-search" style={{marginBottom:18,padding:14}}><Search size={19}/><input autoFocus value={query} onChange={(event)=>setQuery(event.target.value)} placeholder={t("search.pagePlaceholder")} aria-label={t("actions.searchAtlas")}/><kbd>⌘ K</kbd></label><div className="panel flush">{results.slice(0,30).map((result)=>{const title=locale==="vi"?result.titleVi??result.title:result.title;const hierarchy=locale==="vi"?result.hierarchyVi??result.hierarchy:result.hierarchy;return <Link className="search-result" href={result.href} key={`${result.type}-${result.id}`}><span className="result-icon">{title.charAt(0)}</span><span><strong>{title}</strong><small>{result.type} · {hierarchy}</small></span><ArrowRight size={16}/></Link>})}{!results.length&&<div className="empty-state"><Search/><strong>{t("search.noResults")}</strong><span>{t("search.tryBroader")}</span></div>}</div></>}

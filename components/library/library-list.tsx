"use client";

import Link from "next/link";
import { BookOpen, Database, Download, ExternalLink, File, FileText, Link2, Plus, Search, ShieldCheck, LayoutGrid, List } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { LinkPreviewCard } from "@/components/library/link-preview-card";
import { useLibraryItems } from "@/hooks/use-library";
import { canonicalLibraryEntityReference, matchesLibraryEntity, parseLibraryEntityReference } from "@/lib/library/concept-relations";
import { libraryRelationAuthoringOptions, resolveLibraryRelation } from "@/lib/library/entities";
import { formatBytes } from "@/lib/library/files";
import { libraryRepository } from "@/lib/library/repository";
import { searchLibraryItems } from "@/lib/library/search";
import type { ExtractionStatus, LibraryFileFormat, LibraryItemType } from "@/lib/library/types";

import { storage } from "@/lib/storage";

const extractionKey: Record<ExtractionStatus, "library.extractionComplete" | "library.extractionPartial" | "library.extractionPending" | "library.extractionFailed" | "library.extractionUnsupported"> = { complete: "library.extractionComplete", partial: "library.extractionPartial", pending: "library.extractionPending", failed: "library.extractionFailed", unsupported: "library.extractionUnsupported", "not-needed": "library.extractionComplete" };

function LibraryIcon({ type, format }: { type: LibraryItemType; format?: LibraryFileFormat }) {
  if (type === "link") return <Link2 />;
  if (format === "pdf" || format === "docx") return <FileText />;
  return <File />;
}

export function LibraryList({ initialEntity = "all" }: { initialEntity?: string }) {
  const { locale, t } = useI18n();
  const { items, loading, error } = useLibraryItems();
  const [view, setView] = useState<"list" | "grid">("list");
  useEffect(() => {
    // Preference is reconciled after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView(storage.loadLibraryView());
  }, []);
  const changeView = (next: "list" | "grid") => { setView(next); storage.saveLibraryView(next); };
  const [query, setQuery] = useState(""); const deferredQuery = useDeferredValue(query);
  const initialEntityReference = initialEntity === "all" ? null : parseLibraryEntityReference(initialEntity);
  const canonicalInitialEntity = initialEntityReference ? canonicalLibraryEntityReference(initialEntityReference) : null;
  const [type, setType] = useState<LibraryItemType | "all">("all"); const [format, setFormat] = useState<LibraryFileFormat | "all">("all"); const [entity, setEntity] = useState(canonicalInitialEntity ? `${canonicalInitialEntity.entityType}:${canonicalInitialEntity.entityId}` : "all"); const [tag, setTag] = useState("all"); const [collection, setCollection] = useState("all"); const [sort, setSort] = useState<"newest" | "name" | "size">("newest");
  const [importMessage, setImportMessage] = useState<string | null>(null); const importRef = useRef<HTMLInputElement>(null);
  const [usage, setUsage] = useState<{ usage?: number; quota?: number }>({});
  useEffect(() => { if (navigator.storage?.estimate) void navigator.storage.estimate().then(setUsage).catch(() => undefined); }, [items.length]);
  const tags = useMemo(() => [...new Set(items.flatMap((item) => item.tags))].sort(), [items]);
  const collections = useMemo(() => [...new Set(items.map((item) => item.collection).filter((value): value is string => Boolean(value)))].sort(), [items]);
  const availableEntityOptions = useMemo(() => libraryRelationAuthoringOptions.filter((option) => items.some((item) => item.relatedEntities.some((relation) => matchesLibraryEntity(relation, { entityType: option.type, entityId: option.id })))), [items]);
  const filtered = useMemo(() => {
    let values = deferredQuery.trim() ? searchLibraryItems(deferredQuery, items, items.length).map((result) => result.item) : [...items];
    const entityReference = entity === "all" ? null : parseLibraryEntityReference(entity);
    values = values.filter((item) => (type === "all" || item.type === type) && (format === "all" || item.fileFormat === format) && (tag === "all" || item.tags.includes(tag)) && (collection === "all" || item.collection === collection) && (entity === "all" || (entityReference !== null && item.relatedEntities.some((relation) => matchesLibraryEntity(relation, entityReference)))));
    return values.sort((a, b) => sort === "name" ? a.title.localeCompare(b.title) : sort === "size" ? (b.fileSize ?? 0) - (a.fileSize ?? 0) : Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }, [collection, deferredQuery, entity, format, items, sort, tag, type]);
  const exportMetadata = async () => {
    const data = await libraryRepository.exportMetadata(); const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `cs-atlas-library-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
  };
  const importMetadata = async (file: File | undefined) => {
    if (!file || file.size > 2_000_000) { setImportMessage(t("library.importMetadataFailed")); return; }
    try { const result = await libraryRepository.importMetadata(JSON.parse(await file.text()) as unknown); setImportMessage(t("library.importMetadataSuccess", { count: result.created, files: result.filesNeedingReimport })); }
    catch { setImportMessage(t("library.importMetadataFailed")); }
    if (importRef.current) importRef.current.value = "";
  };
  if (loading) return <div className="library-loading" aria-live="polite"><Database />{t("library.loading")}</div>;
  if (error) return <div className="empty-state" role="alert"><Database /><strong>{t("library.loadError")}</strong><span>{error}</span></div>;
  const storageText = usage.usage !== undefined && usage.quota !== undefined ? t("library.storageUsed", { used: formatBytes(usage.usage), quota: formatBytes(usage.quota) }) : t("library.storageUnknown");
  return <div className="stack">
    <section className="library-summary"><div><Database size={20} /><span><strong>{t("library.storage")}</strong><small>{storageText}</small></span></div><div><ShieldCheck size={18} /><span><strong>{t("library.itemCount", { count: items.length })}</strong><small>{t("library.privacy")}</small></span></div><div className="library-transfer"><button type="button" className="button-secondary" onClick={() => void exportMetadata()} title={t("library.exportHelp")}><Download size={15} />{t("library.exportMetadata")}</button><button type="button" className="button-secondary" onClick={() => importRef.current?.click()} title={t("library.importMetadataHelp")}><Download className="library-import-icon" size={15} />{t("library.importMetadata")}</button><input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(event) => void importMetadata(event.target.files?.[0])} /></div></section>{importMessage && <p className="form-notice" role="status">{importMessage}</p>}
    <section className="library-toolbar" aria-label={t("library.title")}><label className="catalog-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("library.searchPlaceholder")} aria-label={t("library.searchPlaceholder")} /></label><details className="library-filters"><summary>{t("library.typeFilter")} · {t("library.formatFilter")}</summary><div className="library-filter-grid"><label className="form-field"><span>{t("library.typeFilter")}</span><select value={type} onChange={(event) => setType(event.target.value as LibraryItemType | "all")}><option value="all">{t("library.allTypes")}</option><option value="file">{t("library.file")}</option><option value="link">{t("library.link")}</option></select></label><label className="form-field"><span>{t("library.formatFilter")}</span><select value={format} onChange={(event) => setFormat(event.target.value as LibraryFileFormat | "all")}><option value="all">{t("library.allFormats")}</option>{["pdf", "docx", "markdown", "text", "other"].map((item) => <option value={item} key={item}>{item.toUpperCase()}</option>)}</select></label><label className="form-field"><span>{t("library.collection")}</span><select value={collection} onChange={(event) => setCollection(event.target.value)}><option value="all">{t("library.allCollections")}</option>{collections.map((item) => <option value={item} key={item}>{item}</option>)}</select></label><label className="form-field"><span>{t("library.relationFilter")}</span><select value={entity} onChange={(event) => setEntity(event.target.value)}><option value="all">{t("library.allRelations")}</option>{availableEntityOptions.map((item) => <option value={`${item.type}:${item.id}`} key={`${item.type}:${item.id}`}>{locale === "vi" ? item.labelVi ?? item.label : item.label}</option>)}</select></label><label className="form-field"><span>{t("library.tagFilter")}</span><select value={tag} onChange={(event) => setTag(event.target.value)}><option value="all">{t("library.allTags")}</option>{tags.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field"><span>{t("library.sortLabel")}</span><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="newest">{t("library.sortNewest")}</option><option value="name">{t("library.sortName")}</option><option value="size">{t("library.sortSize")}</option></select></label></div></details></section>
    <div className="library-view-bar"><span>{t("library.itemCount", { count: filtered.length })}</span><div className="view-toggle"><button className="icon-button" aria-label={t("workspace.list")} aria-pressed={view === "list"} onClick={() => changeView("list")}><List size={17} /></button><button className="icon-button" aria-label={t("workspace.grid")} aria-pressed={view === "grid"} onClick={() => changeView("grid")}><LayoutGrid size={17} /></button></div></div>
    {items.length === 0 ? <div className="empty-state library-empty"><BookOpen /><strong>{t("library.emptyTitle")}</strong><span>{t("library.emptyBody")}</span><div><Link className="button-primary" href="/library/import"><Plus size={15} />{t("library.addDocument")}</Link><Link className="button-secondary" href="/library/import?type=link"><Link2 size={15} />{t("library.addLink")}</Link></div></div> : filtered.length === 0 ? <div className="empty-state"><Search /><strong>{t("library.noResults")}</strong></div> : <div className="library-grid" data-view={view}>{filtered.map((item) => { const relation = item.relatedEntities.map((entry) => resolveLibraryRelation(entry, locale)).find(Boolean); return <article className={`library-card${item.type === "link" ? " has-link-preview" : ""}`} key={item.id}>{item.type === "link" && <LinkPreviewCard item={item} compact />}<div className="library-card-icon"><LibraryIcon type={item.type} format={item.fileFormat} /></div><div className="library-card-main"><div className="library-card-title"><Link href={`/library/${item.id}`} aria-label={t("library.openItem", { title: item.title })}>{item.title}</Link><span className={`library-status status-${item.extractionStatus}`}>{item.type === "link" ? t("library.link") : t(extractionKey[item.extractionStatus])}</span></div><p>{item.excerpt || item.description || item.linkPreview?.description || item.notes || (item.type === "link" ? t("library.previewPartial") : t("library.noPreview"))}</p><div className="library-card-meta"><span>{item.type === "file" ? `${item.fileFormat?.toUpperCase()} · ${formatBytes(item.fileSize)}` : item.sourceName || item.linkPreview?.siteName || new URL(item.url ?? "https://invalid.local").hostname}</span>{item.collection && <span>{item.collection}</span>}{relation && <span>{relation.displayLabel}</span>}<span>{new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium" }).format(new Date(item.importedAt))}</span></div>{item.tags.length > 0 && <div className="tag-list">{item.tags.slice(0, 5).map((itemTag) => <span className="chip" key={itemTag}>#{itemTag}</span>)}</div>}</div><div className="library-card-actions"><Link className="icon-button" href={`/library/${item.id}`} aria-label={t("library.openItem", { title: item.title })}><ExternalLink size={16} /></Link></div></article>; })}</div>}
  </div>;
}

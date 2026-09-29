"use client";

import Link from "next/link";
import { ArrowLeft, Check, Clipboard, ExternalLink, FileWarning, Pencil, RefreshCw, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookmarkButton, StatusSelect } from "@/components/content-actions";
import { DocumentReader } from "@/components/library/document-reader";
import { EntityPicker } from "@/components/library/entity-picker";
import { LinkPreviewCard } from "@/components/library/link-preview-card";
import { useI18n } from "@/components/locale-provider";
import { resolveLibraryRelation } from "@/lib/library/entities";
import { formatBytes } from "@/lib/library/files";
import { assertSafePreviewUrl, getProviderPreview, linkPreviewService, mergePreview } from "@/lib/library/link-preview";
import { libraryRepository } from "@/lib/library/repository";
import type { LibraryItem, LibraryLanguage, LibraryRelation } from "@/lib/library/types";
import { normalizeTags } from "@/lib/library/validation";

const languageKey = { unknown: "library.langUnknown", en: "library.langEn", vi: "library.langVi", mixed: "library.langMixed" } as const;
const errorKey = { "corrupt-file": "library.errorCorrupt", "encrypted-pdf": "library.errorEncrypted", "extraction-timeout": "library.errorTimeout", quota: "library.importFailed", storage: "library.loadError", unsupported: "library.unsupported", unknown: "library.errorUnknown" } as const;

export function LibraryDetail({ id }: { id: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [item, setItem] = useState<LibraryItem | null | undefined>(undefined);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [deleteError, setDeleteError] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState("");
  const [authors, setAuthors] = useState("");
  const [previewImage, setPreviewImageState] = useState("");
  const [previewImageRemoved, setPreviewImageRemoved] = useState(false);
  const setPreviewImage = (value: string) => { setPreviewImageState(value); setPreviewImageRemoved(!value); };
  const [language, setLanguage] = useState<LibraryLanguage>("unknown");
  const [relations, setRelations] = useState<LibraryRelation[]>([]);

  useEffect(() => {
    let active = true;
    let currentUrl: string | null = null;
    void libraryRepository.get(id).then(async (value) => {
      if (!active) return;
      if (value) {
        setTitle(value.title); setDescription(value.description ?? ""); setTags(value.tags.join(", "));
        setNotes(value.notes ?? ""); setSource(value.sourceName ?? ""); setAuthors(value.authors?.join(", ") ?? "");
        setPreviewImageState(value.linkPreview?.manualImageUrl ?? ""); setPreviewImageRemoved(value.linkPreview?.suppressImage ?? false); setLanguage(value.language ?? "unknown"); setRelations(value.relatedEntities);
      }
      setItem(value);
      if (value?.type === "file") {
        const file = await libraryRepository.getFile(id);
        if (file && active) { currentUrl = URL.createObjectURL(file); setBlobUrl(currentUrl); }
      }
    }).catch(() => { if (active) setItem(null); });
    return () => { active = false; if (currentUrl) URL.revokeObjectURL(currentUrl); };
  }, [id]);

  if (item === undefined) return <div className="library-loading" aria-live="polite">{t("library.loading")}</div>;
  if (item === null) return <div className="empty-state"><FileWarning /><strong>{t("library.notFound")}</strong><Link className="button-secondary" href="/library">{t("library.back")}</Link></div>;

  const save = async () => {
    const imageUrl = previewImage.trim();
    if (imageUrl) { try { assertSafePreviewUrl(imageUrl); } catch { setPreviewError(true); return; } }
    try {
      const linkPreview = item.type === "link" ? mergePreview({ status: "manual", title: title.trim(), description: description.trim() || undefined, siteName: source.trim() || undefined, imageUrl: imageUrl || undefined, suppressImage: previewImageRemoved }, item.linkPreview ?? {}, getProviderPreview(item.url ?? "")) : undefined;
      const updated = await libraryRepository.update(item.id, { title: title.trim(), description: description.trim() || undefined, tags: normalizeTags(tags), notes: notes.trim() || undefined, sourceName: source.trim() || undefined, authors: normalizeTags(authors), language, relatedEntities: relations, ...(linkPreview ? { linkPreview } : {}) });
      setItem(updated); setEditing(false); setPreviewError(false); setPreviewImageRemoved(updated.linkPreview?.suppressImage ?? false);
    } catch { setPreviewError(true); }
  };
  const refreshPreview = async () => {
    if (!item.url || previewBusy) return;
    setPreviewBusy(true); setPreviewError(false);
    try {
      const result = await linkPreviewService.fetch(item.url);
      const preview = mergePreview({ title: item.title, description: item.description, siteName: item.sourceName, imageUrl: previewImage.trim() || item.linkPreview?.manualImageUrl, suppressImage: previewImageRemoved }, result.preview, getProviderPreview(item.url));
      const updated = await libraryRepository.update(item.id, { linkPreview: preview });
      setItem(updated);
    } catch { setPreviewError(true); }
    finally { setPreviewBusy(false); }
  };
  const remove = async () => { if (!window.confirm(t("library.deleteConfirm"))) return; try { await libraryRepository.remove(item.id); router.push("/library"); } catch { setDeleteError(true); } };
  const copyUrl = async () => { try { await navigator.clipboard.writeText(item.url ?? ""); setCopyState("copied"); window.setTimeout(() => setCopyState("idle"), 1500); } catch { setCopyState("failed"); } };
  const statusLabel = item.status === "ready" ? t("library.ready") : item.status === "processing" ? t("library.processing") : item.status === "unsupported" ? t("library.unsupported") : t("library.failed");

  return <div className="page library-reading-page">
    <Link href="/library" className="text-link"><ArrowLeft size={14} />{t("library.back")}</Link>
    <header className="page-header library-detail-header"><div className="library-title-group"><p className="kicker">{item.type === "file" ? `${item.fileFormat?.toUpperCase()} · ${formatBytes(item.fileSize)}` : t("library.link")}</p><h1>{item.title}</h1><p className="lede">{item.description || item.sourceName || (item.type === "link" ? t("library.previewFetchNote") : t("library.privacy"))}</p><div className="doc-meta"><span className={`chip status-${item.status}`}>{statusLabel}</span><span className="chip">{new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { dateStyle: "long" }).format(new Date(item.importedAt))}</span><span className="chip">{t(languageKey[item.language ?? "unknown"])}</span></div></div><div className="header-actions"><StatusSelect id={`library:${item.id}`} /><BookmarkButton bookmark={{ id: item.id, type: "library", title: item.title, href: `/library/${item.id}`, context: t("library.title") }} /><button type="button" className="button-secondary" onClick={() => setEditing((value) => !value)}><Pencil size={15} />{t("library.editMetadata")}</button></div></header>
    {item.errorCode && <div className="library-alert" role="status"><FileWarning size={18} /><span>{t(errorKey[item.errorCode])}</span></div>}
    {editing && <section className="panel library-form library-edit-form"><div className="library-form-grid"><label className="form-field"><span>{t("library.titleLabel")}</span><input value={title} maxLength={300} onChange={(event) => setTitle(event.target.value)} /></label><label className="form-field"><span>{t("library.languageLabel")}</span><select value={language} onChange={(event) => setLanguage(event.target.value as LibraryLanguage)}>{Object.keys(languageKey).map((key) => <option key={key} value={key}>{t(languageKey[key as LibraryLanguage])}</option>)}</select></label><label className="form-field full"><span>{t("library.descriptionLabel")}</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label><label className="form-field"><span>{t("library.sourceLabel")}</span><input value={source} onChange={(event) => setSource(event.target.value)} /></label><label className="form-field"><span>{t("library.authorsLabel")}</span><input value={authors} onChange={(event) => setAuthors(event.target.value)} /></label>{item.type === "link" && <label className="form-field full"><span>{t("library.previewImageUrl")}</span><div className="field-with-action"><input type="url" value={previewImage} onChange={(event) => setPreviewImage(event.target.value)} placeholder="https://" /><button type="button" className="button-secondary" onClick={() => setPreviewImage("")}>{t("library.removePreviewImage")}</button></div></label>}<label className="form-field full"><span>{t("library.tagsLabel")}</span><input value={tags} onChange={(event) => setTags(event.target.value)} /></label><label className="form-field full"><span>{t("library.notesLabel")}</span><textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} /></label></div><EntityPicker value={relations} onChange={setRelations} />{previewError && <p className="form-error" role="alert">{t("library.previewSaveError")}</p>}<button type="button" className="button-primary" onClick={() => void save()}><Save size={15} />{t("library.saveChanges")}</button></section>}
    <div className={`library-detail-grid${sidebarOpen ? "" : " sidebar-collapsed"}`}><main className="library-reader-main">{item.type === "link" ? <section className="stack"><LinkPreviewCard item={item} /><div className="form-actions link-preview-actions"><a className="button-primary" href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} />{t("library.openSource")}</a><button className="button-secondary" type="button" onClick={() => void copyUrl()} aria-live="polite"><Clipboard size={15} />{copyState === "copied" ? t("actions.copied") : t("library.copyUrl")}</button><button className="button-secondary" type="button" disabled={previewBusy} onClick={() => void refreshPreview()}><RefreshCw size={15} />{previewBusy ? t("library.previewLoading") : t("library.refreshPreview")}</button></div>{previewError && <p className="form-error" role="alert">{t("library.previewFetchError")}</p>}{copyState === "failed" && <p className="form-error" role="alert">{t("library.copyFailed")}</p>}</section> : <DocumentReader item={item} blobUrl={blobUrl} />}</main>
      <aside className="library-reader-aside"><button type="button" className="button-secondary sidebar-toggle" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen((value) => !value)}>{sidebarOpen ? t("library.hideDetails") : t("library.showDetails")}</button>{sidebarOpen && <div className="library-aside-content"><section className="panel"><h3>{t("library.relationships")}</h3><div className="relation-list">{item.relatedEntities.map((relation) => { const entity = resolveLibraryRelation(relation, locale); return <div key={`${relation.entityType}:${relation.entityId}`}><Check size={14} /><span><strong>{entity?.displayLabel ?? t("library.missingReference")}</strong><small>{entity?.displayHierarchy ?? `${relation.entityType}:${relation.entityId}`}</small></span></div>; })}{item.relatedEntities.length === 0 && <p>{t("library.resourcesEmpty")}</p>}</div></section>{item.tags.length > 0 && <section className="panel"><h3>{t("library.tagsLabel")}</h3><div className="tag-list">{item.tags.map((tag) => <span className="chip" key={tag}>#{tag}</span>)}</div></section>}{item.notes && <section className="panel"><h3>{t("library.notesLabel")}</h3><p className="library-notes">{item.notes}</p></section>}<section className="panel library-file-facts"><h3>{t("library.fileMetadata")}</h3><dl><dt>{t("library.addedAt")}</dt><dd>{new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { dateStyle: "medium" }).format(new Date(item.importedAt))}</dd>{item.type === "file" && <><dt>{t("library.fileName")}</dt><dd>{item.fileName}</dd><dt>{t("library.fileSize")}</dt><dd>{formatBytes(item.fileSize)}</dd><dt>{t("library.extractionStatus")}</dt><dd>{item.extractionStatus}</dd></>}{item.type === "link" && <><dt>{t("library.urlLabel")}</dt><dd className="break-anywhere">{item.url}</dd></>}</dl></section><button type="button" className="button-danger" onClick={() => void remove()}><Trash2 size={15} />{t("library.delete")}</button>{deleteError && <p className="form-error" role="alert">{t("library.deleteFailed")}</p>}</div>}</aside>
    </div>
  </div>;
}

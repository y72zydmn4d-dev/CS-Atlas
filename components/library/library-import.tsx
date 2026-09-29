"use client";

import { FilePlus2, Link2, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { EntityPicker } from "@/components/library/entity-picker";
import { useI18n } from "@/components/locale-provider";
import { LIBRARY_CONFIG, SUPPORTED_FILE_ACCEPT } from "@/lib/library/config";
import { extractDocument } from "@/lib/library/extraction";
import { detectFileFormat, fileFingerprint, formatBytes, hashFile, safeFileName } from "@/lib/library/files";
import { assertSafePreviewUrl, getProviderPreview, linkPreviewService, mergePreview } from "@/lib/library/link-preview";
import { libraryRepository } from "@/lib/library/repository";
import type { LibraryFileFormat, LibraryItem, LibraryLanguage, LibraryRelation, LinkPreviewMetadata } from "@/lib/library/types";
import { canonicalizeUrl, normalizeTags, validateFileSize } from "@/lib/library/validation";

type DuplicateStrategy = "skip" | "copy" | "update";
interface FileDraft { key: string; file: File; title: string; tags: string; language: LibraryLanguage; relations: LibraryRelation[]; format: LibraryFileFormat; hash?: string; duplicate?: LibraryItem | null; duplicateStrategy: DuplicateStrategy; error?: "empty" | "too-large"; state: "queued" | "processing" | "done" | "failed" }

const languageOptions: LibraryLanguage[] = ["unknown", "en", "vi", "mixed"];
const languageKey = { unknown: "library.langUnknown", en: "library.langEn", vi: "library.langVi", mixed: "library.langMixed" } as const;

function titleFromFile(name: string) { return name.replace(/\.(pdf|docx|md|markdown|txt)$/i, "").replace(/[_-]+/g, " ").trim() || name; }

export function LibraryImport() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"file" | "link">(searchParams.get("type") === "link" ? "link" : "file");
  const [drafts, setDrafts] = useState<FileDraft[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = async (files: File[]) => {
    if (files.length + drafts.length > LIBRARY_CONFIG.maxFilesPerImport) { setGlobalError(t("library.tooMany", { count: LIBRARY_CONFIG.maxFilesPerImport })); return; }
    const next = await Promise.all(files.map(async (file): Promise<FileDraft> => {
      const format = await detectFileFormat(file);
      const error = validateFileSize(file) ?? undefined;
      const fingerprint = fileFingerprint(file);
      const hash = error ? undefined : await hashFile(file);
      const duplicate = error ? null : await libraryRepository.findDuplicate({ fileFingerprint: fingerprint, contentHash: hash });
      return { key: `${fingerprint}:${crypto.randomUUID()}`, file, title: titleFromFile(file.name), tags: "", language: "unknown", relations: [], format, hash, duplicate, duplicateStrategy: "skip", error, state: "queued" };
    }));
    setDrafts((current) => [...current, ...next]); setGlobalError(null);
  };
  const patchDraft = (key: string, patch: Partial<FileDraft>) => setDrafts((current) => current.map((draft) => draft.key === key ? { ...draft, ...patch } : draft));

  const importFiles = async () => {
    if (!drafts.length || drafts.some((draft) => draft.error || !draft.title.trim())) return;
    setBusy(true); setGlobalError(null);
    try {
      for (const draft of drafts) {
        if (draft.duplicate && draft.duplicateStrategy === "skip") { patchDraft(draft.key, { state: "done" }); continue; }
        patchDraft(draft.key, { state: "processing" });
        const supported = draft.format !== "other";
        const base = {
          type: "file" as const, title: draft.title.trim(), fileFormat: draft.format, fileName: safeFileName(draft.file.name), mimeType: draft.file.type || "application/octet-stream", fileSize: draft.file.size, fileLastModified: draft.file.lastModified, fileFingerprint: fileFingerprint(draft.file), contentHash: draft.hash, tags: normalizeTags(draft.tags), language: draft.language, status: supported ? "processing" as const : "unsupported" as const, extractionStatus: supported ? "pending" as const : "unsupported" as const, relatedEntities: draft.relations,
        };
        let item: LibraryItem;
        if (draft.duplicate && draft.duplicateStrategy === "update") {
          item = await libraryRepository.update(draft.duplicate.id, base);
          await libraryRepository.putFile(item.id, draft.file);
        } else item = await libraryRepository.create({ ...base, file: draft.file });
        if (supported) {
          const result = await extractDocument(draft.file);
          await libraryRepository.update(item.id, { status: result.status === "failed" ? "failed" : result.status === "unsupported" ? "unsupported" : "ready", extractionStatus: result.status, extractedText: result.text || undefined, excerpt: result.excerpt, errorCode: result.errorCode });
        }
        patchDraft(draft.key, { state: "done" });
      }
      router.push("/library");
    } catch { setGlobalError(t("library.importFailed")); setDrafts((current) => current.map((draft) => draft.state === "processing" ? { ...draft, state: "failed" } : draft)); }
    finally { setBusy(false); }
  };

  return <div className="stack">
    <div className="library-tabs" role="tablist"><button type="button" role="tab" aria-selected={tab === "file"} className={tab === "file" ? "active" : ""} onClick={() => setTab("file")}><FilePlus2 size={17} />{t("library.filesTab")}</button><button type="button" role="tab" aria-selected={tab === "link"} className={tab === "link" ? "active" : ""} onClick={() => setTab("link")}><Link2 size={17} />{t("library.linkTab")}</button></div>
    {tab === "file" ? <>
      <div className="library-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void addFiles([...event.dataTransfer.files]); }}>
        <UploadCloud size={31} /><strong>{t("library.dropTitle")}</strong><span>{t("library.dropHelp", { size: LIBRARY_CONFIG.maxFileBytes / 1024 / 1024 })}</span><button type="button" className="button-secondary" onClick={() => fileInputRef.current?.click()}>{t("library.chooseFiles")}</button><input ref={fileInputRef} className="visually-hidden" type="file" multiple accept={SUPPORTED_FILE_ACCEPT} aria-label={t("library.fileInput")} onChange={(event) => { void addFiles([...(event.target.files ?? [])]); event.target.value = ""; }} />
      </div>
      <div className="import-drafts">{drafts.map((draft) => <article className="import-draft" key={draft.key} aria-busy={draft.state === "processing"}>
        <div className="import-draft-head"><div><strong>{draft.file.name}</strong><span>{draft.format.toUpperCase()} · {formatBytes(draft.file.size)}</span></div><button type="button" className="icon-button" disabled={busy} onClick={() => setDrafts((current) => current.filter((item) => item.key !== draft.key))} aria-label={t("library.removeDraft", { title: draft.file.name })}><Trash2 size={16} /></button></div>
        {draft.error && <p className="form-error">{draft.error === "too-large" ? t("library.tooLarge", { size: LIBRARY_CONFIG.maxFileBytes / 1024 / 1024 }) : t("library.emptyFile")}</p>}
        {draft.format === "other" && <p className="form-notice">{t("library.unsupportedSaved")}</p>}
        {draft.duplicate && <fieldset className="duplicate-box"><legend>{t("library.duplicate")}</legend>{(["skip", "copy", "update"] as DuplicateStrategy[]).map((strategy) => <label key={strategy}><input type="radio" name={`duplicate-${draft.key}`} checked={draft.duplicateStrategy === strategy} onChange={() => patchDraft(draft.key, { duplicateStrategy: strategy })} />{t(strategy === "skip" ? "library.skipDuplicate" : strategy === "copy" ? "library.saveCopy" : "library.updateExisting")}</label>)}</fieldset>}
        <div className="library-form-grid"><label className="form-field"><span>{t("library.titleLabel")}</span><input value={draft.title} maxLength={300} onChange={(event) => patchDraft(draft.key, { title: event.target.value })} /></label><label className="form-field"><span>{t("library.languageLabel")}</span><select value={draft.language} onChange={(event) => patchDraft(draft.key, { language: event.target.value as LibraryLanguage })}>{languageOptions.map((language) => <option key={language} value={language}>{t(languageKey[language])}</option>)}</select></label><label className="form-field full"><span>{t("library.tagsLabel")} <small>{t("library.tagsHelp")}</small></span><input value={draft.tags} onChange={(event) => patchDraft(draft.key, { tags: event.target.value })} /></label></div>
        <EntityPicker value={draft.relations} onChange={(relations) => patchDraft(draft.key, { relations })} />
        <span className={`import-state state-${draft.state}`} aria-live="polite">{draft.state === "processing" ? t("library.importing") : draft.state === "done" ? t("library.importSuccess") : draft.state === "failed" ? t("library.importFailed") : ""}</span>
      </article>)}</div>
      {globalError && <p className="form-error" role="alert">{globalError}</p>}
      <div className="form-actions"><span className="privacy-note"><ShieldCheck size={15} />{t("library.privacy")}</span><button type="button" className="button-primary" disabled={busy || !drafts.length || drafts.some((draft) => Boolean(draft.error) || !draft.title.trim())} onClick={() => void importFiles()}>{busy ? t("library.importing") : t("library.importFiles", { count: drafts.length })}</button></div>
    </> : <LinkImportForm />}
  </div>;
}

function LinkImportForm() {
  const { t } = useI18n(); const router = useRouter();
  const [url, setUrl] = useState(""); const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [source, setSource] = useState(""); const [authors, setAuthors] = useState(""); const [tags, setTags] = useState(""); const [notes, setNotes] = useState(""); const [previewImage, setPreviewImage] = useState(""); const [fetchedPreview, setFetchedPreview] = useState<LinkPreviewMetadata | null>(null); const [previewError, setPreviewError] = useState(false); const [relations, setRelations] = useState<LibraryRelation[]>([]); const [language, setLanguage] = useState<LibraryLanguage>("unknown"); const [duplicate, setDuplicate] = useState<LibraryItem | null>(null); const [strategy, setStrategy] = useState<DuplicateStrategy>("skip"); const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const refreshPreview = async () => {
    try { assertSafePreviewUrl(url); } catch { setPreviewError(true); return; }
    setBusy(true); setPreviewError(false);
    try {
      const result = await linkPreviewService.fetch(url);
      setFetchedPreview(result.preview);
      setTitle((current) => current || result.preview.title || "");
      setDescription((current) => current || result.preview.description || "");
      setSource((current) => current || result.preview.siteName || "");
    } catch { setPreviewError(true); }
    finally { setBusy(false); }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); const canonicalUrl = canonicalizeUrl(url); if (!canonicalUrl) { setError(t("library.invalidUrl")); return; }
    if (previewImage.trim()) { try { assertSafePreviewUrl(previewImage); } catch { setError(t("library.previewSaveError")); return; } }
    setBusy(true); setError(null);
    try {
      const match = duplicate ?? await libraryRepository.findDuplicate({ canonicalUrl });
      if (match && !duplicate) { setDuplicate(match); setBusy(false); return; }
      let remote = fetchedPreview;
      if (!remote) { try { remote = (await linkPreviewService.fetch(url)).preview; } catch { setPreviewError(true); } }
      const manual = { title: title.trim(), description: description.trim() || undefined, siteName: source.trim() || undefined, imageUrl: previewImage.trim() || undefined };
      const linkPreview = mergePreview(manual, remote ?? { status: "failed" }, getProviderPreview(url));
      if (!remote && !previewImage.trim()) linkPreview.status = "failed";
      const metadata = { type: "link" as const, title: title.trim(), description: description.trim() || undefined, url: url.trim(), canonicalUrl, sourceName: source.trim() || undefined, authors: normalizeTags(authors), tags: normalizeTags(tags), notes: notes.trim() || undefined, language, status: "ready" as const, extractionStatus: "not-needed" as const, relatedEntities: relations, linkPreview };
      if (match && strategy === "skip") { router.push(`/library/${match.id}`); return; }
      if (match && strategy === "update") await libraryRepository.update(match.id, metadata); else await libraryRepository.create(metadata);
      router.push("/library");
    } catch { setError(t("library.importFailed")); } finally { setBusy(false); }
  };
  return <form className="panel library-form" onSubmit={(event) => void save(event)}><div className="library-form-grid"><label className="form-field full"><span>{t("library.urlLabel")}</span><input type="url" required value={url} onChange={(event) => { setUrl(event.target.value); setDuplicate(null); setFetchedPreview(null); }} placeholder="https://" /></label><label className="form-field"><span>{t("library.titleLabel")}</span><input required maxLength={300} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label className="form-field"><span>{t("library.sourceLabel")}</span><input value={source} onChange={(event) => setSource(event.target.value)} /></label><label className="form-field full"><span>{t("library.descriptionLabel")}</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label><label className="form-field full"><span>{t("library.previewImageUrl")}</span><div className="field-with-action"><input type="url" value={previewImage} onChange={(event) => setPreviewImage(event.target.value)} placeholder="https://" /><button type="button" className="button-secondary" onClick={() => setPreviewImage("")}>{t("library.removePreviewImage")}</button></div></label><label className="form-field"><span>{t("library.authorsLabel")}</span><input value={authors} onChange={(event) => setAuthors(event.target.value)} /></label><label className="form-field"><span>{t("library.tagsLabel")} <small>{t("library.tagsHelp")}</small></span><input value={tags} onChange={(event) => setTags(event.target.value)} /></label><label className="form-field"><span>{t("library.languageLabel")}</span><select value={language} onChange={(event) => setLanguage(event.target.value as LibraryLanguage)}>{languageOptions.map((item) => <option key={item} value={item}>{t(languageKey[item])}</option>)}</select></label><label className="form-field full"><span>{t("library.notesLabel")}</span><textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} /></label></div><div className="form-actions preview-fetch-actions"><span className="form-notice">{t("library.previewFetchNote")}</span><button type="button" className="button-secondary" disabled={busy || !url.trim()} onClick={() => void refreshPreview()}>{busy ? t("library.previewLoading") : t("library.refreshPreview")}</button></div>{fetchedPreview && <p className="form-notice" role="status">{t("library.previewReady")}: {fetchedPreview.title || fetchedPreview.siteName || new URL(url).hostname}</p>}{previewError && <p className="form-notice" role="status">{t("library.previewFetchError")}</p>}<EntityPicker value={relations} onChange={setRelations} />
    {duplicate && <fieldset className="duplicate-box"><legend>{t("library.duplicate")}</legend>{(["skip", "copy", "update"] as DuplicateStrategy[]).map((item) => <label key={item}><input type="radio" name="link-duplicate" checked={strategy === item} onChange={() => setStrategy(item)} />{t(item === "skip" ? "library.skipDuplicate" : item === "copy" ? "library.saveCopy" : "library.updateExisting")}</label>)}</fieldset>}
    {error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><span className="privacy-note"><ShieldCheck size={15} />{t("library.privacy")}</span><button className="button-primary" disabled={busy}>{busy ? t("library.importing") : t("library.saveLink")}</button></div>
  </form>;
}

"use client";

import { Download, Expand, ExternalLink, FileWarning, Minimize, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { LIBRARY_CONFIG } from "@/lib/library/config";
import type { LibraryItem } from "@/lib/library/types";

function SafeMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let code: string[] = [];
  let paragraph: string[] = [];
  const flushParagraph = () => { if (paragraph.length) { nodes.push(<p key={`p-${nodes.length}`}>{paragraph.join(" ")}</p>); paragraph = []; } };
  const flushCode = () => { if (code.length) { nodes.push(<pre key={`c-${nodes.length}`}><code>{code.join("\n")}</code></pre>); code = []; } };
  let inCode = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) { flushParagraph(); if (inCode) flushCode(); inCode = !inCode; continue; }
    if (inCode) { code.push(line); continue; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) { flushParagraph(); const level = Math.min(heading[1].length + 1, 6); nodes.push(level === 2 ? <h2 key={`h-${nodes.length}`}>{heading[2]}</h2> : level === 3 ? <h3 key={`h-${nodes.length}`}>{heading[2]}</h3> : <h4 key={`h-${nodes.length}`}>{heading[2]}</h4>); continue; }
    if (/^\s*([-*+] |\d+\. )/.test(line)) { flushParagraph(); nodes.push(<p className="markdown-list-line" key={`l-${nodes.length}`}>{line}</p>); continue; }
    if (!line.trim()) { flushParagraph(); continue; }
    paragraph.push(line.trim());
  }
  flushParagraph(); flushCode();
  return <div className="document-prose">{nodes}</div>;
}

export function DocumentReader({ item, blobUrl }: { item: LibraryItem; blobUrl: string | null }) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const hadFocusModeRef = useRef(false);
  const [focusMode, setFocusMode] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState<"width" | "page">("width");
  const isPdf = item.fileFormat === "pdf";
  const text = item.extractedText?.slice(0, LIBRARY_CONFIG.previewCharacters);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (focusMode && !dialog.open) { dialog.showModal(); hadFocusModeRef.current = true; document.body.style.overflow = "hidden"; closeRef.current?.focus(); }
    if (!focusMode && hadFocusModeRef.current) { if (dialog.open) dialog.close(); document.body.style.overflow = ""; triggerRef.current?.focus(); hadFocusModeRef.current = false; }
    return () => { document.body.style.overflow = ""; if (dialog.open) dialog.close(); };
  }, [focusMode]);
  useEffect(() => { if (!isPdf || !blobUrl || pdfLoaded) return; const timer = window.setTimeout(() => setPdfError(true), 12_000); return () => window.clearTimeout(timer); }, [blobUrl, isPdf, pdfLoaded]);

  const toolbar = (insideDialog: boolean) => <div className="document-toolbar" role="toolbar" aria-label={t("library.readerToolbar")}>
    {!isPdf && text && <><button type="button" className={fit === "width" ? "active" : ""} onClick={() => setFit("width")}>{t("library.fitWidth")}</button><button type="button" className={fit === "page" ? "active" : ""} onClick={() => setFit("page")}>{t("library.fitPage")}</button><button type="button" aria-label={t("library.zoomOut")} onClick={() => setZoom((value) => Math.max(.75, Math.round((value - .1) * 10) / 10))}><ZoomOut size={16} /></button><span aria-live="polite">{Math.round(zoom * 100)}%</span><button type="button" aria-label={t("library.zoomIn")} onClick={() => setZoom((value) => Math.min(1.8, Math.round((value + .1) * 10) / 10))}><ZoomIn size={16} /></button><button type="button" aria-label={t("library.resetZoom")} onClick={() => { setZoom(1); setFit("width"); }}><RotateCcw size={15} /></button></>}
    <span className="document-toolbar-spacer" />
    {blobUrl && <><a href={blobUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} />{t("library.openOriginal")}</a><a href={blobUrl} download={item.fileName}><Download size={15} />{t("library.downloadOriginal")}</a></>}
    {insideDialog ? <button ref={closeRef} type="button" onClick={() => setFocusMode(false)}><Minimize size={16} />{t("library.closeFocus")}</button> : <button ref={triggerRef} type="button" onClick={() => setFocusMode(true)}><Expand size={16} />{t("library.focusMode")}</button>}
  </div>;
  const viewer = (insideDialog: boolean) => <div className={`document-surface${insideDialog ? " focus" : ""}${fit === "page" ? " fit-page" : ""}`}>
    {isPdf && blobUrl ? <><iframe className="pdf-preview" src={blobUrl} title={item.title} onLoad={() => { setPdfLoaded(true); setPdfError(false); }} onError={() => setPdfError(true)} />{!pdfLoaded && !pdfError && <div className="document-loading" role="status">{t("library.previewLoading")}</div>}{pdfError && <div className="document-warning" role="alert">{t("library.pdfFallback")}</div>}</>
      : text ? item.fileFormat === "markdown" ? <div className="document-text-scroll" style={{ fontSize: `${zoom}em` }}><SafeMarkdown text={text} /></div> : <div className="document-text-scroll" style={{ fontSize: `${zoom}em` }}><pre className="document-text" lang={item.language === "vi" ? "vi" : item.language === "en" ? "en" : undefined}>{text}</pre></div>
      : <div className="empty-state"><FileWarning /><strong>{t("library.noPreview")}</strong></div>}
  </div>;
  return <section className="panel document-viewer"><div className="panel-header"><h2>{t("library.preview")}</h2>{isPdf && <span className="document-native-note">{t("library.pdfBrowserControls")}</span>}</div>{toolbar(false)}{viewer(false)}{item.extractedText && item.extractedText.length > LIBRARY_CONFIG.previewCharacters && <p className="form-notice">{t("library.textTruncated", { count: LIBRARY_CONFIG.previewCharacters })}</p>}
    <dialog ref={dialogRef} className="document-focus-dialog" aria-label={t("library.focusMode")} onCancel={() => setFocusMode(false)} onKeyDown={(event) => { if (event.key === "Escape") setFocusMode(false); }} onClose={() => setFocusMode(false)}><div className="document-focus-layout"><div className="document-focus-title">{item.title}</div>{toolbar(true)}{focusMode && viewer(true)}</div></dialog>
  </section>;
}

"use client";

import { Check, Clipboard, Languages, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTextSelection } from "@/hooks/use-text-selection";
import { translateSelection, type TranslationResult, type TranslationSource } from "@/lib/translation";
import { useI18n } from "@/components/locale-provider";

function sourceKey(source: TranslationSource) {
  if (source === "curated") return "translation.curated" as const;
  if (source === "glossary") return "translation.glossary" as const;
  if (source === "browser") return "translation.browser" as const;
  return "translation.unavailable" as const;
}

export function SelectionTranslator() {
  const { selection, clear } = useTextSelection();
  const { t } = useI18n();
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [original, setOriginal] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLElement>(null);
  const translateButtonRef = useRef<HTMLButtonElement>(null);

  const position = useMemo(() => {
    if (!selection) return undefined;
    const width = 260;
    const left = Math.min(window.innerWidth - width - 10, Math.max(10, selection.rect.left + selection.rect.width / 2 - width / 2));
    const below = selection.rect.top < 60;
    const top = below ? selection.rect.bottom + 10 : selection.rect.top - 48;
    return { left, top };
  }, [selection]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setResult(null); clear(); } };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target) || translateButtonRef.current?.parentElement?.contains(target)) return;
      setResult(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onPointer); };
  }, [clear]);

  if (!selection && !result) return null;
  const translate = async () => {
    if (!selection) return;
    const text = selection.text;
    setOriginal(text); setLoading(true);
    const next = await translateSelection(text);
    setResult(next); setLoading(false);
    requestAnimationFrame(() => popoverRef.current?.querySelector<HTMLButtonElement>("button")?.focus());
  };
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1400);
  };
  return <>
    {selection && !result && position && <div className="selection-toolbar" style={position} role="toolbar" aria-label={t("translation.dialogTitle")} onPointerDown={(event) => event.preventDefault()}>
      <button ref={translateButtonRef} type="button" onClick={translate}><Languages size={14} />{loading ? "…" : t("actions.translateVi")}</button>
      <button type="button" onClick={() => copy(selection.text)} aria-live="polite"><Clipboard size={14} />{copied ? t("actions.copied") : t("actions.copy")}</button>
    </div>}
    {result && <section ref={popoverRef} className="translation-popover" role="dialog" aria-modal="false" aria-labelledby="translation-heading">
      <header><h2 id="translation-heading">{t("translation.dialogTitle")}</h2><button className="icon-button" onClick={() => { setResult(null); clear(); }} aria-label={t("actions.close")}><X size={16} /></button></header>
      <div><span>{t("translation.original")}</span><p lang="en">{original}</p></div>
      <div><span>{t("translation.translation")}</span><p lang="vi">{result.source === "unavailable" ? t("translation.unavailable") : result.text}</p>{result.definition && <small lang="vi">{result.definition}</small>}</div>
      <footer><span>{t("translation.source", { source: t(sourceKey(result.source)) })}</span>{result.source !== "unavailable" && <button className="button-secondary" onClick={() => copy(result.text)} aria-live="polite">{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? t("actions.copied") : t("actions.copyTranslation")}</button>}</footer>
    </section>}
  </>;
}

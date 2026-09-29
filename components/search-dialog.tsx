"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Command, Search, X } from "lucide-react";
import { searchIndex } from "@/content";
import { searchContent } from "@/lib/search";
import { useI18n } from "@/components/locale-provider";
import { useLibraryItems } from "@/hooks/use-library";
import { libraryItemsToSearchResults } from "@/lib/library/search";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const { locale, t } = useI18n();
  const { items: libraryItems } = useLibraryItems();
  const results = useMemo(() => searchContent(query, [...searchIndex, ...libraryItemsToSearchResults(libraryItems)]).slice(0, 9), [libraryItems, query]);

  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    return () => { if (open) requestAnimationFrame(() => returnFocusRef.current?.focus()); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('input, button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", handleKeyDown); };
  }, [onClose, open]);

  if (!open) return null;
  const navigate = (href: string) => { onClose(); router.push(href); };
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section ref={dialogRef} className="search-dialog" role="dialog" aria-modal="true" aria-label={t("actions.searchAtlas")}>
        <div className="search-input-row">
          <Search aria-hidden size={20} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActive(0); }}
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
              if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(results.length - 1, value + 1)); }
              if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(0, value - 1)); }
              if (event.key === "Enter" && results[active]) navigate(results[active].href);
            }}
            placeholder={t("search.placeholder")}
            aria-label={t("actions.searchQuery")}
            aria-controls="search-results"
          />
          <button className="icon-button" onClick={onClose} aria-label={t("actions.closeSearch")}><X size={18} /></button>
        </div>
        <div id="search-results" className="search-results" role="listbox">
          <p className="eyebrow">{query ? t("search.bestMatches", { count: results.length }) : t("search.startAnywhere")}</p>
          {results.map((result, index) => { const title = locale === "vi" ? result.titleVi ?? result.title : result.title; const hierarchy = locale === "vi" ? result.hierarchyVi ?? result.hierarchy : result.hierarchy; return (
            <button key={`${result.type}-${result.id}`} className={`search-result ${active === index ? "active" : ""}`} onMouseEnter={() => setActive(index)} onClick={() => navigate(result.href)} role="option" aria-selected={active === index}>
              <span className="result-icon">{title.charAt(0)}</span>
              <span><strong>{title}</strong><small>{result.type} · {hierarchy}</small></span>
              <ArrowRight size={16} />
            </button>
          ); })}
          {!results.length && <div className="empty-state"><Search size={26} /><strong>{t("search.noResults")}</strong><span>{t("search.tryBroader")}</span></div>}
        </div>
        <footer className="search-footer"><span><kbd>↑</kbd><kbd>↓</kbd> {t("search.navigate")}</span><span><kbd>↵</kbd> {t("search.open")}</span><span><kbd>esc</kbd> {t("search.close")}</span><span className="command-mark"><Command size={14} /> CS Atlas</span></footer>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { resolveStudioOptions, searchStudioOptions } from "@/lib/studio/relationship-client";
import { addRelationshipId, relationshipQueryLimit, type RelationshipKind, type RelationshipOption, type RelationshipResponse } from "@/lib/studio/relationships";
import { moveItem } from "@/lib/studio/draft";

type ReadState = { key: string; response?: RelationshipResponse; failed?: boolean };

/** Shared ID-selection mechanics; domain-specific roles live in the calling editors. */
export function RelationshipPicker({ kind, label, ids, onChange, single = false }: {
  kind: RelationshipKind; label: string; ids: readonly string[]; onChange: (ids: string[]) => void; single?: boolean;
}) {
  const { locale, t } = useI18n();
  const uid = useId();
  const input = useRef<HTMLInputElement>(null);
  const optionsList = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [announcement, setAnnouncement] = useState("");
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState<ReadState>({ key: "" });
  const [resolved, setResolved] = useState<ReadState>({ key: "" });
  const idsRef = useRef(ids);
  useEffect(() => { idsRef.current = ids; }, [ids]);
  const selectionKey = `${kind}:${JSON.stringify(ids)}`;
  const searchKey = `${kind}:${query}:${retry}`;

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    let current = true;
    const timer = setTimeout(() => {
      searchStudioOptions(kind, query, controller.signal).then((response) => {
        if (current) setSearch({ key: searchKey, response });
      }, () => { if (current) setSearch({ key: searchKey, failed: true }); });
    }, 250);
    return () => { current = false; clearTimeout(timer); controller.abort(); };
  }, [kind, query, open, searchKey]);

  useEffect(() => {
    const requested = idsRef.current.filter((id) => id.length > 0 && id.length <= 200 && !/[\u0000-\u001f]/.test(id));
    if (!requested.length) return;
    const controller = new AbortController();
    let current = true;
    resolveStudioOptions(kind, requested, controller.signal).then((response) => {
      if (current) setResolved({ key: selectionKey, response });
    }, () => { if (current) setResolved({ key: selectionKey, failed: true }); });
    return () => { current = false; controller.abort(); };
  }, [kind, selectionKey, retry]);

  const searchState = search.key === searchKey ? search : undefined;
  const results = searchState?.response?.items ?? [];
  const selectedState = resolved.key === selectionKey ? resolved : undefined;
  const records = new Map(selectedState?.response?.items.map((item) => [item.id, item]) ?? []);
  const occurrences = new Map<string, number>();
  const rowKeys = ids.map((id) => {
    const occurrence = occurrences.get(id) ?? 0;
    occurrences.set(id, occurrence + 1);
    return `${id}:${occurrence}`;
  });
  const activeOption = results[active];
  useEffect(() => {
    if (open && active >= 0) optionsList.current?.children.item(active)?.scrollIntoView?.({ block: "nearest" });
  }, [active, open]);

  function select(option: RelationshipOption) {
    if (ids.includes(option.id)) setAnnouncement(t("studio.relationshipAlreadySelected", { id: option.id }));
    else {
      onChange(single ? [option.id] : addRelationshipId(ids, option.id));
      setAnnouncement(t("studio.relationshipAdded", { id: option.id }));
    }
    setQuery(""); setActive(-1); setOpen(false); input.current?.focus();
  }
  function changedQuery(value: string) { setQuery(value); setActive(-1); setOpen(true); }
  const name = (option: RelationshipOption) => option.label[locale] || option.label.en || option.id;
  return <div className="studio-relationship-picker" role="group" aria-label={label} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActive(-1); }
  }}>
    <div className="studio-relationship-heading"><strong>{label} · {ids.length}</strong>
      {single && <small>{t("studio.singleRelationship")}</small>}
    </div>
    <ol className="studio-selected-relationships">{ids.map((id, index) => {
      const option = records.get(id);
      const invalidId = !id || id.length > 200 || /[\u0000-\u001f]/.test(id);
      const unresolved = invalidId || selectedState?.response?.unresolvedIds.includes(id);
      return <li key={rowKeys[index]} data-unresolved={Boolean(unresolved)}>
        <div><span>{option ? name(option) : unresolved ? t("studio.unresolvedRelationship") : selectedState?.failed ? t("studio.relationshipLookupFailed") : t("studio.relationshipResolving")}</span>
          <code>{id || t("studio.emptyRelationship")}</code>
          {option && <small>{option.metadata.join(" · ")}</small>}
        </div>
        {!single && <div className="studio-actions">
          <button type="button" aria-label={`${t("studio.moveUp")} · ${label} · ${id}`} disabled={index === 0} onClick={() => onChange(moveItem(ids, index, index - 1))}>↑</button>
          <button type="button" aria-label={`${t("studio.moveDown")} · ${label} · ${id}`} disabled={index === ids.length - 1} onClick={() => onChange(moveItem(ids, index, index + 1))}>↓</button>
          <button type="button" aria-label={`${t("studio.remove")} · ${label} · ${id}`} onClick={() => {
            onChange(ids.filter((_, position) => position !== index)); setAnnouncement(t("studio.relationshipRemoved", { id })); input.current?.focus();
          }}>×</button>
        </div>}
      </li>;
    })}</ol>
    {selectedState?.failed && <button type="button" onClick={() => setRetry((value) => value + 1)}>{t("studio.relationshipRetry")}</button>}
    <div className="studio-relationship-search">
      <label className="studio-field" htmlFor={`${uid}-input`}>{t("studio.relationshipSearch", { label })}</label>
      <div className="studio-relationship-input-row"><input id={`${uid}-input`} ref={input} role="combobox" type="text" autoComplete="off" maxLength={relationshipQueryLimit}
        aria-autocomplete="list" aria-expanded={open} aria-controls={open ? `${uid}-results` : undefined}
        aria-activedescendant={open && activeOption ? `${uid}-option-${active}` : undefined}
        aria-describedby={`${uid}-help`} value={query} onFocus={() => setOpen(true)} onChange={(event) => changedQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") { event.preventDefault(); setOpen(false); setActive(-1); }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setOpen(true);
            setActive(results.length ? event.key === "ArrowDown" ? (active + 1) % results.length : active <= 0 ? results.length - 1 : active - 1 : -1);
          }
          if (event.key === "Enter") { event.preventDefault(); if (open && activeOption) select(activeOption); }
        }} />
        <button type="button" aria-label={`${t("studio.clearSearch")} · ${label}`} disabled={!query} onClick={() => { changedQuery(""); input.current?.focus(); }}>{t("studio.clearSearch")}</button>
      </div>
      <p id={`${uid}-help`} className="studio-body-meta">{t("studio.relationshipHelp")}</p>
      {kind === "references" && <p className="studio-body-meta">{t("studio.referenceSearchHelp")}</p>}
      {open && <>
        <ul ref={optionsList} id={`${uid}-results`} role="listbox" aria-label={label} aria-multiselectable={!single} className="studio-relationship-results" aria-busy={!searchState}>
          {results.map((option, index) => <li key={option.id} id={`${uid}-option-${index}`} role="option" aria-selected={ids.includes(option.id)} data-active={active === index}
            onMouseDown={(event) => event.preventDefault()} onMouseMove={() => setActive(index)} onClick={() => select(option)}>
            <strong>{name(option)}{ids.includes(option.id) && <small> · {t("studio.relationshipSelected")}</small>}</strong>
            <code>{option.id}</code><small>{option.metadata.join(" · ")}</small>
            <span>{option.description[locale] || option.description.en}</span>
          </li>)}
        </ul>
        <p role="status" className="studio-body-meta">{!searchState ? t("studio.relationshipLoading") : searchState.failed ? t("studio.relationshipSearchFailed")
          : !results.length ? t("studio.relationshipEmpty") : t(searchState.response?.hasMore ? "studio.relationshipMore" : "studio.relationshipResults", { count: results.length })}</p>
        {searchState?.failed && <button type="button" onClick={() => setRetry((value) => value + 1)}>{t("studio.relationshipRetry")}</button>}
      </>}
    </div>
    <span role="status" className="visually-hidden">{announcement}</span>
  </div>;
}

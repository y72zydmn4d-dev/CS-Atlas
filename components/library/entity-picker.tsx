"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { libraryRelationAuthoringOptions, resolveLibraryRelation } from "@/lib/library/entities";
import { normalizeLibraryText } from "@/lib/library/search";
import type { LibraryRelation, LibraryRelationKind } from "@/lib/library/types";

const relationKinds: LibraryRelationKind[] = ["primary", "prerequisite", "supplementary", "example", "exercise", "reference"];
const relationMessage = {
  primary: "library.relationPrimary",
  prerequisite: "library.relationPrerequisite",
  supplementary: "library.relationSupplementary",
  example: "library.relationExample",
  exercise: "library.relationExercise",
  reference: "library.relationReference",
} as const;

export function EntityPicker({ value, onChange }: { value: LibraryRelation[]; onChange: (value: LibraryRelation[]) => void }) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<LibraryRelationKind>("supplementary");
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const results = useMemo(() => {
    const term = normalizeLibraryText(query);
    return libraryRelationAuthoringOptions.filter((item) => !value.some((relation) => relation.entityId === item.id && relation.entityType === item.type)).filter((item) => !term || normalizeLibraryText(`${item.label} ${item.labelVi ?? ""} ${item.hierarchy} ${item.hierarchyVi ?? ""}`).includes(term)).slice(0, 30);
  }, [query, value]);
  const close = () => { setOpen(false); setQuery(""); requestAnimationFrame(() => triggerRef.current?.focus()); };
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  const handleDialogKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") { close(); return; }
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('input, select, button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusable?.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  return <div className="entity-picker">
    <div className="relation-chips">{value.map((relation) => { const entity = resolveLibraryRelation(relation, locale); const label = entity?.displayLabel ?? t("library.missingReference"); return <span className={entity ? "relation-chip" : "relation-chip missing"} key={`${relation.entityType}:${relation.entityId}`}><span><strong>{label}</strong><small>{entity?.displayHierarchy ?? `${relation.entityType}:${relation.entityId}`} · {t(relationMessage[relation.relation])}</small></span><button type="button" onClick={() => onChange(value.filter((item) => item !== relation))} aria-label={t("library.removeRelation", { title: label })}><X size={13} /></button></span>; })}</div>
    <button ref={triggerRef} type="button" className="button-secondary" onClick={() => setOpen(true)}>{t("library.addRelationship")}</button>
    {open && <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && close()}><div ref={dialogRef} className="entity-dialog" role="dialog" aria-modal="true" aria-labelledby="entity-picker-title" onKeyDown={handleDialogKeyDown}>
      <div className="panel-header"><h2 id="entity-picker-title">{t("library.addRelationship")}</h2><button type="button" className="icon-button" onClick={close} aria-label={t("actions.close")}><X size={17} /></button></div>
      <label className="form-field"><span>{t("library.relationType")}</span><select value={kind} onChange={(event) => setKind(event.target.value as LibraryRelationKind)}>{relationKinds.map((item) => <option key={item} value={item}>{t(relationMessage[item])}</option>)}</select></label>
      <label className="catalog-search"><Search size={17} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("library.findKnowledge")} /></label>
      <div className="entity-results" role="listbox">{results.map((item) => { const label = locale === "vi" ? item.labelVi ?? item.label : item.label; const hierarchy = locale === "vi" ? item.hierarchyVi ?? item.hierarchy : item.hierarchy; return <button type="button" role="option" aria-selected="false" key={`${item.type}:${item.id}`} onClick={() => { onChange([...value, { entityType: item.type, entityId: item.id, relation: kind }]); close(); }}><strong>{label}</strong><small>{hierarchy}</small></button>; })}{results.length === 0 && <p className="empty-inline">{t("library.noEntities")}</p>}</div>
    </div></div>}
  </div>;
}

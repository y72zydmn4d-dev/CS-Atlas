"use client";

import { useI18n } from "@/components/locale-provider";
import { LocalizedField } from "@/components/studio/editor-fields";
import type { LocalizedConceptText } from "@/lib/domain/concepts";
import type { Locale } from "@/lib/types";
import { moveItem } from "@/lib/studio/draft";

/** Objectives and lists use the same canonical localized item array. */
export function LearningObjectivesEditor({ items, language, onChange, list = false }: {
  items: LocalizedConceptText[]; language: Locale; onChange: (items: LocalizedConceptText[]) => void; list?: boolean;
}) {
  const { t } = useI18n();
  const label = t(list ? "studio.listItem" : "studio.objective");
  return <div className="studio-repeatable">
    {items.map((item, index) => <div className="studio-repeatable-row" key={index}>
      <LocalizedField label={`${label} ${index + 1}`} value={item} language={language}
        onChange={(value) => onChange(items.map((entry, position) => position === index ? value : entry))} />
      <div className="studio-actions">
        <button type="button" aria-label={`${t("studio.moveUp")} · ${label} ${index + 1}`} disabled={index === 0} onClick={() => onChange(moveItem(items, index, index - 1))}>↑</button>
        <button type="button" aria-label={`${t("studio.moveDown")} · ${label} ${index + 1}`} disabled={index === items.length - 1} onClick={() => onChange(moveItem(items, index, index + 1))}>↓</button>
        <button type="button" aria-label={`${t("studio.remove")} · ${label} ${index + 1}`} onClick={() => onChange(items.filter((_, position) => position !== index))}>{t("studio.remove")}</button>
      </div>
    </div>)}
    <button type="button" onClick={() => onChange([...items, { en: "", vi: "" }])}>{t(list ? "studio.addItem" : "studio.addObjective")}</button>
  </div>;
}

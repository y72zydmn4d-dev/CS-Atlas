"use client";

import { useI18n } from "@/components/locale-provider";
import { LocalizedField, TextField } from "@/components/studio/editor-fields";
import type { LearnLessonBlock } from "@/lib/domain/learn-platform";
import type { Locale } from "@/lib/types";

type TableBlock = Extract<LearnLessonBlock, { type: "table" | "comparison" }>;
export function StructuredTableEditor({ block, language, onChange }: { block: TableBlock; language: Locale; onChange: (block: TableBlock) => void }) {
  const { t } = useI18n();
  const emptyText = () => ({ en: "", vi: "" });
  function removeColumn(index: number) {
    const columns = block.columns.filter((_, position) => position !== index);
    onChange(block.type === "table"
      ? { ...block, columns, rows: block.rows.map((row) => row.filter((_, position) => position !== index)) }
      : { ...block, columns, rows: block.rows.map((row) => ({ ...row, values: row.values.filter((_, position) => position !== index) })) });
  }
  function addColumn() {
    const columns = [...block.columns, emptyText()];
    onChange(block.type === "table"
      ? { ...block, columns, rows: block.rows.map((row) => [...row, ""]) }
      : { ...block, columns, rows: block.rows.map((row) => ({ ...row, values: [...row.values, emptyText()] })) });
  }
  return <div className="studio-table-editor">
    <div className="studio-repeatable">
      {block.columns.map((column, index) => <div className="studio-repeatable-row" key={index}>
        <LocalizedField label={`${t("studio.column")} ${index + 1}`} value={column} language={language} onChange={(value) => onChange({ ...block, columns: block.columns.map((entry, position) => position === index ? value : entry) })} />
        <button type="button" disabled={block.columns.length === 1} aria-label={`${t("studio.remove")} · ${t("studio.column")} ${index + 1}`} onClick={() => removeColumn(index)}>{t("studio.remove")}</button>
      </div>)}
      <button type="button" onClick={addColumn}>{t("studio.addColumn")}</button>
    </div>
    {block.type === "table" ? block.rows.map((row, index) => <fieldset className="studio-table-row" key={index}>
      <legend>{t("studio.row")} {index + 1}</legend>
      {row.map((cell, column) => <TextField key={column} label={`${t("studio.cell")} ${index + 1}.${column + 1}`} value={cell}
        onChange={(value) => onChange({ ...block, rows: block.rows.map((entry, position) => position === index ? entry.map((item, offset) => offset === column ? value : item) : entry) })} />)}
      <button type="button" aria-label={`${t("studio.remove")} · ${t("studio.row")} ${index + 1}`} onClick={() => onChange({ ...block, rows: block.rows.filter((_, position) => position !== index) })}>{t("studio.remove")}</button>
    </fieldset>) : block.rows.map((row, index) => <fieldset className="studio-table-row" key={index}>
      <legend>{t("studio.row")} {index + 1}</legend>
      <LocalizedField label={`${t("studio.rowLabel")} ${index + 1}`} value={row.label} language={language} onChange={(label) => onChange({ ...block, rows: block.rows.map((entry, position) => position === index ? { ...entry, label } : entry) })} />
      {row.values.map((cell, column) => <LocalizedField key={column} label={`${t("studio.cell")} ${index + 1}.${column + 1}`} value={cell} language={language}
        onChange={(value) => onChange({ ...block, rows: block.rows.map((entry, position) => position === index ? { ...entry, values: entry.values.map((item, offset) => offset === column ? value : item) } : entry) })} />)}
      <button type="button" aria-label={`${t("studio.remove")} · ${t("studio.row")} ${index + 1}`} onClick={() => onChange({ ...block, rows: block.rows.filter((_, position) => position !== index) })}>{t("studio.remove")}</button>
    </fieldset>)}
    <button type="button" onClick={() => onChange(block.type === "table"
      ? { ...block, rows: [...block.rows, block.columns.map(() => "")] }
      : { ...block, rows: [...block.rows, { label: emptyText(), values: block.columns.map(emptyText) }] })}>{t("studio.addRow")}</button>
  </div>;
}

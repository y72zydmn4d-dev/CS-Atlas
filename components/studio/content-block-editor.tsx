"use client";

import { useI18n } from "@/components/locale-provider";
import { useRef } from "react";
import { LocalizedField, optionalLocalized, TextField } from "@/components/studio/editor-fields";
import { LearningObjectivesEditor } from "@/components/studio/learning-objectives-editor";
import { StructuredTableEditor } from "@/components/studio/structured-table-editor";
import type { LearnLessonBlock } from "@/lib/domain/learn-platform";
import type { Locale } from "@/lib/types";

export function ContentBlockEditor({ block, language, onChange }: { block: LearnLessonBlock; language: Locale; onChange: (block: LearnLessonBlock) => void }) {
  const { t } = useI18n();
  const original = useRef(block);
  function payload() {
    switch (block.type) {
      case "paragraph": case "definition": case "complexity": case "callout": return <>
        {block.type === "definition" && <TextField label={t("studio.term")} value={block.term} onChange={(term) => onChange({ ...block, term })} />}
        {block.type === "complexity" && <div className="studio-editor-field-row">
          <TextField label={t("studio.timeComplexity")} value={block.time} onChange={(time) => onChange({ ...block, time })} />
          <TextField label={t("studio.spaceComplexity")} value={block.space} onChange={(space) => onChange({ ...block, space })} />
        </div>}
        {block.type === "callout" && <label className="studio-field">{t("studio.tone")}<select value={block.tone} onChange={(event) => {
          const tone = event.target.value;
          if (tone === "note" || tone === "tip" || tone === "important" || tone === "warning" || tone === "common-mistake") onChange({ ...block, tone });
        }}>{["note", "tip", "important", "warning", "common-mistake"].map((tone) => <option key={tone}>{tone}</option>)}</select></label>}
        <LocalizedField label={t("studio.text")} value={block.body} language={language} multiline onChange={(body) => onChange({ ...block, body })} />
      </>;
      case "heading": return <>
        <label className="studio-field">{t("studio.headingLevel")}<select value={block.level} onChange={(event) => {
          if (event.target.value === "2" || event.target.value === "3") onChange({ ...block, level: event.target.value === "2" ? 2 : 3 });
        }}><option value="2">H2</option><option value="3">H3</option></select></label>
        <LocalizedField label={t("studio.text")} value={block.text} language={language} onChange={(text) => onChange({ ...block, text })} />
      </>;
      case "objectives": case "list": return <>
        {block.type === "list" && <label className="studio-checkbox"><input type="checkbox" checked={Boolean(block.ordered)} onChange={(event) => {
          const previous = original.current;
          onChange({ ...block, ordered: event.target.checked ? true : previous.type === "list" && previous.ordered === false ? false : undefined });
        }} />{t("studio.orderedList")}</label>}
        <LearningObjectivesEditor items={block.items} language={language} list={block.type === "list"} onChange={(items) => onChange({ ...block, items })} />
      </>;
      case "syntax": case "code": return <>
        <TextField label={t("studio.codeLanguage")} value={block.language} onChange={(language) => onChange({ ...block, language })} />
        <p className="studio-body-meta">{t("studio.noExecution")}</p>
        <TextField label={t("studio.code")} value={block.code} multiline code onChange={(code) => onChange({ ...block, code })} />
        {block.type === "code" && <LocalizedField label={t("studio.caption")} value={block.caption ?? { en: "", vi: "" }} language={language}
          onChange={(caption) => onChange({ ...block, caption: optionalLocalized(caption, original.current.type === "code" ? original.current.caption : undefined) })} />}
      </>;
      case "output": return <TextField label={t("studio.output")} value={block.output} multiline code onChange={(output) => onChange({ ...block, output })} />;
      case "table": case "comparison": return <StructuredTableEditor block={block} language={language} onChange={onChange} />;
      case "example": return <ReadOnlyIds ids={[block.exampleId]} />;
      case "exercise": return <ReadOnlyIds ids={[block.exerciseId]} />;
      case "references": return <ReadOnlyIds ids={block.referenceIds} />;
      case "related": return <ReadOnlyIds ids={[...block.lessonIds, ...block.problemIds]} />;
    }
  }
  return <div className="studio-block-fields">
    <LocalizedField label={t("studio.blockTitle")} value={block.title ?? { en: "", vi: "" }} language={language} onChange={(title) => onChange({ ...block, title: optionalLocalized(title, original.current.title) })} />
    {payload()}
  </div>;
}

function ReadOnlyIds({ ids }: { ids: string[] }) {
  const { t } = useI18n();
  return <><p className="studio-body-meta">{t("studio.relationshipsDeferred")}</p><ul className="studio-id-list">{ids.map((id, index) => <li key={`${index}-${id}`}><code>{id}</code></li>)}</ul></>;
}

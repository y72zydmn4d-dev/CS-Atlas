"use client";

import { useI18n } from "@/components/locale-provider";
import { LocalizedField } from "@/components/studio/editor-fields";
import { learnContentStatuses, type LessonManifest } from "@/lib/domain/learn-platform";
import type { Locale } from "@/lib/types";

export function LessonMetadataEditor({ lesson, language, onChange }: {
  lesson: LessonManifest; language: Locale; onChange: (lesson: LessonManifest) => void;
}) {
  const { t } = useI18n();
  return <fieldset className="studio-editor-section"><legend>{t("studio.draftMetadata")}</legend>
    <LocalizedField label={t("studio.lessonTitle")} value={lesson.title} language={language} onChange={(title) => onChange({ ...lesson, title })} />
    <LocalizedField label={t("studio.description")} value={lesson.description} language={language} multiline onChange={(description) => onChange({ ...lesson, description })} />
    <div className="studio-editor-field-row">
      <label className="studio-field">{t("studio.duration")}<input type="number" min={1} step={1} value={lesson.estimatedMinutes}
        onChange={(event) => { const value = event.target.valueAsNumber; if (Number.isInteger(value) && value > 0) onChange({ ...lesson, estimatedMinutes: value }); }} /></label>
      <label className="studio-field">{t("studio.draftStatus")}<select value={lesson.status} onChange={(event) => {
        const status = learnContentStatuses.find((entry) => entry === event.target.value);
        if (status) onChange({ ...lesson, status });
      }}>{learnContentStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
      <label className="studio-field">{t("studio.difficulty")}<select value={lesson.difficulty} onChange={(event) => {
        const value = event.target.value;
        if (value === "Foundational" || value === "Intermediate" || value === "Advanced") onChange({ ...lesson, difficulty: value });
      }}>{["Foundational", "Intermediate", "Advanced"].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="studio-field">{t("studio.translation")}<select value={lesson.translationStatus} onChange={(event) => {
        const value = event.target.value;
        if (value === "complete" || value === "partial" || value === "english-only") onChange({ ...lesson, translationStatus: value });
      }}>{["english-only", "partial", "complete"].map((value) => <option key={value}>{value}</option>)}</select></label>
    </div>
    <p className="studio-body-meta">{t("studio.statusUnvalidated")}</p>
  </fieldset>;
}

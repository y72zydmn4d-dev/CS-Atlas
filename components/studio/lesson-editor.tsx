"use client";

import { useState, type ReactNode } from "react";
import { useI18n } from "@/components/locale-provider";
import { LocalizedField, TextField } from "@/components/studio/editor-fields";
import { LessonMetadataEditor } from "@/components/studio/lesson-metadata-editor";
import { LessonRelationshipsEditor } from "@/components/studio/lesson-relationships-editor";
import { ContentBlockList } from "@/components/studio/content-block-list";
import { useStudioDraft } from "@/components/studio/studio-draft-session";
import { emptyDraftBody } from "@/lib/studio/draft";
import { LessonValidation } from "@/components/studio/lesson-validation";
import { LessonPreview } from "@/components/studio/lesson-preview";
import type { Locale } from "@/lib/types";

export function LessonEditor({ canonicalDetails, learnerHref }: { canonicalDetails: ReactNode; learnerHref?: string }) {
  const { locale, t } = useI18n();
  const { draft, dirty, resetToken, update, reset } = useStudioDraft();
  const [language, setLanguage] = useState<Locale>(locale);
  const [previewActive, setPreviewActive] = useState(false);
  return <section className="studio-panel studio-inspector studio-editor" data-view={previewActive ? "preview" : "edit"} aria-labelledby="studio-editor-title">
    <header className="studio-panel-header">
      <div className="studio-editor-toolbar"><h2 id="studio-editor-title">{t("studio.editor")}</h2>
        {draft && <><span role="status" className="studio-dirty-status" data-dirty={dirty}>{t(dirty ? "studio.modifiedDraft" : "studio.savedSource")}</span>
          <button type="button" disabled={!dirty} onClick={reset}>{t("studio.resetDraft")}</button></>}
      </div>
      {draft && <>
        <div className="studio-inspector-heading"><h3>{draft.lesson.title[language] || draft.lesson.title.en || draft.lesson.id}</h3>
          {learnerHref && <a href={learnerHref} target="_blank" rel="noopener noreferrer" className="studio-text-link">{t("studio.openCanonical")} ↗</a>}
        </div>
        <div className="studio-language-tabs" role="group" aria-label={t("studio.authorLanguage")}>{(["en", "vi"] as const).map((value) =>
          <button key={value} type="button" aria-pressed={language === value} onClick={() => setLanguage(value)}>{value.toUpperCase()}</button>)}</div>
      </>}
    </header>
    {!draft ? <p className="studio-empty">{t("studio.chooseLesson")}</p> : <div className="studio-editor-content">
      <p className="studio-notice">{t("studio.transientNotice")}</p>
      {draft.lesson.translationStatus === "english-only" && <p className="studio-body-meta">{t("studio.englishOnly")}</p>}
      <details className="studio-canonical-details"><summary>{t("studio.identityDetails")}</summary>{canonicalDetails}</details>
      <LessonValidation key={`validation:${draft.lesson.id}:${resetToken}`} draft={draft} />
      <LessonPreview key={`preview:${draft.lesson.id}:${resetToken}`} draft={draft} language={language} dirty={dirty} active={previewActive} onActiveChange={setPreviewActive} />
      <form hidden={previewActive} onSubmit={(event) => event.preventDefault()}>
        <LessonMetadataEditor lesson={draft.lesson} language={language} onChange={(lesson) => update({ ...draft, lesson })} />
        <LessonRelationshipsEditor key={`${draft.lesson.id}:${resetToken}`} lesson={draft.lesson} onChange={(lesson) => update({ ...draft, lesson })} />
        {!draft.content ? <div className="studio-editor-section"><h3>{t("studio.body")}</h3><p>{t("studio.noBody")}</p>
          <button type="button" onClick={() => update({ ...draft, content: emptyDraftBody(draft.lesson.id) })}>{t("studio.startBody")}</button>
        </div> : <>
          <fieldset className="studio-editor-section"><legend>{t("studio.bodyMetadata")}</legend>
            <p className="studio-body-meta">{t("studio.versionReadOnly", { version: draft.content.version })}</p>
            <LocalizedField label={t("studio.summary")} value={draft.content.summary} language={language} multiline onChange={(summary) => {
              if (draft.content) update({ ...draft, content: { ...draft.content, summary } });
            }} />
            <TextField label={t("studio.reviewDate")} value={draft.content.reviewedAt} type="date" onChange={(reviewedAt) => {
              if (draft.content) update({ ...draft, content: { ...draft.content, reviewedAt } });
            }} />
          </fieldset>
          <ContentBlockList key={`${draft.lesson.id}:${resetToken}`} blocks={draft.content.blocks} language={language} onChange={(blocks) => {
            if (draft.content) update({ ...draft, content: { ...draft.content, blocks } });
          }} />
        </>}
      </form>
    </div>}
  </section>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { LessonContentSurface } from "@/components/learn/lesson-content-surface";
import { LearnRenderEnvironment } from "@/components/learn/learn-render-environment";
import { PreviewErrorBoundary } from "@/components/studio/preview-error-boundary";
import { ValidationIssues } from "@/components/studio/validation-issues";
import { draftFingerprint, toCanonicalCandidate, type AuthoringLessonDraft } from "@/lib/studio/draft";
import { requestStudioPreview } from "@/lib/studio/preview-client";
import type { StudioPreviewResponse } from "@/lib/studio/preview";
import type { Locale } from "@/lib/types";

/** Chrome/state only. Lesson rendering belongs entirely to the shared Learn surface. */
export function LessonPreview({ draft, language, dirty, active, onActiveChange }: {
  draft: AuthoringLessonDraft; language: Locale; dirty: boolean; active: boolean; onActiveChange: (active: boolean) => void;
}) {
  const { t } = useI18n();
  const fingerprint = draftFingerprint(draft);
  const [result, setResult] = useState<{ response: StudioPreviewResponse; fingerprint: string; generation: number } | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const request = useRef<{ controller: AbortController; sequence: number } | null>(null);
  const sequence = useRef(0);
  const trigger = useRef<HTMLButtonElement | null>(null);
  useEffect(() => () => { request.current?.controller.abort(); }, [fingerprint]);
  const stale = Boolean(result && result.fingerprint !== fingerprint);
  async function prepare() {
    onActiveChange(true);
    if (pending === fingerprint) return;
    request.current?.controller.abort();
    const controller = new AbortController(); const current = ++sequence.current;
    request.current = { controller, sequence: current };
    setPending(fingerprint); setFailed(false);
    try {
      const response = await requestStudioPreview({ subjectId: draft.lesson.subjectId, lessonId: draft.lesson.id, draft: toCanonicalCandidate(draft) }, controller.signal);
      if (!controller.signal.aborted && request.current?.sequence === current) setResult({ response, fingerprint, generation: current });
    } catch {
      if (!controller.signal.aborted && request.current?.sequence === current) setFailed(true);
    } finally { if (request.current?.sequence === current) setPending(null); }
  }
  const model = result?.response.model;
  return <section className="studio-preview" aria-label={t("studio.previewTitle")}>
    <div className="studio-preview-toolbar">
      <button ref={trigger} type="button" aria-pressed={active} disabled={pending === fingerprint} onClick={() => void prepare()}>{t(pending === fingerprint ? "studio.preparingPreview" : active ? "studio.refreshPreview" : "studio.preview")}</button>
      {active && <button type="button" onClick={() => { onActiveChange(false); trigger.current?.focus(); }}>{t("studio.backToEditor")}</button>}
      <span role="status">{t(stale ? "studio.previewStale" : active ? "studio.authorPreview" : "studio.previewPrompt")}</span>
    </div>
    {active && <>
      <p className="studio-notice">{t("studio.previewSafety")}</p>
      <p className="studio-body-meta">{t(dirty ? "studio.unsavedPreview" : "studio.canonicalEquivalentPreview")} · {language.toUpperCase()} · {t("studio.previewLocaleFallback")}</p>
      <div role="status" aria-live="polite">
        {failed ? <p>{t("studio.previewServiceFailed")}</p> : pending === fingerprint ? <p>{t("studio.preparingPreview")}</p> : !result ? <p>{t("studio.previewPrompt")}</p> : <>
          <p>{t(stale ? "studio.previewStale" : model ? "studio.previewCurrent" : "studio.previewBlocked")}</p>
          <p>{t("studio.validationCounts", { errors: result.response.report.counts.ERROR, warnings: result.response.report.counts.WARNING, info: result.response.report.counts.INFO })}</p>
          {model && !result.response.report.canPersistInFuture && <p>{t("studio.previewNotPersistable")}</p>}
        </>}
      </div>
      {result && result.response.report.issues.length > 0 && <details className="studio-preview-diagnostics" open={!model}>
        <summary>{t("studio.previewDiagnostics")}</summary><ValidationIssues report={result.response.report} stale={stale} />
      </details>}
      {result && model && !failed && pending !== fingerprint && <div className="studio-preview-reading" data-stale={stale} lang={language}>
        <PreviewErrorBoundary key={`${result.generation}:${language}`} fallback={<p role="alert">{t("studio.previewRenderFailed")}</p>}>
          <LearnRenderEnvironment mode="author-preview" locale={language}>
            <LessonContentSurface lesson={model.lesson} content={model.content ?? undefined} context={model.context} resources={model.resources} />
          </LearnRenderEnvironment>
        </PreviewErrorBoundary>
      </div>}
    </>}
  </section>;
}

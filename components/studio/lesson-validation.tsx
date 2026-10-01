"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { draftFingerprint, toCanonicalCandidate, type AuthoringLessonDraft } from "@/lib/studio/draft";
import { requestStudioValidation } from "@/lib/studio/validation-client";
import type { ValidationReport } from "@/lib/domain/learn-validation/types";
import { ValidationIssues } from "@/components/studio/validation-issues";

/** Report state is separate from the transient draft. Never a persistence ticket. */
export function LessonValidation({ draft }: { draft: AuthoringLessonDraft }) {
  const { t } = useI18n();
  const fingerprint = draftFingerprint(draft);
  const [result, setResult] = useState<{ report: ValidationReport; fingerprint: string } | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const request = useRef<{ controller: AbortController; sequence: number } | null>(null);
  const sequence = useRef(0);
  // Changes/unmount abort outstanding work. Exact response binding also guards transports ignoring abort.
  useEffect(() => () => { request.current?.controller.abort(); }, [fingerprint]);
  const stale = Boolean(result && result.fingerprint !== fingerprint);
  async function validate() {
    if (pending === fingerprint) return;
    request.current?.controller.abort();
    const controller = new AbortController();
    const current = ++sequence.current;
    request.current = { controller, sequence: current };
    setPending(fingerprint); setFailed(false);
    try {
      const report = await requestStudioValidation({ subjectId: draft.lesson.subjectId, lessonId: draft.lesson.id, draft: toCanonicalCandidate(draft) }, controller.signal);
      if (!controller.signal.aborted && request.current?.sequence === current) setResult({ report, fingerprint });
    } catch {
      if (!controller.signal.aborted && request.current?.sequence === current) setFailed(true);
    } finally {
      if (request.current?.sequence === current) setPending(null);
    }
  }
  return <section className="studio-editor-section studio-validation" aria-labelledby="studio-validation-title">
    <div className="studio-validation-heading"><h3 id="studio-validation-title">{t("studio.validationTitle")}</h3>
      <button type="button" disabled={pending === fingerprint} onClick={() => void validate()}>{t(pending === fingerprint ? "studio.validating" : "studio.validate")}</button>
    </div>
    <p className="studio-body-meta">{t("studio.validationHelp")}</p>
    <div role="status" aria-live="polite">
      {failed ? <p>{t("studio.validationFailed")}</p> : pending === fingerprint ? <p>{t("studio.validating")}</p> : !result ? <p>{t("studio.notValidated")}</p> : <>
        <p>{t(stale ? "studio.validationStale" : result.report.hasErrors ? "studio.validationInvalid" : "studio.validationCurrent")}</p>
        <p>{t("studio.validationCounts", { errors: result.report.counts.ERROR, warnings: result.report.counts.WARNING, info: result.report.counts.INFO })}</p>
      </>}
    </div>
    {result && <ValidationIssues report={result.report} stale={stale} />}
  </section>;
}

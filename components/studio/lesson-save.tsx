"use client";
import { useI18n } from "@/components/locale-provider";
import { useStudioDraft } from "./studio-draft-session";
import { ValidationIssues } from "./validation-issues";
import { draftFingerprint } from "@/lib/studio/draft";
export function LessonSave() {
  const { t } = useI18n();
  const { draft, save, saving, canSave, saveResult, reload, keepDraft } = useStudioDraft();
  const result = saveResult?.result;
  return <section className="studio-editor-section" aria-label={t("studio.save")}>
    <button type="button" disabled={!canSave} onClick={() => void save()}>{t(saving ? "studio.saving" : "studio.save")}</button>
    <span className="studio-body-meta"> · Ctrl/Cmd+S</span>
    <div role="status" aria-live="polite">
      {result?.status === "saved" && <><p>{t("studio.saved")}</p><ul>{result.changedFiles.map(p => <li key={p}><code>{p}</code></li>)}</ul></>}
      {result?.status === "conflict" && <><p>{t("studio.saveConflict")}</p><button type="button" onClick={reload}>{t("studio.reloadLatest")}</button> <button type="button" onClick={keepDraft}>{t("studio.keepDraft")}</button></>}
      {result?.status === "failed" && <><p role="alert">{t(["ROLLBACK_FAILED", "RECOVERY_REQUIRED", "READBACK_FAILED"].includes(result.code) ? "studio.saveCritical" : "studio.saveFailed")}</p><details><summary>{t("studio.saveDetails")}</summary><code>{result.code}</code>{result.operationId && <p><code>{result.operationId}</code></p>}</details></>}
      {result?.status === "validation-failed" && <><p>{t("studio.saveInvalid")}</p><ValidationIssues report={result.report} stale={Boolean(draft && saveResult?.fingerprint !== draftFingerprint(draft))} /></>}
    </div>
  </section>;
}

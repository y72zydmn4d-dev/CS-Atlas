"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/components/locale-provider";
import { DiscardChangesDialog } from "@/components/studio/discard-changes-dialog";
import { draftFingerprint, toAuthoringDraft, type AuthoringLessonDraft } from "@/lib/studio/draft";
import { navigateStudioDocument } from "@/lib/studio/document-navigation";
import type { StudioLessonInspection } from "@/lib/studio/types";
import { saveStudioLesson, reloadStudioLesson } from "@/lib/studio/save-client";
import type { SaveResult } from "@/lib/studio/save";

type PendingAction = { type: "navigate"; href: string } | { type: "reset" } | { type: "reload" };
interface DraftSession {
  canonical: StudioLessonInspection | null;
  draft: AuthoringLessonDraft | null;
  dirty: boolean;
  resetToken: number;
  saving: boolean;
  canSave: boolean;
  save: () => Promise<void>;
  saveResult: { result: SaveResult; fingerprint: string } | null;
  reload: () => void;
  keepDraft: () => void;
  update: (draft: AuthoringLessonDraft) => void;
  reset: () => void;
  requestNavigation: (href: string) => boolean;
}
const Context = createContext<DraftSession | null>(null);

export function StudioDraftSession({ inspection, children }: { inspection: StudioLessonInspection | null; children: ReactNode }) {
  const { t } = useI18n();
  const [source, setSource] = useState(inspection);
  const [lastInspection, setLastInspection] = useState(inspection);
  const [baseline, setBaseline] = useState(() => inspection ? toAuthoringDraft(inspection) : null);
  const [draft, setDraft] = useState(() => inspection ? toAuthoringDraft(inspection) : null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [shortcutNotice, setShortcutNotice] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ result: SaveResult; fingerprint: string } | null>(null);
  const busy = useRef(false);
  const baselineFingerprint = useMemo(() => baseline ? draftFingerprint(baseline) : null, [baseline]);
  const dirty = Boolean(draft && draftFingerprint(draft) !== baselineFingerprint);
  const allowUnload = useRef(false);

  // Server refresh/HMR must never overwrite a dirty draft. Normal selection uses
  // document links; new props can safely replace a clean selected session only.
  if (inspection !== lastInspection) {
    setLastInspection(inspection);
    if (!dirty && !saving) {
      setSource(inspection);
      setBaseline(inspection ? toAuthoringDraft(inspection) : null);
      setDraft(inspection ? toAuthoringDraft(inspection) : null);
      setSaveResult(null);
      setResetToken((value) => value + 1);
    }
  }

  const save = useCallback(async () => {
    if (busy.current || pending || !draft || !dirty) return;
    if (!source?.baseRevision) { setShortcutNotice(true); return; }
    busy.current = true; setSaving(true);
    const fingerprint = draftFingerprint(draft);
    try {
      const result = await saveStudioLesson(structuredClone(draft), source.baseRevision);
      setSaveResult({ result, fingerprint });
      if (result.status === "saved") {
        setSource(result.inspection);
        setBaseline(toAuthoringDraft(result.inspection));
        setDraft(toAuthoringDraft(result.inspection));
        setResetToken(v => v + 1);
      }
    } catch { setSaveResult({ result: { status: "failed", code: "SAVE_SERVICE_FAILED" }, fingerprint }); }
    finally { busy.current = false; setSaving(false); }
  }, [pending, draft, dirty, source]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (allowUnload.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [save]);

  function restore() { setDraft(source ? toAuthoringDraft(source) : null); setSaveResult(null); setResetToken((value) => value + 1); }
  function reset() { if (dirty && !busy.current) setPending({ type: "reset" }); }
  async function reloadNow() {
    if (!source || busy.current) return;
    busy.current = true; setSaving(true);
    try {
      const latest = await reloadStudioLesson(source.lesson.subjectId, source.lesson.id);
      setSource(latest); setBaseline(toAuthoringDraft(latest)); setDraft(toAuthoringDraft(latest)); setSaveResult(null); setResetToken(v => v + 1);
    } catch { setSaveResult({ result: { status: "failed", code: "RELOAD_FAILED" }, fingerprint: draft ? draftFingerprint(draft) : "" }); }
    finally { busy.current = false; setSaving(false); }
  }
  function requestNavigation(href: string) {
    if (busy.current) return true;
    if (!dirty) return false;
    setPending({ type: "navigate", href });
    return true;
  }
  function discard() {
    const action = pending;
    setPending(null);
    if (action?.type === "reload") { void reloadNow(); return; }
    restore();
    if (action?.type === "navigate") {
      allowUnload.current = true;
      navigateStudioDocument(action.href);
    }
  }
  return <Context.Provider value={{ canonical: source, draft, dirty, resetToken, saving, save, canSave: Boolean(source?.baseRevision && dirty && !saving && !pending), saveResult, reload: () => { if (dirty) setPending({ type: "reload" }); else void reloadNow(); }, keepDraft: () => setSaveResult(null), update: (value) => { if (busy.current) return; allowUnload.current = false; setDraft(value); }, reset, requestNavigation }}>
    {children}
    {shortcutNotice && <p className="studio-shortcut-notice" role="status">{t("studio.noSaveShortcut")} <button type="button" onClick={() => setShortcutNotice(false)}>{t("studio.dismiss")}</button></p>}
    {pending && <DiscardChangesDialog reset={pending.type === "reset"} onCancel={() => setPending(null)} onDiscard={discard} />}
  </Context.Provider>;
}

export function useStudioDraft() {
  const session = useContext(Context);
  if (!session) throw new Error("Studio editor requires its draft session");
  return session;
}

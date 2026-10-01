"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/components/locale-provider";
import { DiscardChangesDialog } from "@/components/studio/discard-changes-dialog";
import { draftFingerprint, toAuthoringDraft, type AuthoringLessonDraft } from "@/lib/studio/draft";
import { navigateStudioDocument } from "@/lib/studio/document-navigation";
import type { StudioLessonInspection } from "@/lib/studio/types";

type PendingAction = { type: "navigate"; href: string } | { type: "reset" };
interface DraftSession {
  draft: AuthoringLessonDraft | null;
  dirty: boolean;
  update: (draft: AuthoringLessonDraft) => void;
  reset: () => void;
  requestNavigation: (href: string) => boolean;
}
const Context = createContext<DraftSession | null>(null);

export function StudioDraftSession({ inspection, children }: { inspection: StudioLessonInspection | null; children: ReactNode }) {
  const { t } = useI18n();
  const [source, setSource] = useState(inspection);
  const [baseline, setBaseline] = useState(() => inspection ? toAuthoringDraft(inspection) : null);
  const [draft, setDraft] = useState(() => inspection ? toAuthoringDraft(inspection) : null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [shortcutNotice, setShortcutNotice] = useState(false);
  const baselineFingerprint = useMemo(() => baseline ? draftFingerprint(baseline) : null, [baseline]);
  const dirty = Boolean(draft && draftFingerprint(draft) !== baselineFingerprint);
  const allowUnload = useRef(false);

  // Server refresh/HMR must never overwrite a dirty draft. Normal selection uses
  // document links; new props can safely replace a clean selected session only.
  if (inspection !== source && !dirty) {
    setSource(inspection);
    setBaseline(inspection ? toAuthoringDraft(inspection) : null);
    setDraft(inspection ? toAuthoringDraft(inspection) : null);
  }

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
        setShortcutNotice(true);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  function restore() { setDraft(source ? toAuthoringDraft(source) : null); }
  function reset() { if (dirty) setPending({ type: "reset" }); }
  function requestNavigation(href: string) {
    if (!dirty) return false;
    setPending({ type: "navigate", href });
    return true;
  }
  function discard() {
    const action = pending;
    setPending(null);
    restore();
    if (action?.type === "navigate") {
      allowUnload.current = true;
      navigateStudioDocument(action.href);
    }
  }
  return <Context.Provider value={{ draft, dirty, update: (value) => { allowUnload.current = false; setDraft(value); }, reset, requestNavigation }}>
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

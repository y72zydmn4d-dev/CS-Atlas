"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/components/locale-provider";

/** Native modal supplies focus trapping, Escape, inert background and focus return. */
export function DiscardChangesDialog({ reset = false, onCancel, onDiscard }: {
  reset?: boolean; onCancel: () => void; onDiscard: () => void;
}) {
  const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const node = dialog.current;
    const previousFocus = document.activeElement;
    node?.showModal();
    cancel.current?.focus();
    return () => { node?.close(); if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus(); };
  }, []);
  return <dialog ref={dialog} className="studio-discard-dialog" aria-labelledby="studio-discard-title" aria-describedby="studio-discard-description"
    onCancel={(event) => { event.preventDefault(); onCancel(); }}>
    <h2 id="studio-discard-title">{t(reset ? "studio.resetTitle" : "studio.discardTitle")}</h2>
    <p id="studio-discard-description">{t("studio.discardDescription")}</p>
    <div className="studio-actions">
      <button type="button" ref={cancel} onClick={onCancel}>{t("studio.cancel")}</button>
      <button type="button" onClick={onDiscard}>{t(reset ? "studio.resetDraft" : "studio.discardContinue")}</button>
    </div>
  </dialog>;
}

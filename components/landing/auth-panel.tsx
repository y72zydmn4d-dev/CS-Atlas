"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { useI18n } from "@/components/locale-provider";
import { LocalDataDisclosure } from "./local-data-disclosure";

const modes = ["signIn", "create"] as const;
type AuthMode = typeof modes[number];

/** Unavailable capability: no credential fields, providers, sessions or fake submit. */
export function AuthPanel() {
  const { t } = useI18n();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [focusedMode, setFocusedMode] = useState<AuthMode>("signIn");
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : event.key === "ArrowRight" ? (index + 1) % 2 : event.key === "ArrowLeft" ? (index + 1) % 2 : null;
    if (next === null) return;
    event.preventDefault();
    tabs.current[next]?.focus();
  }
  return <section className="landing-auth" aria-labelledby="entry-title" data-auth-capability="unavailable">
    <h2 id="entry-title">{t("landing.enter")}</h2>
    <p className="landing-auth-subtitle">{t("landing.subtitle")}</p>
    <div className="landing-auth-tabs" role="tablist" aria-label={t("landing.modes")}>
      {modes.map((item, index) => <button key={item} ref={(element) => { tabs.current[index] = element; }} type="button" role="tab" id={`auth-tab-${item}`} aria-selected={mode === item} aria-controls={`auth-panel-${item}`} tabIndex={focusedMode === item ? 0 : -1} onFocus={() => setFocusedMode(item)} onKeyDown={(event) => moveFocus(event, index)} onClick={() => setMode(item)}>{t(item === "signIn" ? "landing.signIn" : "landing.create")}</button>)}
    </div>
    <p className="landing-account-notice">{t("landing.unavailable")}</p>
    {modes.map((item) => <div key={item} role="tabpanel" id={`auth-panel-${item}`} aria-labelledby={`auth-tab-${item}`} hidden={item !== mode} tabIndex={0} className="landing-mode-content"><p>{t(item === "signIn" ? "landing.signInDetail" : "landing.createDetail")}</p></div>)}
    <Link className="landing-guest" href="/home" prefetch={false}>{t("landing.guest")}<ArrowRight size={18} aria-hidden="true" /></Link>
    <p className="landing-local-scope">{t("landing.scope")}</p>
    <LocalDataDisclosure />
    <Link className="landing-mobile-browse" href="/learn" prefetch={false}>{t("landing.browse")}</Link>
  </section>;
}

"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/components/locale-provider";
import { useTheme } from "@/components/theme-provider";

export function LandingHeader() {
  const { t } = useI18n();
  const { theme, toggle } = useTheme();
  return <>
    <a className="skip-link" href="#main-content">{t("navigation.skip")}</a>
    <header className="landing-header">
      <Link className="landing-brand" href="/" aria-label="CS Atlas"><span className="landing-brand-mark" aria-hidden="true">CA</span><strong>CS Atlas</strong></Link>
      <nav className="landing-header-nav" aria-label={t("navigation.learn")}><Link href="/learn" prefetch={false}>{t("landing.browse")}</Link></nav>
      <div className="landing-tools"><LanguageSwitcher /><button className="landing-icon-button" onClick={toggle} aria-label={t(theme === "dark" ? "theme.light" : "theme.dark")}><span aria-hidden="true">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</span></button></div>
    </header>
  </>;
}

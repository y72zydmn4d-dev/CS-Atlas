"use client";

import { useI18n } from "@/components/locale-provider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className="language-switcher" role="group" aria-label={t("language.label")}>
      <button type="button" className={locale === "en" ? "active" : ""} aria-pressed={locale === "en"} onClick={() => setLocale("en")} title={t("language.english")}>EN</button>
      <span aria-hidden="true">/</span>
      <button type="button" className={locale === "vi" ? "active" : ""} aria-pressed={locale === "vi"} onClick={() => setLocale("vi")} title={t("language.vietnamese")}>{compact ? "VI" : "VI"}</button>
    </div>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/components/locale-provider";

export function StudioUtilities() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  return <div className="studio-utilities">
    <LanguageSwitcher compact />
    <button type="button" className="icon-button" onClick={toggle} aria-label={t(theme === "dark" ? "theme.light" : "theme.dark")} title={t(theme === "dark" ? "theme.light" : "theme.dark")}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
  </div>;
}

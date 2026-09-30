import type { Locale } from "@/lib/types";

// The preference-only leaf of the storage adapter. Keep legacy keys/encoding.
// Public providers must not import learning migrations merely to read a theme.
const preferenceKeys = { theme: "cs-atlas.theme.v1", locale: "cs-atlas.locale.v1" } as const;

export const browserPreferences = {
  loadTheme(): "light" | "dark" | null {
    if (typeof window === "undefined") return null;
    try {
      const value = window.localStorage.getItem(preferenceKeys.theme);
      return value === "light" || value === "dark" ? value : null;
    } catch { return null; }
  },
  saveTheme(value: "light" | "dark") {
    try { if (typeof window !== "undefined") window.localStorage.setItem(preferenceKeys.theme, value); } catch { /* Retain in-memory preference when persistence is unavailable. */ }
  },
  loadLocale(): Locale {
    if (typeof window === "undefined") return "en";
    try {
      const value = window.localStorage.getItem(preferenceKeys.locale);
      return value === "vi" || value === "en" ? value : "en";
    } catch { return "en"; }
  },
  saveLocale(value: Locale) {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(preferenceKeys.locale, value); } catch { /* Storage may be restricted. */ }
  },
};

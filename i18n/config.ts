import type { Locale } from "@/lib/types";

export const locales = ["en", "vi"] as const satisfies readonly Locale[];
export const defaultLocale: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "vi";
}

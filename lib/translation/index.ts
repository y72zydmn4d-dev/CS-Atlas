import { CuratedTranslationProvider } from "@/lib/translation/curated";
import { BrowserTranslationProvider, GlossaryTranslationProvider } from "@/lib/translation/providers";
import type { TranslationContext, TranslationResult } from "@/lib/translation/types";

export type { TranslationResult, TranslationProvider, TranslationSource } from "@/lib/translation/types";

const providers = [CuratedTranslationProvider, GlossaryTranslationProvider, BrowserTranslationProvider];

export async function translateSelection(text: string, context: TranslationContext = {}): Promise<TranslationResult> {
  void context;
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean || clean.length > 500) return { text: "", source: "unavailable" };
  for (const provider of providers) {
    if (!(await provider.canTranslate("en", "vi"))) continue;
    const result = await provider.translate(clean, "en", "vi");
    if (result) return result;
  }
  return { text: "", source: "unavailable" };
}

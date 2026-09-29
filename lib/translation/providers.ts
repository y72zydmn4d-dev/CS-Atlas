import type { Locale } from "@/lib/types";
import { findGlossaryTerm } from "@/content/bilingual-glossary";
import type { TranslationProvider, TranslationResult } from "@/lib/translation/types";

export const GlossaryTranslationProvider: TranslationProvider = {
  async canTranslate(source, target) { return source === "en" && target === "vi"; },
  async translate(text, source, target): Promise<TranslationResult | null> {
    if (source !== "en" || target !== "vi") return null;
    const item = findGlossaryTerm(text);
    return item ? { text: `${item.vi} (${item.en})`, definition: item.definitionVi, source: "glossary" } : null;
  },
};

interface BrowserTranslatorInstance { translate(text: string): Promise<string>; destroy?: () => void }
interface BrowserTranslatorFactory {
  availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<string>;
  create(options: { sourceLanguage: string; targetLanguage: string }): Promise<BrowserTranslatorInstance>;
}

function translatorFactory(): BrowserTranslatorFactory | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Translator?: BrowserTranslatorFactory }).Translator;
}

export const BrowserTranslationProvider: TranslationProvider = {
  async canTranslate(source: Locale, target: Locale) {
    const factory = translatorFactory();
    if (!factory) return false;
    try { return (await factory.availability({ sourceLanguage: source, targetLanguage: target })) !== "unavailable"; } catch { return false; }
  },
  async translate(text, source, target): Promise<TranslationResult | null> {
    const factory = translatorFactory();
    if (!factory) return null;
    let translator: BrowserTranslatorInstance | undefined;
    try {
      translator = await factory.create({ sourceLanguage: source, targetLanguage: target });
      const translated = await translator.translate(text);
      return translated.trim() ? { text: translated.trim(), source: "browser" } : null;
    } catch { return null; } finally { translator?.destroy?.(); }
  },
};

import type { Locale } from "@/lib/types";

export type TranslationSource = "curated" | "glossary" | "browser" | "unavailable";

export interface TranslationResult {
  text: string;
  source: TranslationSource;
  definition?: string;
}

export interface TranslationProvider {
  canTranslate(source: Locale, target: Locale): Promise<boolean>;
  translate(text: string, source: Locale, target: Locale): Promise<TranslationResult | null>;
}

export interface TranslationContext {
  topicId?: string;
  blockId?: string;
}

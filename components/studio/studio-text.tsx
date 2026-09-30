"use client";

import { useI18n } from "@/components/locale-provider";
import type { LocalizedConceptText } from "@/lib/domain/concepts";

export function StudioText({ value }: { value: LocalizedConceptText }) {
  const { locale } = useI18n();
  return <>{value[locale] || value.en}</>;
}

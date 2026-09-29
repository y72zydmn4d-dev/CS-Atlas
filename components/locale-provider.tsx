"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/types";
import { storage } from "@/lib/storage";
import { getMessage, type MessageKey, type MessageValues } from "@/i18n/get-message";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, values?: MessageValues) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = storage.loadLocale();
    // Browser persistence becomes available only after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(stored);
    document.documentElement.lang = stored;
    document.documentElement.dataset.locale = stored;
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    storage.saveLocale(next);
    document.documentElement.lang = next;
    document.documentElement.dataset.locale = next;
  }, []);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale,
    t: (key, values) => getMessage(locale, key, values),
  }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useI18n must be used inside LocaleProvider");
  return value;
}

export function Message({ k, values }: { k: MessageKey; values?: MessageValues }) {
  const { t } = useI18n();
  return <>{t(k, values)}</>;
}

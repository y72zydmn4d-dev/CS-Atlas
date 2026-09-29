"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "@/lib/storage";

const ThemeContext = createContext({ theme: "dark" as "light" | "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const saved = storage.loadTheme();
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = saved ?? preferred;
    // Theme preference is browser-only and can only be reconciled after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);
  const toggle = () => setTheme((current) => {
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    storage.saveTheme(next);
    return next;
  });
  return <ThemeContext.Provider value={useMemo(() => ({ theme, toggle }), [theme])}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

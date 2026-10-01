"use client";

import Link from "next/link";
import { createContext, useContext, type ReactNode } from "react";
import { useI18n } from "@/components/locale-provider";
import type { Locale } from "@/lib/types";

export type LearnRenderMode = "learner" | "author-preview";
const Environment = createContext<{ mode: LearnRenderMode; locale?: Locale }>({ mode: "learner" });

export function LearnRenderEnvironment({ mode, locale, children }: { mode: LearnRenderMode; locale: Locale; children: ReactNode }) {
  return <Environment.Provider value={{ mode, locale }}>{children}</Environment.Provider>;
}
export function useLearnRenderEnvironment() {
  const environment = useContext(Environment);
  const { locale } = useI18n();
  return { mode: environment.mode, locale: environment.locale ?? locale };
}
export function LessonLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const { mode, locale } = useLearnRenderEnvironment();
  return mode === "author-preview"
    ? <a href={href} className={className} target="_blank" rel="noopener noreferrer" title={locale === "vi" ? "Mở bản chuẩn trong tab mới" : "Open canonical content in a new tab"}>{children}</a>
    : <Link href={href} className={className}>{children}</Link>;
}

"use client";

import type { Domain } from "@/lib/types";
import { useI18n } from "@/components/locale-provider";
import { localizeDomain } from "@/i18n/content";

export function DomainSubpageHeader({ domain, page }: { domain: Domain; page: "roadmap" | "mindmap" | "syllabus" }) {
  const { locale, t } = useI18n();
  const localized = localizeDomain(domain, locale);
  const kicker = page === "roadmap" ? "domainPage.roadmapKicker" : page === "mindmap" ? "domainPage.mindmapKicker" : "domainPage.syllabusKicker";
  const title = page === "roadmap" ? "domainPage.roadmapTitle" : page === "mindmap" ? "domainPage.mindmapTitle" : "domainPage.syllabusTitle";
  const lede = page === "roadmap" ? "domainPage.roadmapLede" : page === "mindmap" ? "domainPage.mindmapLede" : "domainPage.syllabusLede";
  return <header className="page-header"><div><p className="kicker">{t(kicker)}</p><h1>{t(title, { domain: localized.name })}</h1><p className="lede">{t(lede)}</p></div></header>;
}

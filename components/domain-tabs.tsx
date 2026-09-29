"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/locale-provider";

export function DomainTabs({ slug, active }: { slug: string; active: "overview" | "syllabus" | "roadmap" | "mindmap" }) {
  const { t } = useI18n();
  const items = [["overview", t("common.overview"), `/domains/${slug}`], ["syllabus", t("common.syllabus"), `/domains/${slug}/syllabus`], ["roadmap", t("common.roadmap"), `/domains/${slug}/roadmap`], ["mindmap", t("common.mindMap"), `/domains/${slug}/mindmap`]] as const;
  return <nav className="tabs" aria-label={t("common.domainSections")}>{items.map(([id, label, href]) => <Link key={id} href={href} aria-current={active === id ? "page" : undefined} className={cn("tab", active === id && "active")}>{label}</Link>)}</nav>;
}

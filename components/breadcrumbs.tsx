"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import { localizedLabel } from "@/i18n/content";
import type { MessageKey } from "@/i18n/get-message";

const sectionLabels: Record<string, MessageKey> = { Home: "navigation.home", Domains: "navigation.domains", Algorithms: "navigation.algorithms", Techniques: "navigation.techniques", Projects: "navigation.projects", Syllabus: "common.syllabus", Roadmap: "common.roadmap", Roadmaps: "navigation.roadmaps", "Mind Maps": "navigation.mindMaps", "Mind Map": "common.mindMap", "Mind map": "common.mindMap", Library: "navigation.library", Import: "library.importTitle", Settings: "navigation.settings", "AI Assistant": "navigation.assistant" };

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  const { locale, t } = useI18n();
  return <nav className="breadcrumbs" aria-label={t("workspace.breadcrumb")}>{items.map((item, index) => { const label = sectionLabels[item.label] ? t(sectionLabels[item.label]) : localizedLabel(item.label, locale); return <span key={`${item.label}-${index}`} style={{ display: "contents" }}>{index > 0 && <ChevronRight size={12} aria-hidden />}{item.href ? <Link href={item.href}>{label}</Link> : <span aria-current="page">{label}</span>}</span>; })}</nav>;
}

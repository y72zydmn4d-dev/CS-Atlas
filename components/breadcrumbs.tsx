"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import { localizedLabel } from "@/i18n/content";
import { breadcrumbMessageKey } from "@/lib/routes";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  const { locale, t } = useI18n();
  return <nav className="breadcrumbs" aria-label={t("workspace.breadcrumb")}>{items.map((item, index) => { const key = breadcrumbMessageKey(item.label); const label = key ? t(key) : localizedLabel(item.label, locale); const href = item.label === "Home" && item.href === "/" ? "/home" : item.href; return <span key={`${item.label}-${index}`} style={{ display: "contents" }}>{index > 0 && <ChevronRight size={12} aria-hidden />}{href ? <Link href={href}>{label}</Link> : <span aria-current="page">{label}</span>}</span>; })}</nav>;
}

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/locale-provider";

export interface TocItem { id: string; label: string }

export function TableOfContents({ items }: { items: TocItem[] }) {
  const { t } = useI18n();
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.id)).filter((element): element is HTMLElement => Boolean(element));
    if (!sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveId(visible[0].target.id);
    }, { rootMargin: "-12% 0px -68% 0px", threshold: [0, 0.2, 0.75] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return <nav className="toc" aria-label={t("common.onThisPage")}>{items.map((item) => <a className={cn(activeId === item.id && "active")} aria-current={activeId === item.id ? "location" : undefined} href={`#${item.id}`} key={item.id}>{item.label}</a>)}</nav>;
}

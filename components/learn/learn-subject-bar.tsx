"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useI18n } from "@/components/locale-provider";
import type { LearnContentStatus, SubjectCategory } from "@/lib/domain/learn-platform";
import type { LocalizedConceptText } from "@/lib/domain/concepts";

export interface LearnSubjectNavigationItem {
  id: string;
  slug: string;
  title: LocalizedConceptText;
  category: SubjectCategory;
  status: LearnContentStatus;
  navigationOrder: number;
}

export function getActiveLearnSubjectSlug(pathname: string, subjects: LearnSubjectNavigationItem[]) {
  const candidate = pathname.split("/").filter(Boolean)[1];
  return subjects.some((subject) => subject.slug === candidate) ? candidate : undefined;
}

export function LearnSubjectBar({ subjects }: { subjects: LearnSubjectNavigationItem[] }) {
  const pathname = usePathname();
  const { locale } = useI18n();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeSlug = getActiveLearnSubjectSlug(pathname, subjects);

  useEffect(() => {
    const activeLink = scrollRef.current?.querySelector<HTMLElement>('a[aria-current="page"]');
    if (typeof activeLink?.scrollIntoView === "function") activeLink.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeSlug]);

  function moveFocus(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a[href]"));
    const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (currentIndex < 0) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : event.key === "ArrowRight" ? Math.min(currentIndex + 1, links.length - 1) : Math.max(currentIndex - 1, 0);
    links[nextIndex]?.focus();
  }

  return <nav className="learn-subject-bar" aria-label={locale === "vi" ? "Môn học trong Learn" : "Learn subjects"}>
    <Link className="learn-subject-bar-home" href="/learn" aria-current={pathname === "/learn" ? "page" : undefined}>Learn</Link>
    <div ref={scrollRef} className="learn-subject-bar-scroll" onKeyDown={moveFocus}>
      {subjects.map((subject) => <Link
        key={subject.id}
        href={`/learn/${subject.slug}`}
        aria-current={activeSlug === subject.slug ? "page" : undefined}
        data-category={subject.category}
        title={subject.title[locale]}
      >{subject.title[locale]}</Link>)}
    </div>
  </nav>;
}

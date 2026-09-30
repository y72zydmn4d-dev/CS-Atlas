"use client";

import Link from "next/link";
import { CheckCircle2, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAtlas } from "@/components/atlas-provider";
import { useI18n } from "@/components/locale-provider";
import type { SubjectManifest } from "@/lib/domain/learn-platform";
import { storage } from "@/lib/storage";

export type LearnSubjectView = "home" | "exercises" | "examples" | "quiz" | "reference";

const subjectViews: Array<{ id: Exclude<LearnSubjectView, "home">; label: string }> = [
  { id: "exercises", label: "Exercises" },
  { id: "examples", label: "Examples" },
  { id: "quiz", label: "Quiz" },
  { id: "reference", label: "Reference" },
];

function defaultCollapsedSections(subject: SubjectManifest, activeLessonId?: string) {
  const activeSectionId = subject.sections.find((section) => section.lessons.some((lesson) => lesson.id === activeLessonId))?.id ?? subject.sections[0]?.id;
  return new Set(subject.sections.filter((section) => section.id !== activeSectionId).map((section) => section.id));
}

export function SubjectCurriculumSidebar({
  subject,
  activeLessonId,
  activeView,
  open,
  onClose,
  panelRef,
  closeButtonRef,
}: {
  subject: SubjectManifest;
  activeLessonId?: string;
  activeView?: LearnSubjectView;
  open: boolean;
  onClose: () => void;
  panelRef: React.RefObject<HTMLElement | null>;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { locale } = useI18n();
  const atlas = useAtlas();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(() => defaultCollapsedSections(subject, activeLessonId));
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeSectionId = subject.sections.find((section) => section.lessons.some((lesson) => lesson.id === activeLessonId))?.id;
  const completed = useMemo(() => new Set(atlas.learningEvents.filter((event) => event.type === "lesson-completed" && event.target?.type === "lesson").map((event) => event.target?.id)), [atlas.learningEvents]);

  useEffect(() => {
    const saved = storage.loadLearnNavigation(subject.id);
    const nextCollapsed = saved.hasStoredState ? new Set(saved.collapsedSectionIds) : defaultCollapsedSections(subject, activeLessonId);
    if (activeSectionId) nextCollapsed.delete(activeSectionId);
    // Browser-only navigation state is applied after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(nextCollapsed);
    if (scrollRef.current) scrollRef.current.scrollTop = saved.scrollTop;
    const activeLink = scrollRef.current?.querySelector<HTMLElement>('a[aria-current="page"]');
    if (typeof activeLink?.scrollIntoView === "function") activeLink.scrollIntoView({ block: "nearest" });
  }, [activeLessonId, activeSectionId, subject]);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredSections = subject.sections
    .map((section) => ({ ...section, lessons: section.lessons.filter((lesson) => !normalizedQuery || `${lesson.title[locale]} ${lesson.description[locale]}`.toLocaleLowerCase().includes(normalizedQuery)) }))
    .filter((section) => section.lessons.length > 0);

  function toggleSection(id: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      storage.saveLearnNavigation(subject.id, { scrollTop: scrollRef.current?.scrollTop ?? 0, collapsedSectionIds: [...next] });
      return next;
    });
  }

  return <aside
    ref={panelRef}
    id="learn-curriculum-panel"
    className={`learn-workspace-curriculum ${open ? "is-open" : ""}`}
    aria-label={`${subject.title[locale]} curriculum`}
    aria-modal={open || undefined}
    role={open ? "dialog" : undefined}
  >
    <header>
      <div><Link href={`/learn/${subject.slug}`} onClick={onClose}>{subject.title[locale]} Tutorial</Link><span>{subject.sections.length} {locale === "vi" ? "phần" : "sections"}</span></div>
      <button ref={closeButtonRef} className="icon-button learn-drawer-close" type="button" aria-label={locale === "vi" ? "Đóng chương trình" : "Close curriculum"} onClick={onClose}><X size={17} /></button>
    </header>
    <label className="learn-curriculum-search"><Search size={14} /><span className="sr-only">{locale === "vi" ? "Lọc chương trình" : "Filter curriculum"}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "vi" ? "Lọc chương trình..." : "Filter curriculum..."} /></label>
    <nav className="learn-subject-local-nav" aria-label={locale === "vi" ? "Khu vực môn học" : "Subject areas"}>
      <Link className={activeView === "home" ? "active" : ""} aria-current={activeView === "home" ? "page" : undefined} href={`/learn/${subject.slug}`} onClick={onClose}>{locale === "vi" ? "Trang hướng dẫn" : "Tutorial home"}</Link>
      {subjectViews.map((view) => <Link key={view.id} className={activeView === view.id ? "active" : ""} aria-current={activeView === view.id ? "page" : undefined} href={`/learn/${subject.slug}/${view.id}`} onClick={onClose}>{view.label}</Link>)}
    </nav>
    <div ref={scrollRef} className="learn-curriculum-scroll" onScroll={(event) => storage.saveLearnNavigation(subject.id, { scrollTop: event.currentTarget.scrollTop, collapsedSectionIds: [...collapsed] })}>
      {filteredSections.map((section) => {
        const expanded = Boolean(normalizedQuery) || !collapsed.has(section.id);
        return <section key={section.id}>
          <button type="button" aria-expanded={expanded} onClick={() => toggleSection(section.id)}><span>{section.title[locale]}</span><ChevronDown size={14} /></button>
          {expanded && <ol>{section.lessons.map((lesson) => {
            const active = lesson.id === activeLessonId;
            return <li key={lesson.id}><Link className={active ? "active" : ""} aria-current={active ? "page" : undefined} href={`/learn/${subject.slug}/${lesson.slug}`} onClick={onClose}><span>{completed.has(lesson.id) ? <CheckCircle2 size={13} aria-label="Completed" /> : lesson.order}</span><span>{lesson.title[locale]}</span></Link></li>;
          })}</ol>}
        </section>;
      })}
      {!filteredSections.length && <p className="learn-curriculum-empty">{locale === "vi" ? "Không tìm thấy bài học." : "No lessons match."}</p>}
    </div>
  </aside>;
}

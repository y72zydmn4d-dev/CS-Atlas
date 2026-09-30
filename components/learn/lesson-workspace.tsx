"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Bot, Check, CheckCircle2, ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAtlas } from "@/components/atlas-provider";
import { BookmarkButton } from "@/components/content-actions";
import { useI18n } from "@/components/locale-provider";
import { LessonBlockRenderer } from "@/components/learn/lesson-block-renderer";
import type { LearnLessonContent, LessonManifest, SubjectManifest } from "@/lib/domain/learn-platform";
import { flattenSubjectLessons } from "@/lib/domain/learn-platform";
import { storage } from "@/lib/storage";

export function LessonWorkspace({ subject, lesson, content }: { subject: SubjectManifest; lesson: LessonManifest; content?: LearnLessonContent }) {
  const { locale } = useI18n();
  const atlas = useAtlas();
  const lessons = useMemo(() => flattenSubjectLessons(subject), [subject]);
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const completed = new Set(atlas.learningEvents.filter((event) => event.type === "lesson-completed" && event.target?.type === "lesson").map((event) => event.target?.id));
  const isCompleted = completed.has(lesson.id);
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(subject.sections.filter((section) => section.id !== lesson.sectionId).map((section) => section.id)));
  const navRef = useRef<HTMLDivElement | null>(null);
  const drawerButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const saved = storage.loadLearnNavigation(subject.id);
    // Browser-only navigation state is applied after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(new Set(saved.hasStoredState ? saved.collapsedSectionIds : subject.sections.filter((section) => section.id !== lesson.sectionId).map((section) => section.id)));
    if (navRef.current) navRef.current.scrollTop = saved.scrollTop;
    const activeLink = navRef.current?.querySelector<HTMLElement>('a[aria-current="page"]');
    if (!saved.hasStoredState && typeof activeLink?.scrollIntoView === "function") activeLink.scrollIntoView({ block: "center" });
  }, [lesson.sectionId, subject.id, subject.sections]);

  useEffect(() => {
    if (!atlas.ready) return;
    const exists = atlas.learningEvents.some((event) => event.target?.type === "lesson" && event.target.id === lesson.id && (event.type === "lesson-started" || event.type === "lesson-completed"));
    if (!exists) atlas.recordLearningEvent({ type: "lesson-started", conceptId: lesson.conceptIds[0], source: "browser-local", sourceVersion: content?.version ?? 1, target: { type: "lesson", id: lesson.id } });
  }, [atlas, content?.version, lesson.conceptIds, lesson.id]);

  useEffect(() => {
    if (!drawerOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setDrawerOpen(false); drawerButtonRef.current?.focus(); } };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [drawerOpen]);

  const filteredSections = subject.sections.map((section) => ({ ...section, lessons: section.lessons.filter((item) => !query.trim() || item.title[locale].toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) })).filter((section) => section.lessons.length > 0);
  const toc = content?.blocks.filter((block) => block.type !== "heading" || block.level === 2).map((block) => ({ id: block.id, label: block.title?.[locale] ?? (block.type === "objectives" ? locale === "vi" ? "Mục tiêu" : "Objectives" : block.type.replaceAll("-", " ")) })) ?? [];

  function toggleSection(id: string) {
    setCollapsed((current) => {
      const nextSet = new Set(current);
      if (nextSet.has(id)) nextSet.delete(id);
      else nextSet.add(id);
      storage.saveLearnNavigation(subject.id, { scrollTop: navRef.current?.scrollTop ?? 0, collapsedSectionIds: [...nextSet] });
      return nextSet;
    });
  }
  function markComplete() {
    if (isCompleted) return;
    atlas.recordLearningEvent({ type: "lesson-completed", conceptId: lesson.conceptIds[0], source: "browser-local", sourceVersion: content?.version ?? 1, target: { type: "lesson", id: lesson.id } });
  }

  return <div className="learn-workspace-shell">
    <button ref={drawerButtonRef} className="learn-curriculum-trigger button-secondary" type="button" aria-expanded={drawerOpen} aria-controls="learn-curriculum-panel" onClick={() => setDrawerOpen(true)}><Menu size={16} />Curriculum</button>
    {drawerOpen && <button className="learn-drawer-backdrop" type="button" aria-label="Close curriculum" onClick={() => { setDrawerOpen(false); drawerButtonRef.current?.focus(); }} />}
    <aside id="learn-curriculum-panel" className={`learn-workspace-curriculum ${drawerOpen ? "is-open" : ""}`} aria-label={`${subject.title[locale]} curriculum`}>
      <header><div><Link href={`/learn/${subject.slug}`}>{subject.title[locale]}</Link><span>{subject.status}</span></div><button className="icon-button learn-drawer-close" type="button" aria-label="Close curriculum" onClick={() => { setDrawerOpen(false); drawerButtonRef.current?.focus(); }}><X size={17} /></button></header>
      <label className="learn-curriculum-search"><Search size={14} /><span className="sr-only">Filter curriculum</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "vi" ? "Lọc chương trình..." : "Filter curriculum..."} /></label>
      <Link className="learn-tutorial-home" href={`/learn/${subject.slug}`}><BookIcon />Tutorial home</Link>
      <div ref={navRef} className="learn-curriculum-scroll" onScroll={(event) => storage.saveLearnNavigation(subject.id, { scrollTop: event.currentTarget.scrollTop, collapsedSectionIds: [...collapsed] })}>
        {filteredSections.map((section) => <section key={section.id}><button type="button" aria-expanded={!collapsed.has(section.id)} onClick={() => toggleSection(section.id)}><span>{section.title[locale]}</span><ChevronDown size={14} /></button>{!collapsed.has(section.id) && <ol>{section.lessons.map((item) => <li key={item.id}><Link className={item.id === lesson.id ? "active" : ""} aria-current={item.id === lesson.id ? "page" : undefined} href={`/learn/${subject.slug}/${item.slug}`} onClick={() => setDrawerOpen(false)}><span>{completed.has(item.id) ? <CheckCircle2 size={13} /> : item.order}</span><span>{item.title[locale]}</span>{item.status === "SKELETON" && <small>S</small>}</Link></li>)}</ol>}</section>)}
      </div>
    </aside>

    <main className="learn-workspace-main">
      <nav className="learn-breadcrumb" aria-label="Breadcrumb"><Link href="/learn">Learn</Link><span>/</span><Link href={`/learn/${subject.slug}`}>{subject.title[locale]}</Link><span>/</span><span aria-current="page">{lesson.title[locale]}</span></nav>
      <article className="learn-lesson-article">
        <header className="learn-lesson-header"><p className="learn-section-label">{subject.title[locale]} · {subject.sections.find((section) => section.id === lesson.sectionId)?.title[locale]}</p><h1>{lesson.title[locale]}</h1><p>{content?.summary[locale] ?? lesson.description[locale]}</p><div className="doc-meta"><span className="chip">{lesson.difficulty}</span><span className={`chip learn-status status-${lesson.status.toLocaleLowerCase()}`}>{lesson.status}</span><span className="chip">≈ {lesson.estimatedMinutes} min</span></div><div className="learn-lesson-actions"><BookmarkButton bookmark={{ id: lesson.id, type: "lesson", title: lesson.title[locale], href: `/learn/${subject.slug}/${lesson.slug}`, context: subject.title[locale] }} /><button className="button-secondary" type="button" disabled={isCompleted} onClick={markComplete}>{isCompleted ? <CheckCircle2 size={15} /> : <Check size={15} />}{isCompleted ? "Completed" : "Mark complete"}</button></div></header>
        <LessonPager previous={previous} next={next} subject={subject} locale={locale} />
        {content ? <LessonBlockRenderer blocks={content.blocks} /> : <section className="learn-skeleton-note"><p className="learn-section-label">SKELETON</p><h2>{locale === "vi" ? "Bài học này chưa được biên soạn đầy đủ" : "This lesson is not fully authored yet"}</h2><p>{locale === "vi" ? "Mục này giữ vị trí và quan hệ trong chương trình, nhưng không giả vờ là nội dung hoàn chỉnh." : "This item preserves its curriculum position and relationships without pretending to be complete content."}</p>{lesson.conceptIds.map((conceptId) => <Link className="text-link" key={conceptId} href={`/concepts/${conceptId.replace(":", "-")}`}>Open canonical Concept <ArrowRight size={14} /></Link>)}</section>}
        <LessonPager previous={previous} next={next} subject={subject} locale={locale} />
      </article>
    </main>

    <aside className="learn-workspace-rail" aria-label="Lesson tools"><section><p className="learn-section-label">ON THIS PAGE</p>{toc.length ? <nav>{toc.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</nav> : <p>No authored sections yet.</p>}</section><section><p className="learn-section-label">CONCEPTS</p>{lesson.conceptIds.map((conceptId) => <Link key={conceptId} href={`/concepts/${conceptId.replace(":", "-")}`}>{conceptId.split(":")[1].replaceAll("-", " ")}</Link>)}</section>{lesson.problemIds.length > 0 && <section><p className="learn-section-label">RELATED PROBLEMS</p>{lesson.problemIds.map((id) => <Link key={id} href={`/problems/${id}`}>{id.replaceAll("-", " ")}</Link>)}</section>}<section><p className="learn-section-label">ATLAS AI</p><p>Send the canonical Concept as bounded public context.</p><Link className="button-secondary" href={`/assistant?concept=${encodeURIComponent(lesson.conceptIds[0])}`}><Bot size={15} />Ask Atlas AI</Link></section></aside>
  </div>;
}

function LessonPager({ previous, next, subject, locale }: { previous?: LessonManifest; next?: LessonManifest; subject: SubjectManifest; locale: "en" | "vi" }) {
  return <nav className="learn-lesson-pager" aria-label="Adjacent lessons">{previous ? <Link href={`/learn/${subject.slug}/${previous.slug}`}><ArrowLeft size={15} /><span><small>Previous</small><strong>{previous.title[locale]}</strong></span></Link> : <span />}{next && <Link href={`/learn/${subject.slug}/${next.slug}`}><span><small>Next</small><strong>{next.title[locale]}</strong></span><ArrowRight size={15} /></Link>}</nav>;
}

function BookIcon() { return <span aria-hidden="true">⌂</span>; }

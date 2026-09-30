"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Bot, Check, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useAtlas } from "@/components/atlas-provider";
import { BookmarkButton } from "@/components/content-actions";
import { useI18n } from "@/components/locale-provider";
import { LearnSubjectWorkspace } from "@/components/learn/learn-subject-workspace";
import { LessonBlockRenderer } from "@/components/learn/lesson-block-renderer";
import type { LearnLessonContent, LessonManifest, SubjectManifest } from "@/lib/domain/learn-platform";
import { flattenSubjectLessons } from "@/lib/domain/learn-platform";

export function LessonWorkspace({ subject, lesson, content }: { subject: SubjectManifest; lesson: LessonManifest; content?: LearnLessonContent }) {
  const { locale } = useI18n();
  const atlas = useAtlas();
  const lessons = useMemo(() => flattenSubjectLessons(subject), [subject]);
  const index = lessons.findIndex((item) => item.id === lesson.id);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const completed = new Set(atlas.learningEvents.filter((event) => event.type === "lesson-completed" && event.target?.type === "lesson").map((event) => event.target?.id));
  const isCompleted = completed.has(lesson.id);
  const toc = content?.blocks.filter((block) => block.type !== "heading" || block.level === 2).map((block) => ({ id: block.id, label: block.title?.[locale] ?? (block.type === "objectives" ? locale === "vi" ? "Mục tiêu" : "Objectives" : block.type.replaceAll("-", " ")) })) ?? [];

  useEffect(() => {
    if (!atlas.ready) return;
    const exists = atlas.learningEvents.some((event) => event.target?.type === "lesson" && event.target.id === lesson.id && (event.type === "lesson-started" || event.type === "lesson-completed"));
    if (!exists) atlas.recordLearningEvent({ type: "lesson-started", conceptId: lesson.conceptIds[0], source: "browser-local", sourceVersion: content?.version ?? 1, target: { type: "lesson", id: lesson.id } });
  }, [atlas, content?.version, lesson.conceptIds, lesson.id]);

  function markComplete() {
    if (isCompleted) return;
    atlas.recordLearningEvent({ type: "lesson-completed", conceptId: lesson.conceptIds[0], source: "browser-local", sourceVersion: content?.version ?? 1, target: { type: "lesson", id: lesson.id } });
  }

  const rightRail = <>
    <section><p className="learn-section-label">{locale === "vi" ? "TRÊN TRANG NÀY" : "ON THIS PAGE"}</p>{toc.length ? <nav>{toc.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</nav> : <p>{locale === "vi" ? "Chưa có mục nội dung hoàn chỉnh." : "No authored sections yet."}</p>}</section>
    <section><p className="learn-section-label">CONCEPTS</p>{lesson.conceptIds.map((conceptId) => <Link key={conceptId} href={`/concepts/${conceptId.replace(":", "-")}`}>{conceptId.split(":")[1].replaceAll("-", " ")}</Link>)}</section>
    {lesson.problemIds.length > 0 && <section><p className="learn-section-label">RELATED PROBLEMS</p>{lesson.problemIds.map((id) => <Link key={id} href={`/problems/${id}`}>{id.replaceAll("-", " ")}</Link>)}</section>}
    <section><p className="learn-section-label">ATLAS AI</p><p>{locale === "vi" ? "Gửi Concept chuẩn làm ngữ cảnh công khai có giới hạn." : "Send the canonical Concept as bounded public context."}</p><Link className="button-secondary" href={`/assistant?concept=${encodeURIComponent(lesson.conceptIds[0])}`}><Bot size={15} />{locale === "vi" ? "Hỏi Atlas AI" : "Ask Atlas AI"}</Link></section>
  </>;

  return <LearnSubjectWorkspace subject={subject} activeLessonId={lesson.id} rightRail={rightRail}>
    <nav className="learn-breadcrumb" aria-label="Breadcrumb"><Link href="/learn">Learn</Link><span>/</span><Link href={`/learn/${subject.slug}`}>{subject.title[locale]}</Link><span>/</span><span aria-current="page">{lesson.title[locale]}</span></nav>
    <article className="learn-lesson-article">
      <header className="learn-lesson-header"><p className="learn-section-label">{subject.title[locale]} · {subject.sections.find((section) => section.id === lesson.sectionId)?.title[locale]}</p><h1>{lesson.title[locale]}</h1><p>{content?.summary[locale] ?? lesson.description[locale]}</p><div className="doc-meta"><span className="chip">{lesson.difficulty}</span>{lesson.status !== "COMPLETE" && <span className={`chip learn-status status-${lesson.status.toLocaleLowerCase()}`}>{lesson.status}</span>}<span className="chip">≈ {lesson.estimatedMinutes} min</span></div><div className="learn-lesson-actions"><BookmarkButton bookmark={{ id: lesson.id, type: "lesson", title: lesson.title[locale], href: `/learn/${subject.slug}/${lesson.slug}`, context: subject.title[locale] }} /><button className="button-secondary" type="button" disabled={isCompleted} onClick={markComplete}>{isCompleted ? <CheckCircle2 size={15} /> : <Check size={15} />}{isCompleted ? locale === "vi" ? "Đã hoàn thành" : "Completed" : locale === "vi" ? "Đánh dấu hoàn thành" : "Mark complete"}</button></div></header>
      <LessonPager previous={previous} next={next} subject={subject} locale={locale} />
      {content ? <LessonBlockRenderer blocks={content.blocks} /> : <section className="learn-skeleton-note"><p className="learn-section-label">SKELETON</p><h2>{locale === "vi" ? "Bài học này chưa được biên soạn đầy đủ" : "This lesson is not fully authored yet"}</h2><p>{locale === "vi" ? "Mục này giữ vị trí và quan hệ trong chương trình, nhưng không giả vờ là nội dung hoàn chỉnh." : "This item preserves its curriculum position and relationships without pretending to be complete content."}</p>{lesson.conceptIds.map((conceptId) => <Link className="text-link" key={conceptId} href={`/concepts/${conceptId.replace(":", "-")}`}>Open canonical Concept <ArrowRight size={14} /></Link>)}</section>}
      <LessonPager previous={previous} next={next} subject={subject} locale={locale} />
    </article>
  </LearnSubjectWorkspace>;
}

function LessonPager({ previous, next, subject, locale }: { previous?: LessonManifest; next?: LessonManifest; subject: SubjectManifest; locale: "en" | "vi" }) {
  return <nav className="learn-lesson-pager" aria-label="Adjacent lessons">{previous ? <Link href={`/learn/${subject.slug}/${previous.slug}`}><ArrowLeft size={15} /><span><small>{locale === "vi" ? "Trước" : "Previous"}</small><strong>{previous.title[locale]}</strong></span></Link> : <span />}{next && <Link href={`/learn/${subject.slug}/${next.slug}`}><span><small>{locale === "vi" ? "Tiếp" : "Next"}</small><strong>{next.title[locale]}</strong></span><ArrowRight size={15} /></Link>}</nav>;
}

"use client";

import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { LessonBlockRenderer } from "@/components/learn/lesson-block-renderer";
import { LessonLink, useLearnRenderEnvironment } from "@/components/learn/learn-render-environment";
import type { LearnLessonContent, LessonManifest } from "@/lib/domain/learn-platform";
import { lessonText, type LessonRenderContext, type LessonRenderResources } from "@/lib/domain/learn-rendering";

/** The real learner article. No Atlas hook, evidence, bookmark or navigation persistence. */
export function LessonContentSurface({ lesson, content, context, resources, actions, pager }: {
  lesson: LessonManifest; content?: LearnLessonContent; context: LessonRenderContext;
  resources: LessonRenderResources; actions?: ReactNode; pager?: ReactNode;
}) {
  const { locale } = useLearnRenderEnvironment();
  return <article className="learn-lesson-article">
    <header className="learn-lesson-header"><p className="learn-section-label">{lessonText(context.subject.title, locale)} · {lessonText(context.section.title, locale)}</p><h1>{lessonText(lesson.title, locale)}</h1><p>{lessonText(content?.summary ?? lesson.description, locale)}</p><div className="doc-meta"><span className="chip">{lesson.difficulty}</span>{lesson.status !== "COMPLETE" && <span className={`chip learn-status status-${lesson.status.toLocaleLowerCase()}`}>{lesson.status}</span>}<span className="chip">≈ {lesson.estimatedMinutes} min</span></div>{actions && <div className="learn-lesson-actions">{actions}</div>}</header>
    {pager}
    {content ? <LessonBlockRenderer blocks={content.blocks} resources={resources} /> : <section className="learn-skeleton-note"><p className="learn-section-label">SKELETON</p><h2>{locale === "vi" ? "Bài học này chưa được biên soạn đầy đủ" : "This lesson is not fully authored yet"}</h2><p>{locale === "vi" ? "Mục này giữ vị trí và quan hệ trong chương trình, nhưng không giả vờ là nội dung hoàn chỉnh." : "This item preserves its curriculum position and relationships without pretending to be complete content."}</p>{lesson.conceptIds.map((conceptId) => <LessonLink className="text-link" key={conceptId} href={`/concepts/${conceptId.replace(":", "-")}`}>Open canonical Concept <ArrowRight size={14} /></LessonLink>)}</section>}
    {pager}
  </article>;
}

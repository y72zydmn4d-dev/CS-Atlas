"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Bot, ClipboardCheck, FileCode2, ListChecks, Table2 } from "lucide-react";
import { useAtlas } from "@/components/atlas-provider";
import { useI18n } from "@/components/locale-provider";
import { LearnSubjectWorkspace } from "@/components/learn/learn-subject-workspace";
import type { SubjectManifest } from "@/lib/domain/learn-platform";
import { flattenSubjectLessons } from "@/lib/domain/learn-platform";

export function SubjectHome({ subject }: { subject: SubjectManifest }) {
  const { locale } = useI18n();
  const atlas = useAtlas();
  const lessons = flattenSubjectLessons(subject);
  const authored = lessons.filter((lesson) => lesson.status === "COMPLETE");
  const completed = new Set(atlas.learningEvents.filter((event) => event.type === "lesson-completed" && event.target?.type === "lesson").map((event) => event.target?.id));
  const completedCount = lessons.filter((lesson) => completed.has(lesson.id)).length;
  const nextLesson = authored.find((lesson) => !completed.has(lesson.id)) ?? authored[0] ?? lessons[0];
  const progress = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;

  const rightRail = <>
    <section><p className="learn-section-label">{locale === "vi" ? "PHẠM VI HIỆN TẠI" : "CURRENT SCOPE"}</p><p>{authored.length} / {lessons.length} {locale === "vi" ? "bài học có nội dung Atlas đã được duyệt." : "lessons contain reviewed Atlas content."}</p>{subject.status !== "COMPLETE" && <span className={`learn-status status-${subject.status.toLocaleLowerCase()}`}>{subject.status}</span>}</section>
    <section><p className="learn-section-label">ATLAS</p><p>{subject.conceptIds.length} Concept · {subject.relatedRoadmapIds.length} roadmap · {subject.relatedProblemIds.length} Problems</p>{subject.relatedRoadmapIds.length > 0 && <Link href="/roadmaps">{locale === "vi" ? "Mở lộ trình" : "Open roadmaps"}</Link>}{subject.relatedProblemIds.length > 0 && <Link href="/problems">{locale === "vi" ? "Mở bài tập" : "Open problems"}</Link>}</section>
    <section><p className="learn-section-label">ATLAS AI</p><p>{locale === "vi" ? "Hỏi với ngữ cảnh Concept của môn học này." : "Ask with this subject's canonical Concept context."}</p><Link className="button-secondary" href={`/assistant?concept=${encodeURIComponent(subject.conceptIds[0])}`}><Bot size={15} />{locale === "vi" ? "Hỏi Atlas AI" : "Ask Atlas AI"}</Link></section>
  </>;

  return <LearnSubjectWorkspace subject={subject} activeView="home" rightRail={rightRail}>
    <nav className="learn-breadcrumb" aria-label="Breadcrumb"><Link href="/learn">Learn</Link><span>/</span><span aria-current="page">{subject.title[locale]}</span></nav>
    <div className="learn-subject-home">
      <header className="learn-subject-header">
        <div><p className="kicker">{subject.category.replaceAll("-", " ")}</p><h1>{subject.title[locale]}</h1><p className="lede">{subject.description[locale]}</p><div className="doc-meta"><span className="chip">{subject.sections.length} {locale === "vi" ? "phần" : "sections"}</span><span className="chip">{lessons.length} {locale === "vi" ? "bài học" : "lessons"}</span><span className="chip">{authored.length} {locale === "vi" ? "đã biên soạn" : "authored"}</span></div></div>
        {nextLesson && <div className="learn-subject-actions"><Link className="button-primary" href={`/learn/${subject.slug}/${nextLesson.slug}`}>{completedCount ? locale === "vi" ? "Tiếp tục học" : "Continue learning" : locale === "vi" ? "Bắt đầu hướng dẫn" : "Start tutorial"}<ArrowRight size={16} /></Link></div>}
      </header>

      <section className="learn-subject-progress" aria-label="Subject progress"><div><strong>{completedCount} / {lessons.length}</strong><span>{locale === "vi" ? "bài học hoàn thành trên thiết bị này" : "lessons completed on this device"}</span></div><div className="progress-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div><b>{progress}%</b></section>

      <nav className="learn-surface-nav" aria-label={`${subject.title.en} learning surfaces`}>
        <SurfaceLink href={nextLesson ? `/learn/${subject.slug}/${nextLesson.slug}` : `/learn/${subject.slug}`} icon={<BookOpen size={17} />} title="Tutorial" detail={`${lessons.length} lessons`} />
        <SurfaceLink href={`/learn/${subject.slug}/exercises`} icon={<ListChecks size={17} />} title="Exercises" detail={`${subject.exerciseGroups.reduce((sum, group) => sum + group.exerciseIds.length, 0)} linked`} />
        <SurfaceLink href={`/learn/${subject.slug}/examples`} icon={<FileCode2 size={17} />} title="Examples" detail="Authored examples" />
        <SurfaceLink href={`/learn/${subject.slug}/quiz`} icon={<ClipboardCheck size={17} />} title="Quiz" detail={`${subject.quizGroups.length} groups`} />
        <SurfaceLink href={`/learn/${subject.slug}/reference`} icon={<Table2 size={17} />} title="Reference" detail={`${subject.references.reduce((sum, group) => sum + group.referenceIds.length, 0)} entries`} />
      </nav>

      <section className="learn-curriculum-summary" aria-labelledby="curriculum-summary-title">
        <div className="learn-section-heading"><div><p className="learn-section-label">TUTORIAL</p><h2 id="curriculum-summary-title">{locale === "vi" ? "Tổng quan chương trình" : "Curriculum overview"}</h2></div><span>{lessons.length}</span></div>
        <p>{locale === "vi" ? "Dùng thanh chương trình bên trái để mở từng bài học. Các phần được thu gọn để giữ danh sách dài dễ sử dụng." : "Use the curriculum on the left to open lessons. Sections stay collapsible so long tutorials remain easy to scan."}</p>
        <ol>{subject.sections.map((section) => <li key={section.id}><span>{String(section.order).padStart(2, "0")}</span><strong>{section.title[locale]}</strong><small>{section.lessons.length} {locale === "vi" ? "bài" : "lessons"}</small></li>)}</ol>
      </section>
    </div>
  </LearnSubjectWorkspace>;
}

function SurfaceLink({ href, icon, title, detail }: { href: string; icon: React.ReactNode; title: string; detail: string }) {
  return <Link href={href}>{icon}<span><strong>{title}</strong><small>{detail}</small></span><ArrowRight size={14} /></Link>;
}

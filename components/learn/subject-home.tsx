"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Braces, CheckCircle2, ClipboardCheck, FileCode2, ListChecks, Route, Table2 } from "lucide-react";
import { useAtlas } from "@/components/atlas-provider";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/components/locale-provider";
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

  return <div className="page learn-subject-home">
    <Breadcrumbs items={[{ label: "Learn", href: "/learn" }, { label: subject.title[locale] }]} />
    <header className="learn-subject-header">
      <div><p className="kicker">{subject.category.replaceAll("-", " ")} · {subject.status}</p><h1>{subject.title[locale]}</h1><p className="lede">{subject.description[locale]}</p><div className="doc-meta"><span className="chip">{subject.sections.length} sections</span><span className="chip">{lessons.length} lessons</span><span className="chip">{authored.length} authored</span></div></div>
      <div className="learn-subject-actions"><Link className="button-primary" href={nextLesson ? `/learn/${subject.slug}/${nextLesson.slug}` : `/learn/${subject.slug}/tutorial`}>{completedCount ? locale === "vi" ? "Tiếp tục học" : "Continue learning" : locale === "vi" ? "Bắt đầu hướng dẫn" : "Start tutorial"}<ArrowRight size={16} /></Link><Link className="button-secondary" href={`/learn/${subject.slug}/tutorial`}><BookOpen size={15} />{locale === "vi" ? "Xem chương trình" : "View curriculum"}</Link></div>
    </header>

    <section className="learn-subject-progress" aria-label="Subject progress"><div><strong>{completedCount} / {lessons.length}</strong><span>{locale === "vi" ? "bài học hoàn thành trên thiết bị này" : "lessons completed on this device"}</span></div><div className="progress-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div><b>{progress}%</b></section>

    <nav className="learn-surface-nav" aria-label={`${subject.title.en} learning surfaces`}>
      <SurfaceLink href={`/learn/${subject.slug}/tutorial`} icon={<BookOpen size={17} />} title="Tutorial" detail={`${lessons.length} lessons`} />
      <SurfaceLink href={`/learn/${subject.slug}/exercises`} icon={<ListChecks size={17} />} title="Exercises" detail={`${subject.exerciseGroups.reduce((sum, group) => sum + group.exerciseIds.length, 0)} linked`} />
      <SurfaceLink href={`/learn/${subject.slug}/examples`} icon={<FileCode2 size={17} />} title="Examples" detail="Authored examples" />
      <SurfaceLink href={`/learn/${subject.slug}/quiz`} icon={<ClipboardCheck size={17} />} title="Quiz" detail={`${subject.quizGroups.length} groups`} />
      <SurfaceLink href={`/learn/${subject.slug}/reference`} icon={<Table2 size={17} />} title="Reference" detail={`${subject.references.reduce((sum, group) => sum + group.referenceIds.length, 0)} entries`} />
    </nav>

    <div className="learn-subject-layout">
      <section className="learn-curriculum-overview" aria-labelledby="curriculum-title"><div className="learn-section-heading"><div><p className="learn-section-label">TUTORIAL</p><h2 id="curriculum-title">{locale === "vi" ? "Chương trình học" : "Curriculum"}</h2></div><span>{lessons.length}</span></div>{subject.sections.map((section) => <section className="learn-section-list" id={section.id} key={section.id}><header><span>{String(section.order).padStart(2, "0")}</span><h3>{section.title[locale]}</h3><small>{section.lessons.length} lessons</small></header><ol>{section.lessons.map((lesson) => <li key={lesson.id}><Link href={`/learn/${subject.slug}/${lesson.slug}`} aria-label={`${lesson.title[locale]} · ${lesson.status}`}><span>{completed.has(lesson.id) ? <CheckCircle2 size={14} /> : String(lesson.order).padStart(2, "0")}</span><strong>{lesson.title[locale]}</strong><small>{lesson.estimatedMinutes} min</small><em className={`learn-status status-${lesson.status.toLocaleLowerCase()}`}>{lesson.status}</em></Link></li>)}</ol></section>)}</section>
      <aside className="learn-subject-aside"><section><h2><Braces size={16} />{locale === "vi" ? "Phạm vi hiện tại" : "Current scope"}</h2><p>{authored.length} of {lessons.length} lessons contain reviewed original Atlas content. Skeleton entries document the intended curriculum and are labelled honestly.</p></section><section><h2><Route size={16} />{locale === "vi" ? "Kết nối Atlas" : "Atlas connections"}</h2><ul><li>{subject.conceptIds.length} canonical Concept anchor</li><li>{subject.relatedRoadmapIds.length} related roadmap</li><li>{subject.relatedProblemIds.length} related Problems</li><li>{subject.references.length} reference categories</li></ul></section>{subject.relatedRoadmapIds.length > 0 && <Link className="text-link" href="/roadmaps">Open related roadmaps <ArrowRight size={14} /></Link>}{subject.relatedProblemIds.length > 0 && <Link className="text-link" href="/problems">Open related problems <ArrowRight size={14} /></Link>}</aside>
    </div>
  </div>;
}

function SurfaceLink({ href, icon, title, detail }: { href: string; icon: React.ReactNode; title: string; detail: string }) {
  return <Link href={href}>{icon}<span><strong>{title}</strong><small>{detail}</small></span><ArrowRight size={14} /></Link>;
}

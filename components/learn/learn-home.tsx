"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAtlas } from "@/components/atlas-provider";
import { useI18n } from "@/components/locale-provider";
import { learnLessonById, learnLessons, learnSubjects } from "@/content/learn/registry";
import type { SubjectCategory } from "@/lib/domain/learn-platform";

const categoryOrder: SubjectCategory[] = ["programming-languages", "web-development", "data-databases", "data-science", "ai-machine-learning", "computer-science", "developer-tools"];
const categoryLabels: Record<SubjectCategory, { en: string; vi: string }> = {
  "programming-languages": { en: "Programming languages", vi: "Ngôn ngữ lập trình" },
  "web-development": { en: "Web development", vi: "Phát triển web" },
  "data-databases": { en: "Data & databases", vi: "Dữ liệu & cơ sở dữ liệu" },
  "data-science": { en: "Data science", vi: "Khoa học dữ liệu" },
  "ai-machine-learning": { en: "AI & machine learning", vi: "AI & học máy" },
  "computer-science": { en: "Computer science", vi: "Khoa học máy tính" },
  "developer-tools": { en: "Developer tools", vi: "Công cụ phát triển" },
};
export function LearnHome() {
  const { locale } = useI18n();
  const atlas = useAtlas();
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase();
  const lessonMatches = useMemo(() => normalized ? learnLessons.filter((lesson) => `${lesson.title[locale]} ${lesson.description[locale]}`.toLocaleLowerCase().includes(normalized)).slice(0, 12) : [], [locale, normalized]);
  const visibleSubjects = useMemo(() => learnSubjects.filter((subject) => !normalized || `${subject.title[locale]} ${subject.description[locale]} ${subject.category}`.toLocaleLowerCase().includes(normalized) || subject.sections.some((section) => section.lessons.some((lesson) => `${lesson.title[locale]} ${lesson.description[locale]}`.toLocaleLowerCase().includes(normalized)))), [locale, normalized]);
  const recentLessonId = atlas.learningEvents.toReversed().find((event) => event.target?.type === "lesson")?.target?.id;
  const recentLesson = recentLessonId ? learnLessonById.get(recentLessonId) : undefined;
  const recentSubject = recentLesson ? learnSubjects.find((subject) => subject.id === recentLesson.subjectId) : undefined;

  return <div className="learn-home">
    <header className="learn-home-header">
      <p className="kicker">CS-ATLAS KNOWLEDGE &amp; TUTORIAL SYSTEM</p>
      <h1>{locale === "vi" ? "Học lập trình, khoa học máy tính, dữ liệu và AI." : "Learn programming, computer science, data and AI."}</h1>
      <p>{locale === "vi" ? "Khám phá hướng dẫn có cấu trúc, bài tập, ví dụ, tài liệu tham khảo và lộ trình được kết nối bởi Atlas." : "Explore structured tutorials, exercises, examples, references and guided paths connected by the Atlas."}</p>
      <label className="learn-search"><Search size={18} /><span className="sr-only">Search tutorials</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "vi" ? "Tìm hướng dẫn, khái niệm, tài liệu tham khảo..." : "Search tutorials, concepts, references..."} /></label>
    </header>

    {!normalized && <section className="learn-continue" aria-labelledby="continue-title">
      <div><p className="learn-section-label">{locale === "vi" ? "TIẾP TỤC HỌC" : "CONTINUE LEARNING"}</p><h2 id="continue-title">{recentLesson ? recentLesson.title[locale] : locale === "vi" ? "Bắt đầu với Python" : "Start with Python"}</h2><p>{recentLesson && recentSubject ? `${recentSubject.title[locale]} · ${recentLesson.estimatedMinutes} min` : locale === "vi" ? "Một lộ trình nền tảng, thực hành và rõ ràng." : "A foundational, practical and explicit learning path."}</p></div>
      <Link className="button-primary" href={recentLesson ? `/learn/${recentLesson.subjectId}/${recentLesson.slug}` : "/learn/python/introduction"}>{locale === "vi" ? "Tiếp tục" : "Continue"}<ArrowRight size={16} /></Link>
    </section>}

    {normalized && <section className="learn-search-results" aria-live="polite"><div className="learn-section-heading"><h2>{locale === "vi" ? "Kết quả bài học" : "Lesson results"}</h2><span>{lessonMatches.length}</span></div>{lessonMatches.length ? <ul>{lessonMatches.map((lesson) => <li key={lesson.id}><Link href={`/learn/${lesson.subjectId}/${lesson.slug}`}><span><strong>{lesson.title[locale]}</strong><small>{learnSubjects.find((subject) => subject.id === lesson.subjectId)?.title[locale]} · {lesson.status}</small></span><ArrowRight size={15} /></Link></li>)}</ul> : <p className="empty-state">{locale === "vi" ? "Không tìm thấy bài học phù hợp." : "No matching lessons found."}</p>}</section>}

    {categoryOrder.map((category) => {
      const subjects = visibleSubjects.filter((subject) => subject.category === category);
      if (!subjects.length) return null;
      return <section className="learn-directory-section" key={category}><div className="learn-section-heading"><div><p className="learn-section-label">{categoryLabels[category][locale]}</p><h2>{categoryLabels[category][locale]}</h2></div><span>{subjects.length}</span></div><div className="learn-subject-grid">{subjects.map((subject) => <SubjectTile key={subject.id} subject={subject} locale={locale} />)}</div></section>;
    })}

    {!normalized && <section className="learn-guided-strip"><div><p className="learn-section-label">{locale === "vi" ? "HỌC CÓ HƯỚNG DẪN" : "GUIDED LEARNING"}</p><h2>{locale === "vi" ? "Cần một trình tự thay vì tra cứu?" : "Need a sequence instead of a reference?"}</h2><p>{locale === "vi" ? "Roadmaps và kế hoạch học vẫn là chế độ học theo lộ trình của Atlas." : "Roadmaps and study plans remain Atlas's guided, sequential learning mode."}</p></div><div><Link className="button-secondary" href="/roadmaps">Roadmaps</Link><Link className="button-secondary" href="/progress">Study plans</Link></div></section>}
  </div>;
}

function SubjectTile({ subject, locale }: { subject: (typeof learnSubjects)[number]; locale: "en" | "vi" }) {
  const lessonCount = subject.sections.reduce((total, section) => total + section.lessons.length, 0);
  const authoredCount = subject.sections.reduce((total, section) => total + section.lessons.filter((lesson) => lesson.status === "COMPLETE").length, 0);
  return <Link className="learn-subject-tile" href={`/learn/${subject.slug}`}><span className="learn-subject-icon"><BookOpen size={16} /></span><span><strong>{subject.title[locale]}</strong><small><Clock3 size={11} />{lessonCount} lessons · {authoredCount} authored</small></span><span className={`learn-status status-${subject.status.toLocaleLowerCase()}`}>{subject.status}</span></Link>;
}

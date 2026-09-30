"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { learnContentStatuses } from "@/lib/domain/learn-platform";
import { matchesStudioQuery, studioHref } from "@/lib/studio/navigation";
import type { StudioCurriculum } from "@/lib/studio/types";

export function CurriculumExplorer({ curriculum, selectedLessonId }: { curriculum: StudioCurriculum | null; selectedLessonId?: string }) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sectionId, setSectionId] = useState("");
  const filtered = curriculum?.sections.filter((section) => !sectionId || section.id === sectionId).map((section) => ({
    ...section, lessons: section.lessons.filter((lesson) => (!status || lesson.status === status) && matchesStudioQuery(query, [lesson.title.en, lesson.title.vi, lesson.id, section.title.en, section.title.vi])),
  })).filter((section) => section.lessons.length) ?? [];
  const count = filtered.reduce((total, section) => total + section.lessons.length, 0);
  return <section className="studio-panel" aria-labelledby="studio-curriculum-title">
    <header className="studio-panel-header">
      <h2 id="studio-curriculum-title">{t("studio.curriculum")}</h2>
      {curriculum && <>
        <p>{curriculum.subject.title[locale] || curriculum.subject.title.en} · {curriculum.subject.lessonCount}</p>
        <label className="studio-field">{t("studio.searchCurriculum")}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className="studio-filter-row">
          <label className="studio-field">{t("studio.lessonStatus")}<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">{t("studio.allStatuses")}</option>{learnContentStatuses.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="studio-field">{t("studio.sectionFilter")}<select value={sectionId} onChange={(event) => setSectionId(event.target.value)}><option value="">{t("studio.allSections")}</option>{curriculum.sections.map((section) => <option key={section.id} value={section.id}>{section.title[locale] || section.title.en}</option>)}</select></label>
        </div>
        <p className="studio-filter-count" role="status">{t("studio.results", { count })}</p>
      </>}
    </header>
    {!curriculum ? <p className="studio-empty">{t("studio.chooseSubject")}</p> : <nav className="studio-curriculum-list" aria-label={t("studio.curriculum")}>
      {filtered.map((section, index) => <details key={section.id} className="studio-section" open={Boolean(query || status || sectionId || section.lessons.some((lesson) => lesson.id === selectedLessonId) || index === 0)}>
        <summary><span>{section.order}. {section.title[locale] || section.title.en}</span><small>{section.lessons.length}</small></summary>
        {section.lessons.map((lesson) => <Link key={lesson.id} className="studio-lesson-link" prefetch={false} href={studioHref(curriculum.subject.id, lesson.id)} aria-current={lesson.id === selectedLessonId ? "page" : undefined}>
          <span>{lesson.order}. {lesson.title[locale] || lesson.title.en}</span>{" "}<small className="studio-status" data-status={lesson.status}>{lesson.status}</small>
        </Link>)}
      </details>)}
      {!count && <p className="studio-empty" role="status">{t("studio.noLessons")}</p>}
    </nav>}
  </section>;
}

"use client";

import { StudioLink } from "@/components/studio/studio-link";
import { useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { learnContentStatuses } from "@/lib/domain/learn-platform";
import { matchesStudioQuery, studioHref } from "@/lib/studio/navigation";
import type { StudioSubjectSummary } from "@/lib/studio/types";

export function SubjectExplorer({ subjects, selectedSubjectId }: { subjects: StudioSubjectSummary[]; selectedSubjectId?: string }) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const filtered = subjects.filter((subject) => (!status || subject.status === status) && matchesStudioQuery(query, [subject.title.en, subject.title.vi, subject.id, subject.category]));
  return (
    <section className="studio-panel" aria-labelledby="studio-subjects-title">
      <header className="studio-panel-header">
        <h2 id="studio-subjects-title">{t("studio.subjectExplorer")}</h2>
        <label className="studio-field">{t("studio.searchSubjects")}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="studio-field">{t("studio.subjectStatus")}<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">{t("studio.allStatuses")}</option>{learnContentStatuses.map((value) => <option key={value}>{value}</option>)}</select></label>
      </header>
      <nav className="studio-subject-list" aria-label={t("studio.subjectExplorer")}>
        {filtered.map((subject) => <StudioLink className="studio-subject" key={subject.id} href={studioHref(subject.id)} aria-current={subject.id === selectedSubjectId ? "page" : undefined}>
          <strong>{subject.title[locale] || subject.title.en}</strong>{" "}
          <span className="studio-status" data-status={subject.status}>{subject.status}</span>{" "}
          <small>{subject.id} · {subject.category}</small>
          <small>{t("studio.subjectCounts", { sections: subject.sectionCount, lessons: subject.lessonCount, complete: subject.lessonStatuses.COMPLETE })}</small>
        </StudioLink>)}
        {!filtered.length && <p className="studio-empty" role="status">{t("studio.noSubjects")}</p>}
      </nav>
    </section>
  );
}

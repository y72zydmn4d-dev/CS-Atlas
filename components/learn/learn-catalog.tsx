"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { domains } from "@/content/domains";
import { lessons } from "@/content/lessons";
import { useI18n } from "@/components/locale-provider";
import { localizeDomain } from "@/i18n/content";

export function LearnCatalog() {
  const { locale, t } = useI18n();
  const [domainId, setDomainId] = useState("");
  const visibleLessons = useMemo(
    () => lessons.filter((lesson) => !domainId || domains.some((domain) => domain.id === domainId && domain.topicIds.includes(lesson.topicId))),
    [domainId],
  );

  return <div className="learn-catalog-layout">
    <aside className="learn-curriculum" aria-label={t("learn.curriculum")}>
      <label className="form-field" htmlFor="learn-domain-filter"><span>{t("learn.curriculum")}</span><select id="learn-domain-filter" value={domainId} onChange={(event) => setDomainId(event.target.value)}><option value="">{t("learn.allDomains")}</option>{domains.map((domain) => <option key={domain.id} value={domain.id}>{localizeDomain(domain, locale).name}</option>)}</select></label>
      <nav aria-label={t("learn.sequence")}><Link className={!domainId ? "active" : ""} href="/learn" onClick={() => setDomainId("")}>{t("learn.allDomains")}</Link>{domains.map((domain) => <button className={domain.id === domainId ? "active" : ""} type="button" key={domain.id} onClick={() => setDomainId(domain.id)}>{localizeDomain(domain, locale).shortName}<small>{domain.topicIds.length}</small></button>)}</nav>
    </aside>
    <section className="learn-lesson-list" aria-live="polite">
      <div className="section-heading compact"><div><p className="kicker">{t("learn.sequence")}</p><h2>{t("learn.lessons", { count: visibleLessons.length })}</h2></div></div>
      {visibleLessons.length ? <ol>{visibleLessons.map((lesson, index) => {
        const domain = domains.find((item) => item.topicIds.includes(lesson.topicId));
        return <li key={lesson.id}><Link href={lesson.href}><span className="learn-order">{String(index + 1).padStart(2, "0")}</span><span><small>{domain ? localizeDomain(domain, locale).shortName : "CS Atlas"} · {lesson.estimatedMinutes} {t("common.minutes")}</small><strong>{lesson.title[locale]}</strong><p>{lesson.summary[locale]}</p></span><span className="learn-open"><BookOpen size={16} />{t("learn.read")}<ArrowRight size={15} /></span></Link></li>;
      })}</ol> : <p className="empty-state">{t("learn.noLessons")}</p>}
    </section>
  </div>;
}

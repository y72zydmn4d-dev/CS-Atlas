"use client";
import Link from "next/link";
import { ArrowRight, Code2, FlaskConical, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { algorithms, domains, techniques, topics } from "@/content";
import { practiceProblems } from "@/content/practice/problems";
import { useI18n } from "@/components/locale-provider";
import { usePractice } from "@/hooks/use-practice";
import { localizeDomain, localizeTopic } from "@/i18n/content";
import { practiceStatus } from "@/lib/practice/progress";
import { searchContent } from "@/lib/search";

export function PracticeCatalog() {
  const { locale, t } = useI18n();
  const { state, ready, recovered } = usePractice();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ difficulty: "", domain: "", topic: "", algorithm: "", technique: "", status: "" });
  const results = useMemo(() => {
    const matches = new Set(query.trim() ? searchContent(query, practiceProblems.map((p) => ({ id: p.id, title: p.title.en, titleVi: p.title.vi, type: "Exercise", hierarchy: p.domainId, href: `/practice/${p.id}`, keywords: `${p.summary.en} ${p.summary.vi}` }))).map((item) => item.id) : practiceProblems.map((p) => p.id));
    return practiceProblems.filter((p) => matches.has(p.id) && (!filters.difficulty || filters.difficulty === p.difficulty) && (!filters.domain || filters.domain === p.domainId) && (!filters.topic || p.topicIds.includes(filters.topic)) && (!filters.algorithm || p.algorithmIds.includes(filters.algorithm)) && (!filters.technique || p.techniqueIds.includes(filters.technique)) && (!filters.status || filters.status === practiceStatus(p, state)));
  }, [filters, query, state]);
  const options = {
    difficulty: ["easy", "medium"].map((id) => ({ id, label: t(id === "easy" ? "practice.easy" : "practice.medium") })),
    domain: domains.filter((d) => practiceProblems.some((p) => p.domainId === d.id)).map((d) => ({ id: d.id, label: localizeDomain(d, locale).name })),
    topic: topics.filter((d) => practiceProblems.some((p) => p.topicIds.includes(d.id))).map((d) => ({ id: d.id, label: localizeTopic(d, locale).title })),
    algorithm: algorithms.filter((d) => practiceProblems.some((p) => p.algorithmIds.includes(d.id))).map((d) => ({ id: d.id, label: d.name })),
    technique: techniques.filter((d) => practiceProblems.some((p) => p.techniqueIds.includes(d.id))).map((d) => ({ id: d.id, label: d.name })),
    status: (["unattempted", "attempted", "passed"] as const).map((id) => ({ id, label: t(`practice.${id}`) })),
  };
  return <>
    <div className="practice-notice"><Code2 size={20} /><p>{t("practice.boundary")}</p></div>
    <section className="panel practice-filters" aria-label={t("practice.search")}>
      <label className="catalog-search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("practice.search")} aria-label={t("practice.search")} /></label>
      <div className="practice-filter-grid">{(Object.keys(filters) as Array<keyof typeof filters>).map((key) => <label className="form-field" key={key}><span>{t(`practice.${key}`)}</span><select value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}><option value="">{t("practice.all")}</option>{options[key].map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>)}</div>
    </section>
    {recovered && <p role="status" className="form-notice">{t("practice.recovered")}</p>}
    {!ready ? <p role="status">{t("practice.loading")}</p> : <div className="practice-catalog">{results.map((problem, index) => <Link className="panel practice-problem-card" key={problem.id} href={`/practice/${problem.id}`}><span className="practice-number">{String(index + 1).padStart(2, "0")}</span><div className="practice-card-copy"><div className="practice-card-meta"><span className="chip">{t(`practice.${problem.difficulty}`)}</span><span>{problem.kind === "ml" ? <FlaskConical size={15} /> : <Code2 size={15} />} {problem.kind === "ml" ? "ML" : "DSA"}</span></div><h2>{problem.title[locale]}</h2><p>{problem.summary[locale]}</p><small>{t("practice.tests", { count: problem.tests.length })} · {t(`practice.${practiceStatus(problem, state)}`)}</small></div><ArrowRight size={18} /></Link>)}{!results.length && <p className="empty-state">{t("practice.empty")}</p>}</div>}
  </>;
}

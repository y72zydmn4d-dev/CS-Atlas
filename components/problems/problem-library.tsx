"use client";

import Link from "next/link";
import { ArrowRight, CircleDot, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { problems } from "@/content/problems";
import { topicById } from "@/content";
import { practiceById } from "@/content/practice/problems";
import { useI18n } from "@/components/locale-provider";
import { usePractice } from "@/hooks/use-practice";
import { practiceStatus } from "@/lib/practice/progress";
import { canonicalConceptIdForTopic } from "@/content/concepts/registry";
import { matchesProblemCatalogFilters, type ProblemCatalogFilters } from "@/lib/problems/catalog";

type ProblemStatus = "solved" | "attempted" | "unsolved";

function statusForProblem(problemId: string, state: ReturnType<typeof usePractice>["state"]): ProblemStatus {
  const source = practiceById.get(problemId);
  if (!source) return "unsolved";
  const status = practiceStatus(source, state);
  return status === "passed" ? "solved" : status === "attempted" ? "attempted" : "unsolved";
}

export function ProblemLibrary() {
  const { locale, t } = useI18n();
  const { state, ready } = usePractice();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [topicId, setTopicId] = useState("");
  const [status, setStatus] = useState("");
  const [tag, setTag] = useState("");
  const [rating, setRating] = useState<ProblemCatalogFilters["rating"]>("");
  const [language, setLanguage] = useState<ProblemCatalogFilters["language"]>("");
  const topicIds = Array.from(new Set(problems.flatMap((problem) => practiceById.get(problem.id)?.topicIds ?? []))).sort();
  const tags = Array.from(new Set(problems.flatMap((problem) => problem.tags))).sort();
  const visible = useMemo(() => {
    return problems.filter((problem) => {
      const problemStatus = statusForProblem(problem.id, state);
      return matchesProblemCatalogFilters(problem, { query, difficulty: difficulty as ProblemCatalogFilters["difficulty"], conceptId: topicId ? canonicalConceptIdForTopic(topicId) : undefined, tag, rating, language }, locale)
        && (!status || status === problemStatus);
    });
  }, [difficulty, language, locale, query, rating, state, status, tag, topicId]);

  return <>
    <p className="judge-boundary" role="status">{t("problems.judgeUnavailable")}</p>
    <section className="problem-filters" aria-label={t("problems.title")}>
      <label className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("problems.search")} aria-label={t("problems.search")} /></label>
      <label className="form-field"><span>{t("problems.difficulty")}</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="">{t("problems.allDifficulties")}</option>{["easy", "medium", "hard"].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label className="form-field"><span>{t("problems.topics")}</span><select value={topicId} onChange={(event) => setTopicId(event.target.value)}><option value="">{t("problems.allTopics")}</option>{topicIds.map((id) => <option key={id} value={id}>{topicById.get(id)?.title ?? id}</option>)}</select></label>
      <label className="form-field"><span>{t("problems.status")}</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">{t("problems.allStatus")}</option><option value="solved">{t("problems.solved")}</option><option value="attempted">{t("problems.attempted")}</option><option value="unsolved">{t("problems.unsolved")}</option></select></label>
      <label className="form-field"><span>{t("problems.tags")}</span><select value={tag} onChange={(event) => setTag(event.target.value)}><option value="">{t("problems.allTags")}</option>{tags.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="form-field"><span>{t("problems.rating")}</span><select value={rating} onChange={(event) => setRating(event.target.value as ProblemCatalogFilters["rating"])}><option value="">{t("problems.allRatings")}</option><option value="under-1000">&lt; 1000</option><option value="1000-1399">1000–1399</option><option value="1400-plus">1400+</option></select></label>
      <label className="form-field"><span>{t("practice.language")}</span><select value={language} onChange={(event) => setLanguage(event.target.value as ProblemCatalogFilters["language"])}><option value="">{t("problems.allLanguages")}</option><option value="javascript">JavaScript · {t("problems.publicRuntime")}</option><option value="python">Python · {t("problems.editorOnly")}</option></select></label>
    </section>
    {!ready ? <p role="status">{t("practice.loading")}</p> : <div className="problem-table-wrap"><table className="problem-table"><thead><tr><th scope="col">{t("problems.status")}</th><th scope="col">{t("practice.title")}</th><th scope="col">{t("problems.difficulty")}</th><th scope="col">{t("problems.topics")}</th><th scope="col" className="problem-test-column">{t("problems.tests")}</th></tr></thead><tbody>{visible.map((problem) => {
      const problemStatus = statusForProblem(problem.id, state);
      const source = practiceById.get(problem.id);
      return <tr key={problem.id}><td><span className={`problem-status ${problemStatus}`}><CircleDot size={14} /><span className="sr-only">{t(`problems.${problemStatus}`)}</span></span></td><td><Link href={problem.href}><strong>{problem.title[locale]}</strong><small>{problem.summary[locale]}</small></Link></td><td><span className={`difficulty ${problem.difficulty}`}>{problem.difficulty}</span><small className="problem-rating">{problem.rating}</small></td><td>{source?.topicIds.slice(0, 2).map((id) => <span className="topic-token" key={id}>{topicById.get(id)?.title ?? id}</span>)}</td><td className="problem-test-column"><Link className="text-link" href={problem.href}>{t("problems.publicTests", { count: problem.publicTestCount })}<ArrowRight size={13} /></Link></td></tr>;
    })}</tbody></table>{!visible.length && <p className="empty-state">{t("problems.empty")}</p>}</div>}
  </>;
}

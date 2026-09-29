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
  const topicIds = Array.from(new Set(problems.flatMap((problem) => practiceById.get(problem.id)?.topicIds ?? []))).sort();
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return problems.filter((problem) => {
      const problemStatus = statusForProblem(problem.id, state);
      return (!normalized || `${problem.title[locale]} ${problem.summary[locale]}`.toLocaleLowerCase().includes(normalized))
        && (!difficulty || problem.difficulty === difficulty)
        && (!topicId || practiceById.get(problem.id)?.topicIds.includes(topicId))
        && (!status || status === problemStatus);
    });
  }, [difficulty, locale, query, state, status, topicId]);

  return <>
    <p className="judge-boundary" role="status">{t("problems.judgeUnavailable")}</p>
    <section className="problem-filters" aria-label={t("problems.title")}>
      <label className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("problems.search")} aria-label={t("problems.search")} /></label>
      <label className="form-field"><span>{t("problems.difficulty")}</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="">{t("problems.allDifficulties")}</option>{["easy", "medium", "hard"].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label className="form-field"><span>{t("problems.topics")}</span><select value={topicId} onChange={(event) => setTopicId(event.target.value)}><option value="">{t("problems.allTopics")}</option>{topicIds.map((id) => <option key={id} value={id}>{topicById.get(id)?.title ?? id}</option>)}</select></label>
      <label className="form-field"><span>{t("problems.status")}</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">{t("problems.allStatus")}</option><option value="solved">{t("problems.solved")}</option><option value="attempted">{t("problems.attempted")}</option><option value="unsolved">{t("problems.unsolved")}</option></select></label>
    </section>
    {!ready ? <p role="status">{t("practice.loading")}</p> : <div className="problem-table-wrap"><table className="problem-table"><thead><tr><th scope="col">{t("problems.status")}</th><th scope="col">{t("practice.title")}</th><th scope="col">{t("problems.difficulty")}</th><th scope="col">{t("problems.topics")}</th><th scope="col" className="problem-test-column">{t("problems.tests")}</th></tr></thead><tbody>{visible.map((problem) => {
      const problemStatus = statusForProblem(problem.id, state);
      const source = practiceById.get(problem.id);
      return <tr key={problem.id}><td><span className={`problem-status ${problemStatus}`}><CircleDot size={14} /><span className="sr-only">{t(`problems.${problemStatus}`)}</span></span></td><td><Link href={problem.href}><strong>{problem.title[locale]}</strong><small>{problem.summary[locale]}</small></Link></td><td><span className={`difficulty ${problem.difficulty}`}>{problem.difficulty}</span></td><td>{source?.topicIds.slice(0, 2).map((id) => <span className="topic-token" key={id}>{topicById.get(id)?.title ?? id}</span>)}</td><td className="problem-test-column"><Link className="text-link" href={problem.href}>{t("problems.publicTests", { count: problem.publicTestCount })}<ArrowRight size={13} /></Link></td></tr>;
    })}</tbody></table>{!visible.length && <p className="empty-state">{t("problems.empty")}</p>}</div>}
  </>;
}

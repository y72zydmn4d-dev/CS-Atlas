"use client";
import Link from "next/link";
import { practiceProblems } from "@/content/practice/problems";
import { usePractice } from "@/hooks/use-practice";
import { useI18n } from "@/components/locale-provider";
import { practiceStatus } from "@/lib/practice/progress";
export function PracticeProgress() {
  const { state, ready } = usePractice(); const { locale, t } = useI18n();
  const passed = practiceProblems.filter((p) => practiceStatus(p, state) === "passed").length;
  return <section className="panel practice-progress"><div className="panel-header"><h2>{t("practice.progressTitle")}</h2><span className="chip">{ready ? passed : "—"}/{practiceProblems.length}</span></div><p>{t("practice.progressNote")}</p><div className="practice-progress-list">{practiceProblems.map((p) => <Link href={`/practice/${p.id}`} key={p.id}><span>{p.title[locale]}</span><small>{ready ? t(`practice.${practiceStatus(p, state)}`) : "—"}</small></Link>)}</div></section>;
}

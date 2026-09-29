"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { practiceProblems } from "@/content/practice/problems";
import { useI18n } from "@/components/locale-provider";

export function RelatedPractice({ entityType, entityId }: { entityType: "domain" | "topic" | "algorithm" | "technique"; entityId: string }) {
  const { locale, t } = useI18n();
  const problems = practiceProblems.filter((p) => entityType === "domain" ? p.domainId === entityId : p[entityType === "topic" ? "topicIds" : entityType === "algorithm" ? "algorithmIds" : "techniqueIds"].includes(entityId));
  if (!problems.length) return null;
  return <section className="panel practice-related" lang={locale}><h2>{t("practice.related")}</h2><div className="topic-list">{problems.map((problem) => <Link className="topic-row" key={problem.id} href={`/problems/${problem.id}`}><span>{problem.title[locale]}</span><ArrowRight size={14} aria-hidden="true" /></Link>)}</div></section>;
}

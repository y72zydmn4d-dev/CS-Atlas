"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, Clock3 } from "lucide-react";
import { domains, topics } from "@/content";
import { useAtlas } from "@/components/atlas-provider";
import { calculateProgress } from "@/lib/progress";
import { useI18n } from "@/components/locale-provider";
import { localizeDomain, localizeTopic } from "@/i18n/content";
import { canonicalConceptIdForTopic } from "@/content/concepts/registry";
import { projectLegacyProgressToConcepts } from "@/lib/progress/projection";
import { useMemo } from "react";

export function ProgressDashboard() {
  const { progress, ready } = useAtlas();
  const { locale, t } = useI18n();
  const canonicalProgress = useMemo(() => projectLegacyProgressToConcepts(progress), [progress]);
  const conceptId = (topicId: string) => canonicalConceptIdForTopic(topicId);
  const overall = calculateProgress(topics.map((topic) => conceptId(topic.id)), canonicalProgress);
  const completed = topics.filter((topic) => canonicalProgress[conceptId(topic.id)] === "completed").length;
  const active = topics.filter((topic) => canonicalProgress[conceptId(topic.id)] === "in-progress").length;
  if (!ready) return <div className="panel" style={{ minHeight: 300 }} aria-label="Loading progress" />;
  return <><section className="progress-hero"><div className="progress-ring" style={{ "--value": overall } as React.CSSProperties}><div><span>{overall}%</span><small>{t("progress.atlasComplete")}</small></div></div><div><h2>{t("progress.yourMap")}</h2><p className="lede">{t("progress.explanation")}</p><div className="progress-summary"><div><strong>{completed}</strong><span>{t("progress.completedTopics")}</span></div><div><strong>{active}</strong><span>{t("status.inProgress")}</span></div><div><strong>{topics.length-completed-active}</strong><span>{t("status.notStarted")}</span></div></div></div></section><section className="panel" style={{ marginTop: 16 }}><div className="panel-header"><h2>{t("progress.domainProgress")}</h2><span className="chip">{t("progress.weighted")}</span></div>{domains.map((domain)=>{const value=calculateProgress(domain.topicIds.map(conceptId),canonicalProgress);return <Link href={`/domains/${domain.slug}`} className="progress-domain-row" key={domain.id}><strong>{localizeDomain(domain,locale).name}</strong><div className="progress-track"><div className="progress-fill" style={{width:`${value}%`,"--domain-accent":domain.accent} as React.CSSProperties}/></div><span>{value}%</span></Link>})}</section><section className="mini-grid" style={{ marginTop: 16 }}><div className="panel"><Clock3 size={19} style={{color:"var(--warning)",marginBottom:10}}/><h3>{t("status.inProgress")}</h3>{active?topics.filter((topic)=>canonicalProgress[conceptId(topic.id)]==="in-progress").slice(0,4).map((topic)=><Link className="text-link" style={{display:"flex",marginTop:8}} href={`/concepts/topic-${topic.slug}`} key={topic.id}>{localizeTopic(topic,locale).title}<ArrowRight size={13}/></Link>):<p style={{color:"var(--muted)",fontSize:13}}>{t("progress.markActive")}</p>}</div><div className="panel"><CheckCircle2 size={19} style={{color:"var(--success)",marginBottom:10}}/><h3>{t("progress.recentlyCompleted")}</h3>{completed?topics.filter((topic)=>canonicalProgress[conceptId(topic.id)]==="completed").slice(-4).reverse().map((topic)=><Link className="text-link" style={{display:"flex",marginTop:8}} href={`/concepts/topic-${topic.slug}`} key={topic.id}>{localizeTopic(topic,locale).title}<ArrowRight size={13}/></Link>):<p style={{color:"var(--muted)",fontSize:13}}>{t("progress.completedHere")}</p>}</div></section>{overall===0&&<div className="empty-state"><CircleDashed/><strong>{t("progress.mapReady")}</strong><span>{t("progress.mapReadyBody")}</span></div>}</>;
}

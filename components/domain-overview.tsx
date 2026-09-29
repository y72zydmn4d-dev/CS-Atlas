"use client";

import Link from "next/link";
import { ArrowRight, Check, CircleDot, ExternalLink, FolderKanban, GitFork, Lightbulb, Network } from "lucide-react";
import type { Domain } from "@/lib/types";
import { algorithmById, projectById, techniqueById, topicById } from "@/content";
import { useI18n } from "@/components/locale-provider";
import { localizeTopic } from "@/i18n/content";
import { LibraryResources } from "@/components/library/library-resources";
import { useAtlas } from "@/components/atlas-provider";
import { calculateProgress } from "@/lib/progress";
import { RelatedPractice } from "@/components/practice/related-practice";

export function DomainOverview({ domain }: { domain: Domain }) {
  const { locale, t } = useI18n();
  const { progress } = useAtlas();
  return <div className="content-grid"><div className="stack">
    <section className="panel"><div className="panel-header"><h2>{t("common.corePath")}</h2><Link className="text-link" href={`/domains/${domain.slug}/syllabus`}>{t("actions.fullSyllabus")} <ArrowRight size={13} /></Link></div><div className="topic-list">{domain.topicIds.map((id, index) => { const topic = topicById.get(id); if (!topic) return null; const localized = localizeTopic(topic, locale); return <Link className="topic-row" href={`/topics/${topic.slug}`} key={id}><span className="topic-row-number">{String(index + 1).padStart(2, "0")}</span><span>{localized.title}</span><small className="topic-state">{progress[id] === "completed" ? t("status.completed") : progress[id] === "in-progress" ? t("status.inProgress") : `${topic.estimatedMinutes} ${t("common.minutes")}`}</small><ArrowRight size={13} /></Link>; })}</div></section>
    <section className="mini-grid"><Link className="panel" href={`/domains/${domain.slug}/roadmap`}><GitFork size={21} style={{ color: "var(--accent)", marginBottom: 12 }} /><h3>{t("common.learningRoadmap")}</h3><p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>{t("common.learningRoadmapBody")}</p></Link><Link className="panel" href={`/domains/${domain.slug}/mindmap`}><Network size={21} style={{ color: "var(--cyan)", marginBottom: 12 }} /><h3>{t("common.conceptMindMap")}</h3><p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>{t("common.conceptMindMapBody")}</p></Link></section>
    {domain.algorithmIds.length > 0 && <section className="panel"><div className="panel-header"><h2>{t("common.associatedAlgorithms")}</h2><Link className="text-link" href="/algorithms">{t("common.encyclopedia")} <ArrowRight size={13} /></Link></div><div className="topic-list">{domain.algorithmIds.slice(0, 6).map((id) => { const item = algorithmById.get(id); return item ? <Link className="topic-row" href={`/algorithms/${item.slug}`} key={id}><CircleDot size={13} /><span>{item.name}</span><span className="chip">{item.category}</span></Link> : null; })}</div></section>}
    {domain.techniqueIds.length > 0 && <section className="panel"><div className="panel-header"><h2>{t("common.techniquesPatterns")}</h2><Link className="text-link" href="/techniques">{t("actions.allTechniques")} <ArrowRight size={13} /></Link></div><div className="topic-list">{domain.techniqueIds.slice(0, 6).map((id) => { const item = techniqueById.get(id); return item ? <Link className="topic-row" href={`/techniques/${item.slug}`} key={id}><Lightbulb size={13} /><span>{item.name}</span><ArrowRight size={13} /></Link> : null; })}</div></section>}
    <section className="panel"><div className="panel-header"><h2>{t("common.buildToLearn")}</h2><Link className="text-link" href="/projects">{t("common.projectLibrary")} <ArrowRight size={13} /></Link></div>{domain.projectIds.map((id) => { const project = projectById.get(id); return project ? <Link href={`/projects#${project.slug}`} className="mini-card" key={id}><FolderKanban size={18} style={{ color: "var(--success)", marginBottom: 8 }} /><strong>{project.title}</strong><span>{project.summary}</span></Link> : null; })}</section>
    <RelatedPractice entityType="domain" entityId={domain.id} />
    <LibraryResources entityType="domain" entityId={domain.id} />
  </div><aside className="stack">
    <section className="panel"><h3>{t("workspace.path")}</h3><ol className="domain-module-sequence">{domain.syllabus.map((module) => <li key={module.id}><Link href={`/domains/${domain.slug}/syllabus#${module.id}`}><span>{String(module.order).padStart(2, "0")}</span><strong>{module.title}</strong><small>{calculateProgress(module.topicIds, progress)}%</small></Link></li>)}</ol></section>
    <section className="panel"><h3>{t("common.prerequisites")}</h3><ul className="list-clean">{domain.prerequisites.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul></section>
    <section className="panel"><h3>{t("common.keyCoordinates")}</h3><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{domain.keyConcepts.map((item) => <span className="chip" key={item}>{item}</span>)}</div></section>
    <section className="panel"><h3>{t("common.resources")}</h3><ul className="list-clean">{domain.resources.map((item) => <li key={item.id}><ExternalLink size={14} /><span><strong style={{ display: "block", fontSize: 12 }}>{item.url && /^https?:\/\//.test(item.url) ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title} ↗</a> : item.title}</strong><small style={{ color: "var(--faint)" }}>{item.note}</small></span></li>)}</ul></section>
  </aside></div>;
}

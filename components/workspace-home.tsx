"use client";
import Link from "next/link";
import { ArrowRight, BookOpen, Bookmark, Search } from "lucide-react";
import { domains, domainById, topicById } from "@/content";
import { useAtlas } from "@/components/atlas-provider";
import { useI18n } from "@/components/locale-provider";
import { localizeDomain, localizeTopic } from "@/i18n/content";
import { activeTopics, nextDomainTopic } from "@/lib/learning-path";
import { StudyPlanner } from "@/components/progress/study-planner";

export function WorkspaceWelcome() {
  const { t } = useI18n();
  return <header className="workspace-welcome"><div><p className="kicker">{t("workspace.local")}</p><h1>{t("workspace.title")}</h1><p className="lede">{t("workspace.description")}</p></div><Link href="/search" className="home-search"><Search size={20} /><span>{t("workspace.search")}</span><ArrowRight size={18} /></Link></header>;
}

export function LearningDashboard() {
  const { t, locale } = useI18n();
  const { ready, progress, bookmarks } = useAtlas();
  const active = activeTopics(progress);
  const suggestions = domains.flatMap((domain) => { const topic = nextDomainTopic(domain, progress); return topic && !active.some((item) => item.id === topic.id) ? [topic] : []; });
  const choices = [...active, ...suggestions].slice(0, 3);
  const saved = bookmarks.filter((item) => item.href.startsWith("/") && !item.href.startsWith("//")).sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  return <section className="learning-dashboard" aria-busy={!ready}>
    <div className="learning-primary"><div className="section-heading"><div><p className="kicker">01 / {t("navigation.personal")}</p><h2>{t(active.length ? "workspace.continue" : "workspace.begin")}</h2><p>{t(active.length ? "workspace.continueBody" : "workspace.beginBody")}</p></div></div>
      {!ready ? <p role="status">{t("workspace.loading")}</p> : <div className="learning-choices">{choices.map((topic, index) => { const domain = domainById.get(topic.domainId); return <Link className="learning-choice" href={`/topics/${topic.slug}`} key={topic.id}><span className="step-number">{String(index + 1).padStart(2, "0")}</span><span><small>{domain ? localizeDomain(domain, locale).name : ""} · {topic.estimatedMinutes} {t("common.minutes")}</small><strong>{localizeTopic(topic, locale).title}</strong><span className="choice-action">{t(progress[topic.id] === "in-progress" ? "workspace.resume" : "workspace.start")} <ArrowRight size={13} /></span></span></Link>; })}</div>}
      {ready && !choices.length && <Link className="button-secondary" href="/progress">{t("workspace.complete")} <ArrowRight size={15} /></Link>}
    </div>
    <aside className="learning-saved"><StudyPlanner compact /><div className="saved-divider" /><BookOpen size={22} /><h3>{t("workspace.saved")}</h3>{ready && saved.length ? <ul>{saved.map((item) => { const topic = item.type === "topic" ? topicById.get(item.id) : undefined; return <li key={`${item.type}:${item.id}`}><Link href={item.href}><Bookmark size={14} /><span>{topic ? localizeTopic(topic, locale).title : item.title}</span></Link></li>; })}</ul> : <p>{t("workspace.savedEmpty")}</p>}<div className="saved-actions"><Link className="text-link" href="/library">{t("navigation.library")} <ArrowRight size={14} /></Link><Link className="text-link" href="/bookmarks">{t("navigation.bookmarks")}</Link></div></aside>
  </section>;
}

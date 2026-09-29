"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Languages } from "lucide-react";
import type { Domain, Topic } from "@/lib/types";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BookmarkButton, StatusSelect } from "@/components/content-actions";
import { ContentBlockRenderer } from "@/components/content-block-renderer";
import { TableOfContents, type TocItem } from "@/components/table-of-contents";
import { useI18n } from "@/components/locale-provider";
import { getTopicTranslationStatus, localizeDomain, localizeTopic } from "@/i18n/content";
import { LibraryResources } from "@/components/library/library-resources";
import { RelatedPractice } from "@/components/practice/related-practice";
import { conceptIdForTopic } from "@/lib/domain/concepts";

interface TopicPageViewProps {
  topic: Topic;
  domain: Domain;
  related: Topic[];
  previous?: Topic;
  next?: Topic;
  routeBase?: "/topics" | "/learn";
}

export function TopicPageView({ topic, domain, related, previous, next, routeBase = "/topics" }: TopicPageViewProps) {
  const { locale, t } = useI18n();
  const localizedTopic = localizeTopic(topic, locale);
  const localizedDomain = localizeDomain(domain, locale);
  const status = getTopicTranslationStatus(topic.id, locale);
  const tocItems: TocItem[] = [
    ...localizedTopic.content.map((block) => ({ id: block.id, label: block.title })),
    ...(topic.prerequisiteIds.length ? [{ id: "prerequisites", label: t("common.prerequisites") }] : []),
    ...(localizedTopic.glossary.length ? [{ id: "glossary", label: t("common.glossary") }] : []),
    { id: "related", label: t("common.relatedTopics") },
  ];
  const statusMessage = status === "complete" ? t("status.translationComplete") : status === "partial" ? t("status.translationPartial") : status === "english-only" ? t("status.translationEnglishOnly") : null;
  const localizedPrevious = previous ? localizeTopic(previous, locale) : undefined;
  const localizedNext = next ? localizeTopic(next, locale) : undefined;

  return <div className="page narrow">
    <Breadcrumbs items={routeBase === "/learn" ? [{ label: "Learn", href: "/learn" }, { label: domain.name, href: `/learn?domain=${domain.slug}` }, { label: topic.title }] : [{ label: "Domains", href: "/domains" }, { label: domain.name, href: `/domains/${domain.slug}` }, { label: topic.title }]} />
    <header className="page-header"><div className="page-header-copy"><p className="kicker">{t("common.topic")} · {localizedDomain.shortName}</p><h1>{localizedTopic.title}</h1><p className="lede">{localizedTopic.summary}</p><div className="doc-meta"><span className="chip">{topic.difficulty}</span><span className={`chip content-level level-${topic.revision.contentLevel.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{topic.revision.contentLevel}</span><span className="chip">≈ {topic.estimatedMinutes} {t("common.minutes")}</span><span className="chip">{localizedTopic.content.length} {t("common.learningBlocks")}</span></div>{statusMessage && <p className={`translation-status status-${status}`}><Languages size={14} />{statusMessage}</p>}</div><div className="header-actions"><Link className="button-secondary" href={`/concepts/topic-${topic.slug}`}>{t("common.concept")}</Link><StatusSelect id={topic.id} conceptId={conceptIdForTopic(topic.id)} /><BookmarkButton bookmark={{ id: topic.id, type: "topic", title: localizedTopic.title, href: `${routeBase}/${topic.slug}`, context: localizedDomain.name }} /></div></header>
    <div className="doc-layout"><article className="doc-article"><div lang={locale === "vi" && status !== "complete" ? "en" : locale}><ContentBlockRenderer topic={localizedTopic} /></div>
      {topic.prerequisiteIds.length > 0 && <section className="doc-section" id="prerequisites"><h2>{t("common.prerequisites")}</h2><div className="topic-list">{topic.prerequisiteIds.map((id) => { const item = related.find((candidate) => candidate.id === id); if (!item) return null; const localized = localizeTopic(item, locale); return <Link className="topic-row" href={`${routeBase}/${item.slug}`} key={id}><span>{localized.title}</span><ArrowRight size={13} /></Link>; })}</div></section>}
      {localizedTopic.glossary.length > 0 && <section className="doc-section" id="glossary"><h2>{t("common.glossary")}</h2><dl className="glossary-list">{localizedTopic.glossary.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></section>}
      <RelatedPractice entityType="topic" entityId={topic.id} /><LibraryResources entityType="topic" entityId={topic.id} />
      <section className="doc-section" id="related"><h2>{t("common.relatedTopics")}</h2>{related.length ? <div className="topic-list">{related.map((item) => { const localized = localizeTopic(item, locale); return <Link className="topic-row" href={`${routeBase}/${item.slug}`} key={item.id}><span>{localized.title}</span><ArrowRight size={13} /></Link>; })}</div> : <p>{t("common.continueRoadmap")}</p>}</section>
      <nav className="mini-grid" aria-label="Adjacent topics">{previous && localizedPrevious ? <Link className="mini-card" href={`${routeBase}/${previous.slug}`}><ArrowLeft size={15} /><span>{t("actions.previous")}</span><strong>{localizedPrevious.title}</strong></Link> : <span />}{next && localizedNext && <Link className="mini-card" href={`${routeBase}/${next.slug}`}><ArrowRight size={15} /><span>{t("actions.next")}</span><strong>{localizedNext.title}</strong></Link>}</nav>
    </article><aside className="doc-aside"><p className="eyebrow" style={{ padding: 0 }}>{t("common.onThisPage")}</p><TableOfContents items={tocItems} /></aside></div>
  </div>;
}

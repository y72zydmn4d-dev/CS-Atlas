"use client";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { AtlasEntity } from "@/lib/atlas-model";
import { domainById, topicById } from "@/content";
import { useI18n } from "@/components/locale-provider";
import { localizeTopic } from "@/i18n/content";
import { StatusSelect, BookmarkButton } from "@/components/content-actions";
import { LibraryResources } from "@/components/library/library-resources";
import { useAtlas } from "@/components/atlas-provider";
import { calculateProgress } from "@/lib/progress";

export function AtlasInspector({ entity, onExplore, onClose }: { entity: AtlasEntity; onExplore: (id: string) => void; onClose: () => void }) {
  const { locale, t } = useI18n();
  const { progress } = useAtlas();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 900px)").matches) heading.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [entity.id]);
  const domain = domainById.get(entity.domainId);
  const topic = entity.kind === "topic" ? topicById.get(entity.entityId) : undefined;
  const links = (ids: string[]) => <ul className="inspector-links">{ids.map((id) => { const item = topicById.get(id); return item ? <li key={id}><Link href={`/topics/${item.slug}`}>{localizeTopic(item, locale).title}<ArrowUpRight size={13} /></Link></li> : null; })}</ul>;
  return <aside className="atlas-inspector" aria-label={t("workspace.inspect", { name: entity.label })}>
    <div className="inspector-header"><span className="kicker">{t(entity.kind === "domain" ? "common.domain" : "common.topic")}</span><button className="icon-button" onClick={onClose} aria-label={t("workspace.closeInspector")}><X size={18} /></button></div>
    <h2 ref={heading} tabIndex={-1}>{entity.label}</h2><p>{entity.summary}</p>
    <Link className="button" href={entity.href}>{t("workspace.open")}<ArrowUpRight size={15} /></Link>
    {topic ? <><div className="inspector-actions"><StatusSelect id={topic.id} /><BookmarkButton bookmark={{ id: topic.id, type: "topic", href: entity.href, title: entity.label, context: domain?.name ?? "" }} /></div><section><h3>{t("common.prerequisites")}</h3>{topic.prerequisiteIds.length ? links(topic.prerequisiteIds) : <p>{t("workspace.noPrerequisites")}</p>}</section><section><h3>{t("workspace.related")}</h3>{links(topic.relatedTopicIds)}</section></> : domain && <><div className="inspector-progress"><span>{t("common.domainProgress")}</span><strong>{calculateProgress(domain.topicIds, progress)}%</strong></div><button className="button-secondary" onClick={() => onExplore(domain.id)}>{t("workspace.exploreTopics")}</button><section><h3>{t("common.corePath")}</h3>{links(domain.topicIds.slice(0, 5))}</section><section><h3>{t("common.resources")}</h3><ul className="inspector-links">{domain.resources.map((item) => <li key={item.id}>{item.url && /^https?:\/\//.test(item.url) ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}<ArrowUpRight size={13} /></a> : <span>{item.title}</span>}</li>)}</ul></section></>}
    <LibraryResources entityType={entity.kind} entityId={entity.entityId} />
  </aside>;
}

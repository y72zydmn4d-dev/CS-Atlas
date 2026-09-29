"use client";

import Link from "next/link";
import type { Domain } from "@/lib/types";
import { topicById } from "@/content";
import { StatusSelect } from "@/components/content-actions";
import { useAtlas } from "@/components/atlas-provider";
import { calculateProgress } from "@/lib/progress";
import { useI18n } from "@/components/locale-provider";
import { localizeTopic } from "@/i18n/content";

export function SyllabusView({ domain }: { domain: Domain }) {
  const { progress } = useAtlas();
  const { locale, t } = useI18n();
  const value = calculateProgress(domain.topicIds, progress);
  return <><div className="panel" style={{ marginBottom: 15 }}><div className="panel-header"><div><h2>{domain.syllabus.length} {t("common.modules")}</h2><p style={{ color: "var(--muted)", margin: 0, fontSize: 13 }}>{t("common.workInOrder")}</p></div><strong style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{value}% {t("common.complete")}</strong></div><div className="progress-track"><div className="progress-fill" style={{ width: `${value}%`, "--domain-accent": domain.accent } as React.CSSProperties} /></div></div><div className="syllabus-list">{domain.syllabus.map((module) => <article className="module-card" key={module.id} id={module.id}><span className="module-number">{String(module.order).padStart(2, "0")}</span><div><h3>{module.title}</h3><p>{module.description}</p><div className="module-topics">{module.topicIds.map((id) => { const topic = topicById.get(id); return topic ? <Link key={id} href={`/topics/${topic.slug}`}>{localizeTopic(topic, locale).title}</Link> : null; })}</div></div><StatusSelect id={`module:${domain.id}:${module.id}`} label={`${module.title} ${t("status.learning")}`} /></article>)}</div></>;
}

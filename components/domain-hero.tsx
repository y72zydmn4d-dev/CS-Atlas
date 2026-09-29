"use client";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Domain } from "@/lib/types";
import { useAtlas } from "@/components/atlas-provider";
import { calculateProgress } from "@/lib/progress";
import { nextDomainTopic } from "@/lib/learning-path";
import { DomainIcon } from "@/components/icon-map";
import { useI18n } from "@/components/locale-provider";
import { localizeDomain, localizeTopic } from "@/i18n/content";

export function DomainHero({ domain }: { domain: Domain }) {
  const { progress } = useAtlas();
  const { locale, t } = useI18n();
  const localized = localizeDomain(domain, locale);
  const value = calculateProgress(domain.topicIds, progress);
  const next = nextDomainTopic(domain, progress);
  return <section className="domain-hero" style={{ "--domain-accent": domain.accent } as CSSProperties}><div><div className="domain-title-row"><span className="domain-icon"><DomainIcon name={domain.icon} size={25} /></span><div><p className="kicker">{t("common.domain")} · {t(domain.difficulty === "Foundational" ? "workspace.foundation" : domain.difficulty === "Advanced" ? "workspace.advanced" : "workspace.intermediate")}</p><h1>{localized.name}</h1></div></div><p className="lede">{localized.description}</p><div className="intro-actions"><Link className="button" href={next ? `/topics/${next.slug}` : `/domains/${domain.slug}/syllabus`}>{t(next ? progress[next.id] === "in-progress" ? "workspace.resume" : "workspace.start" : "workspace.review")} <ArrowRight size={15} /></Link><Link className="button-secondary" href={`/domains/${domain.slug}/roadmap`}>{t("actions.openRoadmap")}</Link></div>{next && <Link className="domain-next-topic" href={`/topics/${next.slug}`}>{t("workspace.next")}: {localizeTopic(next, locale).title}</Link>}</div><div className="domain-hero-side"><strong>{value}%</strong><span>{t("workspace.completedCount", { done: domain.topicIds.filter((id) => progress[id] === "completed").length, total: domain.topicIds.length })}</span><div className="progress-track" role="progressbar" aria-label={t("common.domainProgress")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><div className="progress-fill" style={{ width: `${value}%` }} /></div><small>{domain.syllabus.length} {t("common.modules")}</small></div></section>;
}

"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Domain } from "@/lib/types";
import { useAtlas } from "@/components/atlas-provider";
import { calculateProgress } from "@/lib/progress";
import { DomainIcon } from "@/components/icon-map";
import { useI18n } from "@/components/locale-provider";
import { localizeDomain, localizeTopic } from "@/i18n/content";
import { nextDomainTopic } from "@/lib/learning-path";

export function DomainCard({ domain }: { domain: Domain }) {
  const { progress } = useAtlas();
  const { locale, t } = useI18n();
  const localized = localizeDomain(domain, locale);
  const value = calculateProgress(domain.topicIds, progress);
  const next = nextDomainTopic(domain, progress);
  const done = domain.topicIds.filter((id) => progress[id] === "completed").length;
  return (
    <Link href={`/domains/${domain.slug}`} className="domain-card" style={{ "--domain-accent": domain.accent } as CSSProperties}>
      <div className="domain-card-top"><span className="domain-icon"><DomainIcon name={domain.icon} /></span><span className="chip">{t(domain.difficulty === "Foundational" ? "workspace.foundation" : domain.difficulty === "Advanced" ? "workspace.advanced" : "workspace.intermediate")}</span></div>
      <h3>{localized.name}</h3>
      <p>{localized.description}</p>
      <div className="card-footer">
        <div className="card-next"><small>{t(next ? "workspace.next" : "workspace.complete")}</small><span>{next ? localizeTopic(next, locale).title : localized.name}<ArrowUpRight size={15} /></span></div>
        <div className="meta-row"><span>{t("workspace.completedCount", { done, total: domain.topicIds.length })}</span><span>{value}%</span></div>
        <div className="progress-track" role="progressbar" aria-label={localized.name} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className="progress-fill" style={{ width: `${value}%` }} /></div>
      </div>
    </Link>
  );
}

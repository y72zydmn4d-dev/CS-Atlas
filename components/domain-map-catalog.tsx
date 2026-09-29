"use client";

import Link from "next/link";
import { ArrowRight, GitFork, Network } from "lucide-react";
import type { Domain } from "@/lib/types";
import { useI18n } from "@/components/locale-provider";
import { localizeDomain } from "@/i18n/content";

export function DomainMapCatalog({ domains, mode }: { domains: Domain[]; mode: "roadmap" | "mindmap" }) {
  const { locale, t } = useI18n();
  return <div className="catalog-grid">{domains.map((domain) => { const localized = localizeDomain(domain, locale); return <Link className="catalog-card" href={`/domains/${domain.slug}/${mode}`} key={domain.id}><span className="catalog-card-icon">{mode === "roadmap" ? <GitFork size={18} /> : <Network size={18} />}</span><h3 style={{ marginTop: 14 }}>{localized.name}</h3><p>{mode === "roadmap" ? t("roadmaps.topicCount", { count: domain.topicIds.length }) : t("mindmaps.conceptCount", { count: domain.mindMap.nodes.length })}</p><div className="meta-row"><span>{mode === "roadmap" ? `${domain.difficulty} · ${t("common.interactive")}` : t("mindmaps.interactive")}</span><ArrowRight size={14} /></div></Link>; })}</div>;
}

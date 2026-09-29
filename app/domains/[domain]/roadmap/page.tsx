import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { domainBySlug } from "@/content";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DomainTabs } from "@/components/domain-tabs";
import { DomainSubpageHeader } from "@/components/domain-subpage-header";
const GraphExplorer = dynamic(() => import("@/components/graph-explorer").then((module) => module.GraphExplorer));
export default async function RoadmapPage({ params }: { params: Promise<{ domain: string }> }) { const { domain: slug } = await params; const domain = domainBySlug.get(slug); if (!domain) notFound(); return <div className="page"><Breadcrumbs items={[{ label: "Domains", href: "/domains" }, { label: domain.name, href: `/domains/${domain.slug}` }, { label: "Roadmap" }]} /><DomainSubpageHeader domain={domain} page="roadmap" /><DomainTabs slug={domain.slug} active="roadmap" /><GraphExplorer domain={domain} mode="roadmap" /></div>; }

import { notFound } from "next/navigation";
import { domains, domainBySlug } from "@/content";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DomainHero } from "@/components/domain-hero";
import { DomainTabs } from "@/components/domain-tabs";
import { DomainOverview } from "@/components/domain-overview";

export function generateStaticParams() { return domains.map((domain) => ({ domain: domain.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }) { const { domain } = await params; const item = domainBySlug.get(domain); return { title: item?.name ?? "Domain", description: item?.description }; }
export default async function DomainPage({ params }: { params: Promise<{ domain: string }> }) { const { domain: slug } = await params; const domain = domainBySlug.get(slug); if (!domain) notFound(); return <div className="page"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Domains", href: "/domains" }, { label: domain.name }]} /><DomainHero domain={domain} /><DomainTabs slug={domain.slug} active="overview" /><DomainOverview domain={domain} /></div>; }

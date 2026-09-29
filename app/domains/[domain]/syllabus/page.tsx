import { notFound } from "next/navigation";
import { domainBySlug } from "@/content";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DomainTabs } from "@/components/domain-tabs";
import { SyllabusView } from "@/components/syllabus-view";
import { DomainSubpageHeader } from "@/components/domain-subpage-header";

export default async function SyllabusPage({ params }: { params: Promise<{ domain: string }> }) { const { domain: slug } = await params; const domain = domainBySlug.get(slug); if (!domain) notFound(); return <div className="page"><Breadcrumbs items={[{ label: "Domains", href: "/domains" }, { label: domain.name, href: `/domains/${domain.slug}` }, { label: "Syllabus" }]} /><DomainSubpageHeader domain={domain} page="syllabus" /><DomainTabs slug={domain.slug} active="syllabus" /><SyllabusView domain={domain} /></div>; }

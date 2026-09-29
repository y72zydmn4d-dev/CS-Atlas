import { domains } from "@/content";
import { DomainCard } from "@/components/domain-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Message } from "@/components/locale-provider";

export const metadata = { title: "Domains" };
export default function DomainsPage() {
  return <div className="page"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Domains" }]} /><header className="page-header"><div className="page-header-copy"><p className="kicker"><Message k="domains.kicker" /></p><h1><Message k="domains.title" /></h1><p className="lede"><Message k="domains.lede" /></p></div></header><section className="domain-grid">{domains.map((domain) => <DomainCard key={domain.id} domain={domain} />)}</section></div>;
}

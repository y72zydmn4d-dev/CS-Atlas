import { domains } from "@/content";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DomainMapCatalog } from "@/components/domain-map-catalog";
import { Message } from "@/components/locale-provider";

export const metadata = { title: "Mind Maps" };
export default function MindMapsPage() { return <div className="page"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Mind Maps" }]} /><header className="page-header"><div><p className="kicker"><Message k="mindmaps.kicker" /></p><h1><Message k="mindmaps.title" /></h1><p className="lede"><Message k="mindmaps.lede" /></p></div></header><DomainMapCatalog domains={domains} mode="mindmap" /></div>; }

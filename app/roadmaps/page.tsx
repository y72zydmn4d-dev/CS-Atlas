import { domains } from "@/content";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DomainMapCatalog } from "@/components/domain-map-catalog";
import { Message } from "@/components/locale-provider";
import { metadataForRoute } from "@/lib/routes";

export const metadata = metadataForRoute("roadmaps");
export default function RoadmapsPage() { return <div className="page"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Roadmaps" }]} /><header className="page-header"><div><p className="kicker"><Message k="roadmaps.kicker" /></p><h1><Message k="navigation.roadmaps" /></h1><p className="lede"><Message k="roadmaps.lede" /></p></div></header><DomainMapCatalog domains={domains} mode="roadmap" /></div>; }

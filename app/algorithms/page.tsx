import { algorithms } from "@/content";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AlgorithmCatalog } from "@/components/catalogs";
import { Message } from "@/components/locale-provider";
import { metadataForRoute } from "@/lib/routes";
export const metadata = metadataForRoute("algorithms");
export default function AlgorithmsPage() { return <div className="page"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Algorithms" }]} /><header className="page-header"><div><p className="kicker"><Message k="algorithms.kicker" /></p><h1><Message k="algorithms.title" /></h1><p className="lede"><Message k="algorithms.lede" /></p></div></header><AlgorithmCatalog items={algorithms} /></div>; }

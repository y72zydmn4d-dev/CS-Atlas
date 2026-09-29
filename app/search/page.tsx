import { Breadcrumbs } from "@/components/breadcrumbs";
import { SearchPageView } from "@/components/search-page-view";
import { Message } from "@/components/locale-provider";
import { metadataForRoute } from "@/lib/routes";
export const metadata = metadataForRoute("search");
export default function SearchPage(){return <div className="page narrow"><Breadcrumbs items={[{label:"Home",href:"/"},{label:"Search"}]}/><header className="page-header"><div><p className="kicker"><Message k="search.kicker" /></p><h1><Message k="search.title" /></h1><p className="lede"><Message k="search.lede" /></p></div></header><SearchPageView/></div>}

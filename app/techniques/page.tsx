import { techniques } from "@/content";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TechniqueCatalog } from "@/components/catalogs";
import { Message } from "@/components/locale-provider";
export const metadata = { title: "Techniques" };
export default function TechniquesPage(){return <div className="page"><Breadcrumbs items={[{label:"Home",href:"/"},{label:"Techniques"}]}/><header className="page-header"><div><p className="kicker"><Message k="techniques.kicker" /></p><h1><Message k="navigation.techniques" /></h1><p className="lede"><Message k="techniques.lede" /></p></div></header><TechniqueCatalog items={techniques}/></div>}

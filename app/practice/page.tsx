import { Message } from "@/components/locale-provider";
import { PracticeCatalog } from "@/components/practice/practice-catalog";
import { metadataForRoute } from "@/lib/routes";
export const metadata = metadataForRoute("practice");
export default function PracticePage() {
  return <div className="page"><header className="page-header"><div><p className="kicker"><Message k="practice.mode" /></p><h1><Message k="practice.title" /></h1><p className="lede"><Message k="practice.subtitle" /></p></div></header><PracticeCatalog /></div>;
}

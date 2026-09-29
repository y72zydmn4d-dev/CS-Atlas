import { Message } from "@/components/locale-provider";
import { PracticeCatalog } from "@/components/practice/practice-catalog";
export const metadata = { title: "Practice & Judge", description: "Solve connected CS and ML problems with local public-test feedback." };
export default function PracticePage() {
  return <div className="page"><header className="page-header"><div><p className="kicker"><Message k="practice.mode" /></p><h1><Message k="practice.title" /></h1><p className="lede"><Message k="practice.subtitle" /></p></div></header><PracticeCatalog /></div>;
}

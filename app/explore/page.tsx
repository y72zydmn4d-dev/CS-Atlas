import Link from "next/link";
import { GitFork, Network, Orbit } from "lucide-react";
import { Message } from "@/components/locale-provider";

export const metadata = { title: "Explore", description: "Explore CS Atlas through roadmaps, mind maps, and the knowledge graph." };

export default function ExplorePage() {
  return <div className="page"><header className="page-header"><div><p className="kicker"><Message k="navigation.explore" /></p><h1><Message k="explore.title" /></h1><p className="lede"><Message k="explore.lede" /></p></div></header><section className="explore-options"><Link href="/atlas"><Network size={20} /><div><h2><Message k="explore.atlas" /></h2><p><Message k="explore.atlasBody" /></p></div></Link><Link href="/roadmaps"><GitFork size={20} /><div><h2><Message k="explore.roadmaps" /></h2><p><Message k="explore.roadmapsBody" /></p></div></Link><Link href="/mind-maps"><Orbit size={20} /><div><h2><Message k="explore.mindMaps" /></h2><p><Message k="explore.mindMapsBody" /></p></div></Link></section></div>;
}

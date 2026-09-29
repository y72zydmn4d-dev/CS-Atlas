import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { domains } from "@/content";
import { DomainCard } from "@/components/domain-card";
import { KnowledgeAtlasPreview } from "@/components/knowledge-atlas-preview";
import { Message } from "@/components/locale-provider";
import { LearningDashboard, WorkspaceWelcome } from "@/components/workspace-home";
import { AuthorFooter } from "@/components/home/author-footer";

export default function HomePage() {
  return <div className="page workspace-home">
    <WorkspaceWelcome />
    <LearningDashboard />
    <section className="workspace-map-section"><div className="map-introduction"><p className="kicker">02 / <Message k="workspace.atlas" /></p><h2><Message k="workspace.mapTitle" /></h2><p><Message k="workspace.mapBody" /></p><Link className="button-secondary" href="/atlas"><Message k="workspace.openAtlas" /><ArrowRight size={15} /></Link></div><KnowledgeAtlasPreview /></section>
    <div className="section-heading"><div><p className="kicker">03 / <Message k="navigation.explore" /></p><h2><Message k="workspace.domains" /></h2><p><Message k="workspace.domainsBody" values={{ count: domains.length }} /></p></div><Link className="text-link" href="/roadmaps"><Message k="home.viewRoadmaps" /><ArrowRight size={14} /></Link></div>
    <section className="domain-grid">{domains.map((domain) => <DomainCard key={domain.id} domain={domain} />)}</section>
    <AuthorFooter imageSrc="/images/author/trinh-gia-huy.jpg" />
  </div>;
}

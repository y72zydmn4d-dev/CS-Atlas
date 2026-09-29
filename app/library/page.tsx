import Link from "next/link";
import { FilePlus2, Link2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LibraryList } from "@/components/library/library-list";
import { Message } from "@/components/locale-provider";
import { metadataForRoute } from "@/lib/routes";

export const metadata = metadataForRoute("library");
export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ entity?: string }> }) { const { entity } = await searchParams; return <div className="page"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Library" }]} /><header className="page-header"><div><p className="kicker"><Message k="library.kicker" /></p><h1><Message k="library.title" /></h1><p className="lede"><Message k="library.lede" /></p></div><div className="header-actions"><Link className="button-primary" href="/library/import"><FilePlus2 size={16} /><Message k="library.addDocument" /></Link><Link className="button-secondary" href="/library/import?type=link"><Link2 size={16} /><Message k="library.addLink" /></Link></div></header><LibraryList initialEntity={entity} /></div>; }

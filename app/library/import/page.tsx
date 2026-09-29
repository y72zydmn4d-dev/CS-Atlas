import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LibraryImport } from "@/components/library/library-import";
import { Message } from "@/components/locale-provider";
import { LIBRARY_CONFIG } from "@/lib/library/config";

export const metadata = { title: "Add to Library" };
export default function LibraryImportPage() { return <div className="page narrow"><Breadcrumbs items={[{ label: "Library", href: "/library" }, { label: "Import" }]} /><header className="page-header"><div><p className="kicker"><Message k="library.kicker" /></p><h1><Message k="library.importTitle" /></h1><p className="lede"><Message k="library.importLede" values={{ count: LIBRARY_CONFIG.maxFilesPerImport }} /></p></div></header><Suspense fallback={null}><LibraryImport /></Suspense></div>; }

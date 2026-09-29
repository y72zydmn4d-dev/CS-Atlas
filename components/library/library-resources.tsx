"use client";

import Link from "next/link";
import { BookOpen, FileText, Link2 } from "lucide-react";
import { useMemo } from "react";
import { useI18n } from "@/components/locale-provider";
import { useLibraryItems } from "@/hooks/use-library";
import type { LibraryEntityType } from "@/lib/library/types";

export function LibraryResources({ entityType, entityId }: { entityType: LibraryEntityType; entityId: string }) {
  const query = useMemo(() => ({ entityType, entityId }), [entityId, entityType]);
  const { items, loading, error } = useLibraryItems(query); const { t } = useI18n();
  return <section className="doc-section library-resources" id="library-resources"><div className="panel-header"><h2><BookOpen size={19} />{t("library.resourcesTitle")}</h2><Link className="text-link" href={`/library?entity=${entityType}:${entityId}`}>{t("library.viewAll")}</Link></div>{loading ? <p aria-live="polite">{t("library.loading")}</p> : error ? <p className="form-error">{t("library.loadError")}</p> : items.length ? <div className="topic-list">{items.slice(0, 6).map((item) => <Link className="topic-row" href={`/library/${item.id}`} key={item.id}>{item.type === "link" ? <Link2 size={14} /> : <FileText size={14} />}<span>{item.title}</span><span className="chip">{item.type === "link" ? t("library.link") : item.fileFormat?.toUpperCase()}</span></Link>)}</div> : <p>{t("library.resourcesEmpty")}</p>}</section>;
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Braces, ArrowRight, BrainCircuit, Search } from "lucide-react";
import type { Algorithm as AlgorithmType, Technique } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/locale-provider";

export function AlgorithmCatalog({ items }: { items: AlgorithmType[] }) {
  const { t } = useI18n();
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))];
  const filtered = useMemo(() => items.filter((item) => (category === "All" || item.category === category) && `${item.name} ${item.summary}`.toLowerCase().includes(query.toLowerCase())), [category, items, query]);
  return <><div className="catalog-toolbar"><label className="catalog-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("catalog.filterAlgorithms")} aria-label={t("catalog.filterAlgorithms")} /></label></div><div className="filter-pills" style={{ marginBottom: 18 }}>{categories.map((item) => <button key={item} className={cn("filter-pill", category === item && "active")} onClick={() => setCategory(item)}>{item === "All" ? t("common.all") : item}</button>)}</div><div className="catalog-grid">{filtered.map((item) => <Link className="catalog-card" href={`/algorithms/${item.slug}`} key={item.id}><span className="catalog-card-icon"><Braces size={18} /></span><h3 style={{ marginTop: 14 }}>{item.name}</h3><p>{item.summary}</p><div className="meta-row"><span>{item.category} · {item.timeComplexity}</span><ArrowRight size={14} /></div></Link>)}</div>{!filtered.length && <div className="empty-state"><Search /><strong>{t("catalog.noAlgorithms")}</strong><span>{t("catalog.clearFilter")}</span></div>}</>;
}

export function TechniqueCatalog({ items }: { items: Technique[] }) {
  const { t } = useI18n();
  const [family, setFamily] = useState("All");
  const filtered = items.filter((item) => family === "All" || item.family === family);
  return <><div className="filter-pills" style={{ marginBottom: 18 }}>{["All", "Algorithms", "Machine Learning"].map((item) => <button key={item} className={cn("filter-pill", family === item && "active")} onClick={() => setFamily(item)}>{item === "All" ? t("common.all") : item}</button>)}</div><div className="catalog-grid">{filtered.map((item) => <Link className="catalog-card" href={`/techniques/${item.slug}`} key={item.id}><span className="catalog-card-icon"><BrainCircuit size={18} /></span><h3 style={{ marginTop: 14 }}>{item.name}</h3><p>{item.summary}</p><div className="meta-row"><span>{item.family} · {item.algorithmIds.length + item.topicIds.length} {t("common.connections")}</span><ArrowRight size={14} /></div></Link>)}</div></>;
}

"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, List, Network, Search } from "lucide-react";
import { domains } from "@/content";
import { useI18n } from "@/components/locale-provider";
import { localizeDomain } from "@/i18n/content";
import { atlasEntities, buildAtlasModel, findAtlasEntities, type AtlasEntity } from "@/lib/atlas-model";
import { AtlasInspector } from "./atlas-inspector";

function LoadingMap() { const { t } = useI18n(); return <div className="atlas-canvas atlas-loading" role="status">{t("workspace.loading")}</div>; }
const AtlasCanvas = dynamic(() => import("./atlas-canvas"), { ssr: false, loading: LoadingMap });

export function AtlasWorkspace() {
  const { t, locale } = useI18n();
  const [scope, setScope] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"map" | "list">("list");
  useEffect(() => {
    // A readable list is the initial small-screen experience; the map stays one tap away.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!window.matchMedia("(max-width: 650px)").matches) setView("map");
  }, []);
  const [selectedId, setSelectedId] = useState<string>();
  const [focusId, setFocusId] = useState<string>();
  const searchRef = useRef<HTMLInputElement>(null);
  const entities = useMemo(() => atlasEntities(locale), [locale]);
  const model = useMemo(() => buildAtlasModel(locale, scope), [locale, scope]);
  const results = useMemo(() => findAtlasEntities(query, entities), [entities, query]);
  const selected = entities.find((item) => item.id === selectedId);
  const select = useCallback((entity: AtlasEntity) => setSelectedId(entity.id), []);
  const explore = (id: string) => { setScope(id); setFocusId(undefined); setQuery(""); };
  const focusResult = (entity: AtlasEntity) => { setScope(entity.kind === "topic" ? entity.domainId : ""); setSelectedId(entity.id); setFocusId(entity.id); setQuery(""); searchRef.current?.focus(); };
  return <div className="page atlas-page"><header className="page-header"><div><p className="kicker">CS ATLAS / {t("navigation.explore")}</p><h1>{t("workspace.atlas")}</h1><p className="lede">{t("workspace.mapBody")}</p></div></header>
    <div className="atlas-toolbar"><div className="atlas-search"><Search size={17} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("workspace.findNode")} aria-label={t("workspace.findNode")} aria-controls={query.trim() ? "atlas-results" : undefined} onKeyDown={(event) => { if (event.key === "Escape") setQuery(""); if (event.key === "Enter" && results[0]) focusResult(results[0]); }} />{query.trim() && <div className="atlas-search-results" id="atlas-results"><p role="status">{results.length ? t("workspace.select") : t("workspace.noResults")}</p>{results.map((item) => <button key={item.id} onClick={() => focusResult(item)}><span>{item.label}<small>{t(item.kind === "domain" ? "common.domain" : "common.topic")}</small></span><ArrowRight size={14} /></button>)}</div>}</div>
      <select value={scope} onChange={(event) => { explore(event.target.value); setSelectedId(event.target.value ? `domain:${event.target.value}` : undefined); }} aria-label={t("workspace.filter")}><option value="">{t("workspace.allFields")}</option>{domains.map((domain) => <option key={domain.id} value={domain.id}>{localizeDomain(domain, locale).name}</option>)}</select>
      <div className="view-toggle"><button className="icon-button" aria-label={t("workspace.map")} aria-pressed={view === "map"} onClick={() => setView("map")}><Network size={18} /></button><button className="icon-button" aria-label={t("workspace.list")} aria-pressed={view === "list"} onClick={() => setView("list")}><List size={18} /></button></div>
    </div>
    <div className={`atlas-workbench ${selected ? "has-inspector" : ""}`}><div className="atlas-map-pane">{view === "map" ? <AtlasCanvas nodes={model.nodes} edges={model.edges} selectedId={selectedId} focusId={focusId} onSelect={select} /> : <div className="atlas-node-list">{model.nodes.map((entity) => <button key={entity.id} onClick={() => select(entity)} aria-pressed={selectedId === entity.id}><span><small>{t(entity.kind === "domain" ? "common.domain" : "common.topic")}</small><strong>{entity.label}</strong></span><ArrowRight size={16} /></button>)}</div>}<div className="atlas-map-legend"><span className="legend-membership">{t("workspace.contains")}</span><span className="legend-prerequisite">{t(scope ? "workspace.prerequisite" : "workspace.crossField")}</span></div><p className="atlas-help">{t("workspace.mapHelp")}</p></div>{selected && <AtlasInspector key={selected.id} entity={selected} onExplore={explore} onClose={() => { setSelectedId(undefined); searchRef.current?.focus(); }} />}</div>
  </div>;
}

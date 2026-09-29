"use client";

import Link from "next/link";
import { ArrowRight, PencilRuler, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { exercises } from "@/content/exercises";
import { concepts } from "@/content/concepts/registry";
import { useAtlas } from "@/components/atlas-provider";
import { useI18n } from "@/components/locale-provider";

export function ExerciseCatalog() {
  const { locale, t } = useI18n();
  const { exercises: localStatus } = useAtlas();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("");
  const [conceptId, setConceptId] = useState("");
  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return exercises.filter((exercise) => (!mode || exercise.mode === mode) && (!conceptId || exercise.conceptIds.includes(conceptId)) && (!normalized || `${exercise.title[locale]} ${exercise.prompt[locale]} ${exercise.mode}`.toLocaleLowerCase().includes(normalized)));
  }, [conceptId, locale, mode, query]);
  const modes = Array.from(new Set(exercises.map((exercise) => exercise.mode)));

  return <><section className="catalog-toolbar" aria-label={t("exercise.title")}><label className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("exercise.search")} aria-label={t("exercise.search")} /></label><label className="form-field"><span>{t("exercise.allModes")}</span><select value={mode} onChange={(event) => setMode(event.target.value)}><option value="">{t("exercise.allModes")}</option>{modes.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="form-field"><span>{t("exercise.allConcepts")}</span><select value={conceptId} onChange={(event) => setConceptId(event.target.value)}><option value="">{t("exercise.allConcepts")}</option>{concepts.filter((concept) => exercises.some((exercise) => exercise.conceptIds.includes(concept.id))).map((concept) => <option key={concept.id} value={concept.id}>{concept.name[locale]}</option>)}</select></label></section><section className="exercise-index" aria-live="polite">{visible.length ? visible.map((exercise) => { const status = localStatus[exercise.id.replace("exercise:", "")] ?? "not-attempted"; return <Link key={exercise.id} href={`/exercises/${exercise.id}`}><PencilRuler size={17} /><span><strong>{exercise.title[locale]}</strong><small>{exercise.mode} · {exercise.difficulty} · {exercise.estimatedMinutes} {t("common.minutes")} · {status}</small></span><ArrowRight size={16} /></Link>; }) : <p className="empty-state">{t("exercise.empty")}</p>}</section></>;
}

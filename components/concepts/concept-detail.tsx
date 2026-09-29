"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, CheckCircle2, GitFork, GraduationCap } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BookmarkButton, StatusSelect } from "@/components/content-actions";
import { useAtlas } from "@/components/atlas-provider";
import { useI18n } from "@/components/locale-provider";
import { deriveLocalMastery } from "@/lib/domain/learning";
import type { Concept, ConceptRelationType, LocalizedConceptText } from "@/lib/domain/concepts";
import { LibraryResources } from "@/components/library/library-resources";

interface LinkedRecord {
  id: string;
  title: LocalizedConceptText;
  href: string;
  meta?: string;
}

interface RelatedConcept {
  concept: Concept;
  relationType: ConceptRelationType;
}

interface ConceptDetailProps {
  concept: Concept;
  lesson?: LinkedRecord;
  related: RelatedConcept[];
  exercises: LinkedRecord[];
  problems: LinkedRecord[];
  learningViews: Array<{ href: string; title: string }>;
}

const relationLabel = (type: ConceptRelationType) => type.replaceAll("_", " ").toLowerCase();

export function ConceptDetail({ concept, lesson, related, exercises, problems, learningViews }: ConceptDetailProps) {
  const { locale, t } = useI18n();
  const { learningEvents } = useAtlas();
  const mastery = deriveLocalMastery(concept.id, learningEvents);
  const statusId = concept.kind === "topic" ? concept.provenance.legacyId : concept.id;
  const bookmarkType = concept.kind;
  const masteryLabel = mastery.state === "confident" ? t("concept.masteryConfident") : mastery.state === "practicing" ? t("concept.masteryPracticing") : mastery.state === "developing" ? t("concept.masteryDeveloping") : null;

  return <div className="page narrow concept-page">
    <Breadcrumbs items={[{ label: "Explore", href: "/explore" }, { label: concept.name.en }]} />
    <header className="page-header concept-header"><div><p className="kicker">{t("concept.kicker")} · {concept.kind}</p><h1>{concept.name[locale]}</h1><p className="lede">{concept.summary[locale]}</p><div className="doc-meta"><span className="chip">{concept.kind}</span><span className="chip">{concept.provenance.source.replace("-registry", "")}</span></div></div><div className="header-actions"><StatusSelect id={statusId} conceptId={concept.id} /><BookmarkButton bookmark={{ id: concept.id, type: bookmarkType, title: concept.name[locale], href: `/concepts/${concept.slug}`, context: t("concept.kicker") }} /></div></header>
    <section className="concept-primary-actions">
      {lesson && <Link className="button-primary" href={lesson.href}><GraduationCap size={16} />{t("concept.learn")}</Link>}
      <Link className="button-secondary" href={`/assistant?concept=${encodeURIComponent(concept.id)}`}><BrainCircuit size={16} />{t("concept.askAI")}</Link>
    </section>
    <div className="concept-layout">
      <article className="concept-content">
        <section className="concept-section"><div className="section-heading compact"><div><p className="kicker">{t("concept.mastery")}</p><h2>{masteryLabel ?? t("status.notStarted")}</h2></div><span className="chip">{mastery.evidenceCount}</span></div><p>{masteryLabel ? `${mastery.evidenceCount} local evidence record${mastery.evidenceCount === 1 ? "" : "s"}.` : t("concept.masteryEmpty")}</p></section>
        <section className="concept-section"><h2>{t("concept.related")}</h2>{related.length ? <div className="concept-link-list">{related.map(({ concept: item, relationType }) => <Link key={`${relationType}:${item.id}`} href={`/concepts/${item.slug}`}><span><strong>{item.name[locale]}</strong><small>{relationLabel(relationType)}</small></span><ArrowRight size={16} /></Link>)}</div> : <p>{t("concept.noRelated")}</p>}</section>
        <section className="concept-section"><h2>{t("concept.exercises")}</h2>{exercises.length ? <div className="concept-link-list">{exercises.map((exercise) => <Link key={exercise.id} href={exercise.href}><span><strong>{exercise.title[locale]}</strong>{exercise.meta && <small>{exercise.meta}</small>}</span><ArrowRight size={16} /></Link>)}</div> : <p>{t("concept.noExercises")}</p>}</section>
        <section className="concept-section"><h2>{t("concept.problems")}</h2>{problems.length ? <div className="concept-link-list">{problems.map((problem) => <Link key={problem.id} href={problem.href}><span><strong>{problem.title[locale]}</strong>{problem.meta && <small>{problem.meta}</small>}</span><ArrowRight size={16} /></Link>)}</div> : <p>{t("concept.noProblems")}</p>}</section>
        <LibraryResources entityType="concept" entityId={concept.id} />
      </article>
      <aside className="concept-aside"><section><GitFork size={18} /><h2>{t("concept.roadmaps")}</h2>{learningViews.length ? <ul>{learningViews.map((view) => <li key={view.href}><Link href={view.href}>{view.title}<ArrowRight size={14} /></Link></li>)}</ul> : <p>{t("concept.noRelated")}</p>}</section><section><CheckCircle2 size={18} /><h2>{t("common.prerequisites")}</h2><p>{related.filter((item) => item.relationType === "PREREQUISITE_OF").length || t("workspace.noPrerequisites")}</p></section></aside>
    </div>
  </div>;
}

import { notFound } from "next/navigation";
import { domains } from "@/content/domains";
import { exercises } from "@/content/exercises";
import { lessons } from "@/content/lessons";
import { problems } from "@/content/problems";
import { ConceptDetail } from "@/components/concepts/concept-detail";
import { conceptGraphService } from "@/lib/concepts/service";

export async function generateMetadata({ params }: { params: Promise<{ concept: string }> }) {
  const { concept: value } = await params;
  const concept = conceptGraphService.getConcept(value);
  return { title: concept?.name.en ?? "Concept", description: concept?.summary.en };
}

export default async function ConceptPage({ params }: { params: Promise<{ concept: string }> }) {
  const { concept: value } = await params;
  const concept = conceptGraphService.getConcept(value);
  if (!concept) notFound();
  const relations = conceptGraphService.listRelations({ conceptId: concept.id, direction: "both" });
  const related = relations.flatMap((relation) => {
    const id = relation.sourceConceptId === concept.id ? relation.targetConceptId : relation.sourceConceptId;
    const item = conceptGraphService.getConcept(id);
    return item ? [{ concept: item, relationType: relation.type }] : [];
  });
  const linkedLesson = lessons.find((lesson) => lesson.conceptIds.includes(concept.id));
  const linkedExercises = exercises.filter((exercise) => exercise.conceptIds.includes(concept.id)).slice(0, 6);
  const linkedProblems = problems.filter((problem) => problem.conceptIds.includes(concept.id)).slice(0, 6);
  const learningViews = concept.kind === "topic"
    ? domains.filter((domain) => domain.topicIds.includes(concept.provenance.legacyId)).flatMap((domain) => [
      { href: `/domains/${domain.slug}/roadmap`, title: `${domain.shortName} roadmap` },
      { href: `/domains/${domain.slug}/mindmap`, title: `${domain.shortName} mind map` },
    ])
    : [];
  return <ConceptDetail
    concept={concept}
    lesson={linkedLesson ? { id: linkedLesson.id, title: linkedLesson.title, href: linkedLesson.href, meta: `${linkedLesson.estimatedMinutes} min` } : undefined}
    related={related}
    exercises={linkedExercises.map((exercise) => ({ id: exercise.id, title: exercise.title, href: exercise.href, meta: `${exercise.mode} · ${exercise.estimatedMinutes} min` }))}
    problems={linkedProblems.map((problem) => ({ id: problem.id, title: problem.title, href: problem.href, meta: `${problem.difficulty} · ${problem.publicTestCount} public tests` }))}
    learningViews={learningViews}
  />;
}

import type { LocalizedConceptText } from "@/lib/domain/concepts";
import type { LearnExample, LearnLessonBlock, LearnReference, LessonManifest } from "@/lib/domain/learn-platform";
import type { LessonCandidate, LessonValidationContext } from "@/lib/domain/learn-validation/types";
import type { Locale } from "@/lib/types";

/** Presentation projections, never persisted or written back as content. */
export interface LessonRenderContext {
  subject: { id: string; slug: string; title: LocalizedConceptText };
  section: { id: string; title: LocalizedConceptText };
}
export interface LessonRenderResources {
  examples: LearnExample[];
  references: Array<Pick<LearnReference, "id" | "subjectId" | "slug" | "name" | "signature" | "description">>;
  lessons: Array<Pick<LessonManifest, "id" | "subjectId" | "slug" | "title">>;
}
export interface LessonRenderModel extends LessonCandidate {
  context: LessonRenderContext;
  resources: LessonRenderResources;
}

export function lessonText(text: LocalizedConceptText, locale: Locale) {
  return text[locale].trim() ? text[locale] : text.en;
}

export function resolveLessonRenderResources(blocks: readonly LearnLessonBlock[], context: Pick<LessonValidationContext, "examples" | "references" | "lessons">): LessonRenderResources {
  const exampleIds = new Set<string>(); const referenceIds = new Set<string>(); const lessonIds = new Set<string>();
  for (const block of blocks) {
    if (block.type === "example") exampleIds.add(block.exampleId);
    if (block.type === "references") block.referenceIds.forEach((id) => referenceIds.add(id));
    if (block.type === "related") block.lessonIds.forEach((id) => lessonIds.add(id));
  }
  return {
    examples: [...exampleIds].flatMap((id) => { const record = context.examples.get(id); return record ? [structuredClone(record)] : []; }),
    references: [...referenceIds].flatMap((id) => { const record = context.references.get(id); return record ? [{ id, subjectId: record.subjectId, slug: record.slug, name: record.name, ...(record.signature === undefined ? {} : { signature: record.signature }), description: { ...record.description } }] : []; }),
    lessons: [...lessonIds].flatMap((id) => { const record = context.lessons.get(id); return record ? [{ id, subjectId: record.subjectId, slug: record.slug, title: { ...record.title } }] : []; }),
  };
}

export function toLessonRenderModel(candidate: LessonCandidate, context: LessonValidationContext): LessonRenderModel {
  const subject = context.subjects.find((item) => item.id === candidate.lesson.subjectId);
  const section = subject?.sections.find((item) => item.id === candidate.lesson.sectionId);
  if (!subject || !section) throw new Error("Lesson presentation context unavailable");
  return {
    ...structuredClone(candidate),
    context: { subject: { id: subject.id, slug: subject.slug, title: { ...subject.title } }, section: { id: section.id, title: { ...section.title } } },
    resources: resolveLessonRenderResources(candidate.content?.blocks ?? [], context),
  };
}

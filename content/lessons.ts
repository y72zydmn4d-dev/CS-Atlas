import { domains } from "@/content/domains";
import { topicTranslationsVi } from "@/content/translations/vi";
import { topics } from "@/content/topics";
import { canonicalConceptIdForTopic } from "@/content/concepts/registry";
import type { Course, Lesson, LessonBlockRecord, LessonExample, LessonPlayground, LessonReference } from "@/lib/domain/learn";

function lessonId(topicId: string) {
  return `lesson:${topicId}`;
}

function blockRecordId(topicId: string, blockId: string) {
  return `lesson-block:${topicId}:${blockId}`;
}

function hasVietnameseBlock(topicId: string, blockId: string) {
  return topicTranslationsVi[topicId]?.content?.some((block) => block.id === blockId) ?? false;
}

export const lessonBlocks: LessonBlockRecord[] = topics.flatMap((topic) => topic.content.map((block) => ({
  id: blockRecordId(topic.id, block.id),
  lessonId: lessonId(topic.id),
  legacyBlockId: block.id,
  type: block.type,
  availableLocales: hasVietnameseBlock(topic.id, block.id) ? ["en", "vi"] : ["en"],
  citationSourceIds: (block.citations ?? []).map((citation) => citation.sourceId),
  provenance: { source: "topic-registry", sourceId: topic.id, sourceVersion: topic.revision.version, reviewedAt: topic.revision.reviewedAt, sourceIds: topic.revision.sourceIds },
})));

export const lessonReferences: LessonReference[] = topics.flatMap((topic) => {
  const conceptIds: LessonReference["conceptIds"] = [canonicalConceptIdForTopic(topic.id)];
  return topic.content.flatMap((block) => block.type === "further-reading" ? block.sourceIds.map((sourceId) => ({
    id: `lesson-reference:${topic.id}:${block.id}:${sourceId}`,
    lessonId: lessonId(topic.id), conceptIds, sourceId, blockId: blockRecordId(topic.id, block.id),
  })) : []);
});

export const lessonExamples: LessonExample[] = topics.flatMap((topic) => {
  const conceptIds: LessonExample["conceptIds"] = [canonicalConceptIdForTopic(topic.id)];
  return topic.content.flatMap((block) => block.type === "worked-example" ? [{
    id: `lesson-example:${topic.id}:${block.id}`, lessonId: lessonId(topic.id), conceptIds, blockId: blockRecordId(topic.id, block.id), kind: "worked-example" as const,
  }] : []);
});

// Existing lesson code is explanatory source text. A future executable playground
// requires an explicitly approved browser runtime and a separate capability record.
export const lessonPlaygrounds: LessonPlayground[] = topics.flatMap((topic) => {
  const conceptIds: LessonPlayground["conceptIds"] = [canonicalConceptIdForTopic(topic.id)];
  return topic.content.flatMap((block) => block.type === "code" ? [{
    id: `lesson-playground:${topic.id}:${block.id}`, lessonId: lessonId(topic.id), conceptIds, blockId: blockRecordId(topic.id, block.id), syntaxLanguage: block.language, runtime: "none" as const, availability: "unavailable" as const,
  }] : []);
});

export const lessons: Lesson[] = topics.map((topic) => ({
  id: lessonId(topic.id),
  slug: topic.slug,
  conceptIds: [canonicalConceptIdForTopic(topic.id)],
  topicId: topic.id,
  title: { en: topic.title, vi: topicTranslationsVi[topic.id]?.title ?? topic.title },
  summary: { en: topic.summary, vi: topicTranslationsVi[topic.id]?.summary ?? topic.summary },
  estimatedMinutes: topic.estimatedMinutes,
  contentVersion: topic.revision.version,
  translationStatus: topicTranslationsVi[topic.id]?.status ?? "english-only",
  maturity: topic.revision.contentLevel,
  blockIds: topic.content.map((block) => blockRecordId(topic.id, block.id)),
  referenceIds: lessonReferences.filter((reference) => reference.lessonId === lessonId(topic.id)).map((reference) => reference.id),
  exampleIds: lessonExamples.filter((example) => example.lessonId === lessonId(topic.id)).map((example) => example.id),
  playgroundIds: lessonPlaygrounds.filter((playground) => playground.lessonId === lessonId(topic.id)).map((playground) => playground.id),
  provenance: { source: "topic-registry", sourceId: topic.id, sourceVersion: topic.revision.version, reviewedAt: topic.revision.reviewedAt, sourceIds: topic.revision.sourceIds },
  href: `/learn/${topic.slug}`,
}));

export const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
export const lessonBySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson]));

export const courses: Course[] = domains.map((domain) => {
  const lessonIds = domain.topicIds.map((topicId) => `lesson:${topicId}`);
  return {
    id: `course:${domain.id}`,
    slug: domain.slug,
    domainId: domain.id,
    title: { en: domain.name, vi: domain.name },
    lessonIds,
    items: lessonIds.map((lessonId, index) => ({ id: `${domain.id}:${lessonId}`, lessonId, order: index + 1 })),
    provenance: { source: "domain-registry", sourceId: domain.id, contentVersion: 1 },
  };
});

export const courseByDomainId = new Map(courses.map((course) => [course.domainId, course]));

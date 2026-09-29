import { domains } from "@/content/domains";
import { topicTranslationsVi } from "@/content/translations/vi";
import { topics } from "@/content/topics";
import { canonicalConceptIdForTopic } from "@/content/concepts/registry";
import type { Course, Lesson } from "@/lib/domain/learn";

export const lessons: Lesson[] = topics.map((topic) => ({
  id: `lesson:${topic.id}`,
  slug: topic.slug,
  conceptIds: [canonicalConceptIdForTopic(topic.id)],
  topicId: topic.id,
  title: { en: topic.title, vi: topicTranslationsVi[topic.id]?.title ?? topic.title },
  summary: { en: topic.summary, vi: topicTranslationsVi[topic.id]?.summary ?? topic.summary },
  estimatedMinutes: topic.estimatedMinutes,
  contentVersion: topic.revision.version,
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
  };
});

export const courseByDomainId = new Map(courses.map((course) => [course.domainId, course]));

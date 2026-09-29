import { notFound } from "next/navigation";
import { domainById, topicById } from "@/content";
import { lessonBySlug, lessons } from "@/content/lessons";
import { TopicPageView } from "@/components/topic-page-view";

export function generateStaticParams() { return lessons.map((lesson) => ({ lesson: lesson.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson: slug } = await params;
  const lesson = lessonBySlug.get(slug);
  return { title: lesson?.title.en ?? "Lesson", description: lesson?.summary.en };
}

export default async function LearnLessonPage({ params }: { params: Promise<{ lesson: string }> }) {
  const { lesson: slug } = await params;
  const lesson = lessonBySlug.get(slug);
  const topic = lesson ? topicById.get(lesson.topicId) : undefined;
  const domain = topic ? domainById.get(topic.domainId) : undefined;
  if (!lesson || !topic || !domain) notFound();
  const related = [...topic.relatedTopicIds, ...topic.prerequisiteIds].map((id) => topicById.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const index = domain.topicIds.indexOf(topic.id);
  return <TopicPageView topic={topic} domain={domain} related={related} previous={topicById.get(domain.topicIds[index - 1])} next={topicById.get(domain.topicIds[index + 1])} routeBase="/learn" />;
}

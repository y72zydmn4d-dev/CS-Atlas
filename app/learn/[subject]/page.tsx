import { permanentRedirect, notFound } from "next/navigation";
import { domainById, topicById } from "@/content";
import { learnRouteAliasByPath, learnSubjectBySlug, legacyLearnLessonBySlug } from "@/content/learn/registry";
import { SubjectHome } from "@/components/learn/subject-home";
import { TopicPageView } from "@/components/topic-page-view";

export function generateStaticParams() {
  return [...new Set([...learnSubjectBySlug.keys(), ...legacyLearnLessonBySlug.keys()])].map((subject) => ({ subject }));
}

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }) {
  const { subject: slug } = await params;
  const subject = learnSubjectBySlug.get(slug);
  if (subject) return { title: `${subject.title.en} Tutorial`, description: subject.description.en };
  const lesson = legacyLearnLessonBySlug.get(slug);
  return { title: lesson?.title.en ?? "Learn", description: lesson?.summary.en };
}

export default async function LearnSubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject: slug } = await params;
  const subject = learnSubjectBySlug.get(slug);
  if (subject) return <SubjectHome subject={subject} />;
  const alias = learnRouteAliasByPath.get(`/learn/${slug}`);
  if (alias) permanentRedirect(alias.destination);
  const legacyLesson = legacyLearnLessonBySlug.get(slug);
  const topic = legacyLesson ? topicById.get(legacyLesson.topicId) : undefined;
  const domain = topic ? domainById.get(topic.domainId) : undefined;
  if (!legacyLesson || !topic || !domain) notFound();
  const related = [...topic.relatedTopicIds, ...topic.prerequisiteIds].map((id) => topicById.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const index = domain.topicIds.indexOf(topic.id);
  return <TopicPageView topic={topic} domain={domain} related={related} previous={topicById.get(domain.topicIds[index - 1])} next={topicById.get(domain.topicIds[index + 1])} routeBase="/learn" />;
}

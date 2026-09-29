import { notFound } from "next/navigation";
import { domainById, topicById, topicBySlug, topics } from "@/content";
import { TopicPageView } from "@/components/topic-page-view";

export function generateStaticParams() { return topics.map((topic) => ({ topic: topic.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) { const { topic } = await params; const item = topicBySlug.get(topic); return { title: item?.title ?? "Topic", description: item?.summary }; }

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: slug } = await params;
  const topic = topicBySlug.get(slug);
  if (!topic) notFound();
  const domain = domainById.get(topic.domainId);
  if (!domain) notFound();
  const related = [...topic.relatedTopicIds, ...topic.prerequisiteIds]
    .map((id) => topicById.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const index = domain.topicIds.indexOf(topic.id);
  return <TopicPageView topic={topic} domain={domain} related={related} previous={topicById.get(domain.topicIds[index - 1])} next={topicById.get(domain.topicIds[index + 1])} />;
}

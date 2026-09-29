import { topicById, topics } from "@/content";
import type { Domain, ProgressStatus, Topic } from "@/lib/types";

/** Active work first, then satisfied prerequisites; content order breaks ties. */
export function nextDomainTopic(domain: Domain, progress: Record<string, ProgressStatus>): Topic | undefined {
  const remaining = domain.topicIds.flatMap((id) => { const topic = topicById.get(id); return topic && progress[id] !== "completed" ? [topic] : []; });
  return remaining.find((topic) => progress[topic.id] === "in-progress")
    ?? remaining.find((topic) => topic.prerequisiteIds.every((id) => progress[id] === "completed"))
    ?? remaining[0];
}
export function activeTopics(progress: Record<string, ProgressStatus>): Topic[] {
  return topics.filter((topic) => progress[topic.id] === "in-progress");
}

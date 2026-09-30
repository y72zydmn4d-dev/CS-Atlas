import "server-only";
import { requireStudioEnabled } from "@/lib/studio/guard.server";

export async function readStudioManifests() {
  requireStudioEnabled();
  const { learnSubjectsForNavigation } = await import("@/content/learn/registry");
  return learnSubjectsForNavigation;
}

/** Current body source is monolithic. Load it only on a valid lesson selection. */
export async function readStudioLessonBody(lessonId: string) {
  requireStudioEnabled();
  const { learnContentByLessonId } = await import("@/content/learn/lesson-content");
  return learnContentByLessonId.get(lessonId) ?? null;
}

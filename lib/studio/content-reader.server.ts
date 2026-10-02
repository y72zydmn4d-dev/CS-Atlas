import "server-only";
import { requireStudioEnabled } from "@/lib/studio/guard.server";
import { learnRepositoryRoot, readCanonicalSubjects, readCanonicalLessonBody } from "@/lib/learn/content-storage.server";

export async function readStudioManifests() {
  requireStudioEnabled();
  return (await readCanonicalSubjects(await learnRepositoryRoot())).sort((a, b) => a.navigationOrder - b.navigationOrder);
}

/** Only the selected canonical JSON body, no body registry import. */
export async function readStudioLessonBody(lessonId: string) {
  requireStudioEnabled();
  const root = await learnRepositoryRoot();
  const lesson = (await readCanonicalSubjects(root)).flatMap(s => s.sections.flatMap(s => s.lessons)).find(l => l.id === lessonId);
  return lesson ? readCanonicalLessonBody(root, lesson) : null;
}

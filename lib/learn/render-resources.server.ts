import "server-only";
import { learnExampleById, learnReferenceById } from "@/content/learn/lesson-content";
import { learnLessonById } from "@/content/learn/registry";
import type { LearnLessonBlock } from "@/lib/domain/learn-platform";
import { resolveLessonRenderResources } from "@/lib/domain/learn-rendering";

/** Selected public presentation records only; registry lookups never enter the client renderer. */
export function readLessonRenderResources(blocks: readonly LearnLessonBlock[]) {
  return resolveLessonRenderResources(blocks, { examples: learnExampleById, references: learnReferenceById, lessons: learnLessonById });
}

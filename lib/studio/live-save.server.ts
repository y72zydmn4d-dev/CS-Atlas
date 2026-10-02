import "server-only";
import { liveLessonWriter } from "./writer/live.server";
import { existingLessonService } from "./save.server";
import { learnRepositoryRoot } from "@/lib/learn/content-storage.server";
import { guardWriter } from "./writer/paths.server";
export async function liveExistingLessonService() {
  guardWriter();
  return existingLessonService(await liveLessonWriter(), await learnRepositoryRoot());
}

import { revalidatePath } from "next/cache";
import { liveExistingLessonService } from "@/lib/studio/live-save.server";
import { existingLessonHandlers } from "@/lib/studio/save-request.server";
export const runtime = "nodejs";
const handler = existingLessonHandlers(liveExistingLessonService, href => { revalidatePath(href); revalidatePath(href.slice(0, href.lastIndexOf("/"))); });
export const GET = handler;
export const PUT = handler;

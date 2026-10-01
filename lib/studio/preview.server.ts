import "server-only";
import { requireStudioEnabled } from "@/lib/studio/guard.server";
import { validateStudioLessonCandidate } from "@/lib/studio/validation.server";
import { toLessonRenderModel } from "@/lib/domain/learn-rendering";
import type { StudioPreviewResponse } from "@/lib/studio/preview";

/** Exact submitted draft, fresh canonical membership, ephemeral presentation. Never writes. */
export async function prepareStudioLessonPreview(subjectId: string, lessonId: string, input: unknown): Promise<StudioPreviewResponse | null> {
  requireStudioEnabled();
  const result = await validateStudioLessonCandidate(subjectId, lessonId, input);
  if (!result) return null;
  return { version: 1, report: result.report, model: result.report.renderable && result.candidate ? toLessonRenderModel(result.candidate, result.context) : null };
}

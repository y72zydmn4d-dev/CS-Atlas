import "server-only";
import { createCanonicalLessonWriter } from "./writer/service.server";
import { AuthoringWriteError } from "./writer/types.server";
import { guardWriter } from "./writer/paths.server";
import type { SaveResult } from "./save";
import { isRevision } from "./save";
import { isStudioSubjectId, isStudioLessonId } from "./navigation";
import { readCanonicalSubjects, readCanonicalLessonBody } from "@/lib/learn/content-storage.server";
import type { StudioLessonInspection } from "./types";
import { draftFingerprint } from "./draft";

type Writer = ReturnType<typeof createCanonicalLessonWriter>;
/** Trusted service composition seam; never a request-provided root or writer. */
export function existingLessonService(writer: Writer, root: string) {
  async function load(subjectId: string, lessonId: string): Promise<StudioLessonInspection> {
    guardWriter();
    if (!isStudioSubjectId(subjectId) || !isStudioLessonId(lessonId)) throw new AuthoringWriteError("VALIDATION_FAILED");
    const loaded = await writer.loadExistingLesson(subjectId, lessonId);
    // Normal Learn disk reader, not merely a return of the just-written draft.
    const subject = (await readCanonicalSubjects(root)).find(s => s.id === subjectId);
    const section = subject?.sections.find(s => s.lessons.some(l => l.id === lessonId));
    const lesson = section?.lessons.find(l => l.id === lessonId);
    if (!subject || !section || !lesson) throw new AuthoringWriteError("VALIDATION_FAILED");
    const content = await readCanonicalLessonBody(root, lesson);
    const confirmed = await writer.loadExistingLesson(subjectId, lessonId);
    if (loaded.revision.fingerprint !== confirmed.revision.fingerprint || draftFingerprint({ lesson, content }) !== draftFingerprint(confirmed.draft)) throw new AuthoringWriteError("REVISION_CONFLICT");
    return { lesson, content, section: { id: section.id, title: section.title, order: section.order }, learnerHref: `/learn/${subject.slug}/${lesson.slug}`, baseRevision: confirmed.revision.fingerprint };
  }
  return { load, async save(input: unknown): Promise<SaveResult> {
    guardWriter();
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some(k => !["subjectId", "lessonId", "draft", "baseRevision"].includes(k)) || !("subjectId" in input) || typeof input.subjectId !== "string" || !isStudioSubjectId(input.subjectId) || !("lessonId" in input) || typeof input.lessonId !== "string" || !isStudioLessonId(input.lessonId) || !("draft" in input) || !("baseRevision" in input) || !isRevision(input.baseRevision)) return { status: "failed", code: "INVALID_REQUEST" };
    let committedOperation: string | null = null;
    try {
      const latest = await writer.loadExistingLesson(input.subjectId, input.lessonId);
      if (latest.revision.fingerprint !== input.baseRevision) return { status: "conflict", code: "REVISION_CONFLICT" };
      const receipt = await writer.validateExistingLesson(input.subjectId, input.lessonId, input.draft);
      if (receipt.report.hasErrors) return { status: "validation-failed", report: receipt.report };
      const plan = await writer.planExistingLessonUpdate({ ...input, subjectId: input.subjectId, lessonId: input.lessonId, draft: input.draft, baseRevision: latest.revision, receipt });
      const result = plan.changes.length ? await writer.executeExistingLessonUpdate(plan) : { changedFiles: [] };
      if (plan.changes.length) committedOperation = plan.operationId;
      return { status: "saved", inspection: await load(input.subjectId, input.lessonId), changedFiles: result.changedFiles };
    } catch (error) {
      if (committedOperation) return { status: "failed", code: "READBACK_FAILED", operationId: committedOperation };
      if (error instanceof AuthoringWriteError) {
        if (error.code === "REVISION_CONFLICT") return { status: "conflict", code: "REVISION_CONFLICT" };
        return { status: "failed", code: error.code, ...(error.operationId ? { operationId: error.operationId } : {}) };
      }
      return { status: "failed", code: "SAVE_SERVICE_FAILED" };
    }
  } };
}

import type { StudioLessonInspection } from "./types";
import type { ValidationReport } from "@/lib/domain/learn-validation/types";
import { parseLessonCandidate } from "@/lib/domain/learn-validation/parse";
import { isValidationReport } from "./validation";

export type SaveResult =
  | { status: "saved"; inspection: StudioLessonInspection; changedFiles: string[] }
  | { status: "validation-failed"; report: ValidationReport }
  | { status: "conflict"; code: "REVISION_CONFLICT" }
  | { status: "failed"; code: string; operationId?: string };
export const isRevision = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
export function isSavedInspection(value: unknown): value is StudioLessonInspection & { baseRevision: string } {
  if (!value || typeof value !== "object" || !("baseRevision" in value) || !isRevision(value.baseRevision) || !("lesson" in value) || !("content" in value) || !("learnerHref" in value) || !("section" in value)) return false;
  const candidate = parseLessonCandidate({ lesson: value.lesson, content: value.content }).candidate;
  const section = value.section;
  return Boolean(candidate && value.learnerHref === `/learn/${candidate.lesson.subjectId}/${candidate.lesson.slug}` && section && typeof section === "object" && "id" in section && section.id === candidate.lesson.sectionId && "order" in section && typeof section.order === "number" && "title" in section && section.title && typeof section.title === "object" && "en" in section.title && typeof section.title.en === "string" && "vi" in section.title && typeof section.title.vi === "string");
}
export function isSaveResult(value: unknown): value is SaveResult {
  if (!value || typeof value !== "object" || !("status" in value)) return false;
  if (value.status === "saved") return "inspection" in value && isSavedInspection(value.inspection) && "changedFiles" in value && Array.isArray(value.changedFiles) && value.changedFiles.length <= 3 && value.changedFiles.every(p => typeof p === "string" && /^content\/learn\/(?:subjects\/[a-z0-9-]+\.json|lessons\/[a-z0-9-]+\/[a-z0-9-]+\.json|generated\/lesson-content-index\.ts)$/.test(p));
  if (value.status === "validation-failed") return "report" in value && isValidationReport(value.report);
  if (value.status === "conflict") return "code" in value && value.code === "REVISION_CONFLICT";
  return value.status === "failed" && "code" in value && typeof value.code === "string" && /^[A-Z_]{1,80}$/.test(value.code) && (!("operationId" in value) || (typeof value.operationId === "string" && /^[a-f0-9-]{36}$/.test(value.operationId)));
}

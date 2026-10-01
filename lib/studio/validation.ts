import type { AuthoringLessonDraft } from "@/lib/studio/draft";
import { validationLimits, type ValidationReport } from "@/lib/domain/learn-validation/types";
import { hasRenderableIssues } from "@/lib/domain/learn-validation/renderability";

export interface StudioValidationRequest { subjectId: string; lessonId: string; draft: AuthoringLessonDraft }
const object = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const hash = (value: unknown) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
/** Validate the narrow response before displaying a server verdict. */
export function isValidationReport(value: unknown): value is ValidationReport {
  if (!object(value) || value.version !== 1 || !["invalid", "review", "valid"].includes(String(value.status)) || typeof value.hasErrors !== "boolean" || typeof value.canPersistInFuture !== "boolean" || typeof value.renderable !== "boolean" || !hash(value.contextFingerprint) || !(value.draftFingerprint === null || hash(value.draftFingerprint)) || typeof value.subjectId !== "string" || typeof value.lessonId !== "string" || !object(value.counts) || !Array.isArray(value.issues) || value.issues.length > validationLimits.issues) return false;
  const counts = { ERROR: 0, WARNING: 0, INFO: 0 };
  for (const issue of value.issues) {
    if (!object(issue) || typeof issue.code !== "string" || !/^[A-Z][A-Z0-9_]{0,100}$/.test(issue.code) || typeof issue.path !== "string" || issue.path.length > 1000 || typeof issue.message !== "string" || issue.message.length > 100_000 || (issue.severity !== "ERROR" && issue.severity !== "WARNING" && issue.severity !== "INFO")) return false;
    for (const key of ["entityId", "blockId", "relationshipType", "relatedCanonicalId"] as const) if (issue[key] !== undefined && (typeof issue[key] !== "string" || issue[key].length > validationLimits.id)) return false;
    if (issue.blockIndex !== undefined && (typeof issue.blockIndex !== "number" || !Number.isInteger(issue.blockIndex) || issue.blockIndex < 0 || issue.blockIndex >= validationLimits.blocks)) return false;
    counts[issue.severity]++;
  }
  return Object.entries(counts).every(([key, count]) => object(value.counts) && value.counts[key] === count)
    && value.hasErrors === (counts.ERROR > 0) && value.canPersistInFuture === !value.hasErrors
    && value.status === (counts.ERROR ? "invalid" : counts.WARNING ? "review" : "valid")
    && (!value.renderable || (value.draftFingerprint !== null && hasRenderableIssues(value.issues)));
}

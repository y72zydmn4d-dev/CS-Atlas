import "server-only";
import { randomUUID } from "node:crypto";
import { readFile, lstat } from "node:fs/promises";
import { validateCanonicalLesson } from "@/lib/domain/learn-validation";
import { validateExistingLessonIdentity } from "@/lib/domain/learn-validation/existing";
import { canRenderLesson } from "@/lib/domain/learn-validation/renderability";
import { boundedIssues, type ValidationReport, type LessonCandidate } from "@/lib/domain/learn-validation/types";
import { draftFingerprint } from "@/lib/studio/draft";
import { targetPath, bodyIndexPath, checkedPath, isMissing, guardWriter } from "./paths.server";
import { canonicalJson, generateBodyIndex, serializeBody, serializeSubject, sha256 } from "./serialization.server";
import { decodeSnapshot, type CanonicalSnapshot } from "./repository.server";
import { AuthoringWriteError, writerLimits, type AuthoringWritePlan, type LogicalTarget, type PlannedFileChange } from "./types.server";

export const candidateHash = (draft: LessonCandidate) => sha256(draftFingerprint(draft));
export function validateUpdate(snapshot: CanonicalSnapshot, subjectId: string, lessonId: string, input: unknown) {
  // Derive/validate path-shaped identity even before membership resolution.
  targetPath({ kind: "body", subjectId, lessonId });
  const persisted = snapshot.lessons.get(lessonId);
  if (!persisted || persisted.subjectId !== subjectId) throw new AuthoringWriteError("VALIDATION_FAILED");
  const context = { subjects: snapshot.subjects, lessons: snapshot.lessons, ...snapshot.dependencies, examples: new Map(snapshot.dependencies.examples.map((item) => [item.id, item])), references: new Map(snapshot.dependencies.references.map((item) => [item.id, item])) };
  const result = validateCanonicalLesson(input, context);
  if (result.candidate) result.issues.push(...validateExistingLessonIdentity(result.candidate, persisted, snapshot.bodies.get(lessonId) ?? null));
  // Removing persisted bodies is a delete operation, deliberately not implemented.
  if (result.candidate && !result.candidate.content && snapshot.bodies.has(lessonId)) result.issues.push({ code: "BODY_REMOVAL_UNSUPPORTED", severity: "ERROR", path: "content", message: "Existing body removal is not supported by this update operation." });
  const issues = boundedIssues(result.issues);
  const counts = { ERROR: 0, WARNING: 0, INFO: 0 };
  for (const issue of issues) counts[issue.severity]++;
  const report: ValidationReport = { version: 1, status: counts.ERROR ? "invalid" : counts.WARNING ? "review" : "valid", hasErrors: counts.ERROR > 0, canPersistInFuture: counts.ERROR === 0, renderable: canRenderLesson(result.candidate, issues), counts, issues, subjectId, lessonId, draftFingerprint: result.candidate ? candidateHash(result.candidate) : null, contextFingerprint: snapshot.revision.fingerprint };
  return { report, candidate: result.candidate };
}
export function buildLessonPlan(snapshot: CanonicalSnapshot, subjectId: string, lessonId: string, candidate: LessonCandidate, report: ValidationReport): AuthoringWritePlan {
  guardWriter();
  if (!report.canPersistInFuture || report.hasErrors || report.draftFingerprint !== candidateHash(candidate) || report.contextFingerprint !== snapshot.revision.fingerprint) throw new AuthoringWriteError("VALIDATION_STALE");
  const normalized = structuredClone(candidate);
  const priorBody = snapshot.bodies.get(lessonId);
  if (normalized.content) {
    if (priorBody && canonicalJson(normalized.content) !== canonicalJson(priorBody)) normalized.content.version = priorBody.version + 1;
    normalized.lesson.contentSource = targetPath({ kind: "body", subjectId, lessonId });
  }
  const subjects = structuredClone(snapshot.subjects);
  for (const subject of subjects) for (const section of subject.sections) section.lessons = section.lessons.map((lesson) => lesson.id === lessonId ? normalized.lesson : lesson);
  const subject = subjects.find((item) => item.id === subjectId);
  if (!subject) throw new AuthoringWriteError("VALIDATION_FAILED");
  const changes: PlannedFileChange[] = [];
  function add(target: LogicalTarget, text: string, ownership: PlannedFileChange["ownership"]) {
    const relativePath = targetPath(target); const prior = snapshot.texts.get(relativePath);
    // Avoid formatting-only rewrites when an unchanged record was manually formatted.
    if (prior === text || (target.kind !== "body-index" && prior !== undefined && canonicalJson(JSON.parse(prior)) === text)) return;
    changes.push({ target, relativePath, action: prior === undefined ? "CREATE" : "UPDATE", ownership, previousHash: prior === undefined ? null : sha256(prior), nextHash: sha256(text), text, serializerVersion: 1 });
  }
  if (normalized.content) add({ kind: "body", subjectId, lessonId }, serializeBody(normalized.lesson, normalized.content), "STUDIO_SAFE");
  add({ kind: "subject", subjectId }, serializeSubject(subject), "STUDIO_SAFE");
  const bodyLessons = [...snapshot.lessons.values()].filter((lesson) => snapshot.bodies.has(lesson.id) || (lesson.id === lessonId && normalized.content));
  add({ kind: "body-index" }, generateBodyIndex(bodyLessons), "GENERATED");
  const merged = new Map(snapshot.texts);
  for (const change of changes) merged.set(change.relativePath, change.text);
  decodeSnapshot(merged, snapshot.dependencies);
  return deepFreeze({ operationId: randomUUID(), operationType: "UPDATE_EXISTING_LESSON", subjectId, lessonId, baseRevision: snapshot.revision, draftFingerprint: candidateHash(candidate), validation: structuredClone(report), changes });
}
export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") { Object.freeze(value); for (const entry of Object.values(value)) deepFreeze(entry); }
  return value;
}
/** Internal preflight, also exercised with adversarial fabricated entries in tests. */
export async function checkPlanTargets(root: string, plan: AuthoringWritePlan): Promise<void> {
  guardWriter();
  if (plan.operationType !== "UPDATE_EXISTING_LESSON" || plan.changes.length > writerLimits.files) throw new AuthoringWriteError("PREFLIGHT_FAILED");
  targetPath({ kind: "body", subjectId: plan.subjectId, lessonId: plan.lessonId });
  const seen = new Set<string>(); let bytes = 0;
  for (const change of plan.changes) {
    const derived = targetPath(change.target);
    if (change.relativePath !== derived || ("subjectId" in change.target && change.target.subjectId !== plan.subjectId) || (change.target.kind === "body" && change.target.lessonId !== plan.lessonId) || change.ownership !== (change.target.kind === "body-index" ? "GENERATED" : "STUDIO_SAFE")) throw new AuthoringWriteError("OWNERSHIP_REJECTED");
    if (seen.has(derived)) throw new AuthoringWriteError("PREFLIGHT_FAILED", [derived]); seen.add(derived);
    const size = Buffer.byteLength(change.text);
    if (size > writerLimits.fileBytes || (bytes += size) > writerLimits.transactionBytes || change.serializerVersion !== 1 || sha256(change.text) !== change.nextHash || !["CREATE", "UPDATE"].includes(change.action) || (change.action === "CREATE") !== (change.previousHash === null)) throw new AuthoringWriteError("PREFLIGHT_FAILED", [derived]);
    const absolute = await checkedPath(root, derived, true);
    let previous: string | null;
    try {
      const stat = await lstat(absolute);
      if (!stat.isFile() || stat.size > writerLimits.fileBytes) throw new AuthoringWriteError("PREFLIGHT_FAILED", [derived]);
      previous = sha256(await readFile(absolute));
    } catch (error) { if (!isMissing(error)) throw error; previous = null; }
    if (previous !== change.previousHash) throw new AuthoringWriteError("REVISION_CONFLICT", [derived]);
  }
  if (seen.has(bodyIndexPath) && !plan.changes.some((change) => change.target.kind === "body" && change.action === "CREATE")) throw new AuthoringWriteError("PREFLIGHT_FAILED");
}

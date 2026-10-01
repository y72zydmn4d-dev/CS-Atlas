import "server-only";
import { discoverRepositoryRoot, guardWriter } from "./paths.server";
import { readCanonicalSnapshot, assertRevision } from "./repository.server";
import { candidateHash, validateUpdate, buildLessonPlan, checkPlanTargets, deepFreeze } from "./planning.server";
import { executeTransaction, recoverTransaction } from "./transaction.server";
import { AuthoringWriteError, type CanonicalRevision, type AuthoritativeWriteReceipt, type AuthoringWritePlan, type IssuedPlanState, type LessonUpdateRequest, type WriterDependencies } from "./types.server";

/** Internal server composition. No route/action/client imports this module in F. */
export function createCanonicalLessonWriter(dependencies: WriterDependencies) {
  const receipts = new WeakMap<AuthoritativeWriteReceipt, { fingerprint: string; revision: string; subjectId: string; lessonId: string }>();
  const plans = new WeakMap<AuthoringWritePlan, IssuedPlanState>();
  async function root() { guardWriter(); return discoverRepositoryRoot(dependencies.rootAnchor); }
  async function snapshot(expected?: CanonicalRevision) {
    try { return await readCanonicalSnapshot(await root(), dependencies.readDependencies, expected); }
    catch (error) { if (error instanceof AuthoringWriteError) throw error; throw new AuthoringWriteError("PREFLIGHT_FAILED"); }
  }
  return {
    async loadExistingLesson(subjectId: string, lessonId: string) {
      const source = await snapshot();
      const lesson = source.lessons.get(lessonId);
      if (!lesson || lesson.subjectId !== subjectId) throw new AuthoringWriteError("VALIDATION_FAILED");
      return { draft: structuredClone({ lesson, content: source.bodies.get(lessonId) ?? null }), revision: source.revision };
    },
    async validateExistingLesson(subjectId: string, lessonId: string, draft: unknown) {
      const source = await snapshot();
      const result = validateUpdate(source, subjectId, lessonId, draft);
      const receipt: AuthoritativeWriteReceipt = deepFreeze({ report: result.report });
      if (result.candidate && !result.report.hasErrors) receipts.set(receipt, { fingerprint: candidateHash(result.candidate), revision: source.revision.fingerprint, subjectId, lessonId });
      return receipt;
    },
    async planExistingLessonUpdate(request: LessonUpdateRequest): Promise<AuthoringWritePlan> {
      guardWriter();
      if (!request || typeof request !== "object" || Array.isArray(request)) throw new AuthoringWriteError("PREFLIGHT_FAILED");
      if (Object.keys(request).some((key) => !["subjectId", "lessonId", "draft", "baseRevision", "receipt"].includes(key))) throw new AuthoringWriteError("OWNERSHIP_REJECTED");
      const source = await snapshot(request.baseRevision);
      assertRevision(request.baseRevision, source.revision);
      const ticket = receipts.get(request.receipt);
      if (!ticket) throw new AuthoringWriteError(request.receipt?.report?.hasErrors ? "VALIDATION_FAILED" : "VALIDATION_STALE");
      const result = validateUpdate(source, request.subjectId, request.lessonId, request.draft);
      if (!result.candidate || result.report.hasErrors) throw new AuthoringWriteError("VALIDATION_FAILED");
      if (ticket.fingerprint !== candidateHash(result.candidate) || ticket.revision !== source.revision.fingerprint || ticket.subjectId !== request.subjectId || ticket.lessonId !== request.lessonId) throw new AuthoringWriteError("VALIDATION_STALE");
      const plan = buildLessonPlan(source, request.subjectId, request.lessonId, result.candidate, result.report);
      try { await checkPlanTargets(await root(), plan); }
      catch (error) { if (error instanceof AuthoringWriteError) throw error; throw new AuthoringWriteError("PREFLIGHT_FAILED", [], plan.operationId); }
      // Isolated copies; callers cannot alter what execution revalidates.
      plans.set(plan, { candidate: structuredClone(result.candidate), request: { ...request, draft: structuredClone(result.candidate) } });
      return plan;
    },
    async executeExistingLessonUpdate(plan: AuthoringWritePlan) {
      const repositoryRoot = await root();
      const issued = plans.get(plan);
      if (!issued) throw new AuthoringWriteError("PREFLIGHT_FAILED");
      try {
        return await executeTransaction(repositoryRoot, plan, dependencies, async () => {
          const fresh = await readCanonicalSnapshot(repositoryRoot, dependencies.readDependencies, plan.baseRevision);
          assertRevision(plan.baseRevision, fresh.revision);
          const result = validateUpdate(fresh, plan.subjectId, plan.lessonId, issued.candidate);
          if (!result.candidate || result.report.hasErrors) throw new AuthoringWriteError("VALIDATION_FAILED");
          const rebuilt = buildLessonPlan(fresh, plan.subjectId, plan.lessonId, result.candidate, result.report);
          if (JSON.stringify(rebuilt.changes) !== JSON.stringify(plan.changes) || rebuilt.draftFingerprint !== plan.draftFingerprint) throw new AuthoringWriteError("PREFLIGHT_FAILED");
        });
      } catch (error) { if (error instanceof AuthoringWriteError) throw error; throw new AuthoringWriteError("PREFLIGHT_FAILED", [], plan.operationId); }
      finally { plans.delete(plan); }
    },
    async recoverAbandonedOperation(operationId: string, confirmProcessStopped: boolean) {
      const repositoryRoot = await root();
      try { await recoverTransaction(repositoryRoot, operationId, confirmProcessStopped, async () => { await readCanonicalSnapshot(repositoryRoot, dependencies.readDependencies); }); }
      catch (error) { if (error instanceof AuthoringWriteError) throw error; throw new AuthoringWriteError("RECOVERY_REQUIRED", [], operationId); }
    },
  };
}

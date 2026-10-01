import "server-only";
import type { LearnExample, LearnQuizQuestion, LearnReference, LearnRouteAlias } from "@/lib/domain/learn-platform";
import type { LessonCandidate, ValidationReport } from "@/lib/domain/learn-validation/types";

export type WriterErrorCode = "WRITE_DISABLED" | "STORAGE_NOT_READY" | "VALIDATION_FAILED" | "VALIDATION_STALE" | "REVISION_CONFLICT" | "PATH_REJECTED" | "OWNERSHIP_REJECTED" | "SERIALIZATION_FAILED" | "PREFLIGHT_FAILED" | "WRITE_LOCKED" | "RECOVERY_REQUIRED" | "STAGING_FAILED" | "COMMIT_FAILED" | "VERIFY_FAILED" | "ROLLBACK_FAILED";
export class AuthoringWriteError extends Error {
  constructor(readonly code: WriterErrorCode, readonly resources: readonly string[] = [], readonly operationId?: string, readonly conflict?: { expectedRevision: string; currentRevision: string }) {
    super(code); this.name = "AuthoringWriteError";
  }
}
export const writerLimits = { files: 3, fileBytes: 2 * 1024 * 1024, transactionBytes: 4 * 1024 * 1024, inventory: 2000, snapshotBytes: 32 * 1024 * 1024 } as const;
export type LogicalTarget = { kind: "subject"; subjectId: string } | { kind: "body"; subjectId: string; lessonId: string } | { kind: "body-index" };
export interface PlannedFileChange {
  readonly target: LogicalTarget;
  readonly relativePath: string;
  readonly action: "CREATE" | "UPDATE";
  readonly ownership: "STUDIO_SAFE" | "GENERATED";
  readonly previousHash: string | null;
  readonly nextHash: string;
  readonly text: string;
  readonly serializerVersion: 1;
}
export interface CanonicalRevision { readonly fingerprint: string; readonly resources: Readonly<Record<string, string>> }
export interface AuthoringWritePlan {
  readonly operationId: string;
  readonly operationType: "UPDATE_EXISTING_LESSON";
  readonly subjectId: string;
  readonly lessonId: string;
  readonly baseRevision: CanonicalRevision;
  readonly draftFingerprint: string;
  readonly validation: ValidationReport;
  readonly changes: readonly PlannedFileChange[];
}
/** Opaque, process-local authority, not a serialized client report. */
export interface AuthoritativeWriteReceipt { readonly report: ValidationReport }
export interface LessonUpdateRequest { subjectId: string; lessonId: string; draft: unknown; baseRevision: CanonicalRevision; receipt: AuthoritativeWriteReceipt }
export interface CanonicalReadOnlyDependencies {
  conceptIds: Set<string>; exerciseIds: Set<string>; problemIds: Set<string>;
  examples: LearnExample[]; references: LearnReference[]; quizQuestions: LearnQuizQuestion[]; aliases: LearnRouteAlias[];
}
/** Trusted server composition only. Never forwarded from an HTTP/UI request. */
export interface WriterDependencies {
  rootAnchor: string;
  readDependencies: () => Promise<CanonicalReadOnlyDependencies>;
  hooks?: {
    staged?: () => Promise<void>;
    replaced?: (index: number) => Promise<void>;
    verifying?: () => Promise<void>;
    rollingBack?: (index: number) => Promise<void>;
  };
}
export interface IssuedPlanState { candidate: LessonCandidate; request: LessonUpdateRequest }

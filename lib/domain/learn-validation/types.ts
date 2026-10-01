import type { LearnExample, LearnLessonContent, LearnReference, LessonManifest, SubjectManifest } from "@/lib/domain/learn-platform";

/** Canonical composition only; never a persisted editor record. */
export interface LessonCandidate { lesson: LessonManifest; content: LearnLessonContent | null }
export type ValidationSeverity = "ERROR" | "WARNING" | "INFO";
export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
  path: string;
  entityId?: string;
  blockId?: string;
  blockIndex?: number;
  relationshipType?: string;
  relatedCanonicalId?: string;
}
export interface LessonValidationContext {
  subjects: readonly SubjectManifest[];
  lessons: ReadonlyMap<string, LessonManifest>;
  conceptIds: ReadonlySet<string>;
  exerciseIds: ReadonlySet<string>;
  problemIds: ReadonlySet<string>;
  examples: ReadonlyMap<string, LearnExample>;
  references: ReadonlyMap<string, LearnReference>;
}
export interface ValidationReport {
  version: 1;
  status: "invalid" | "review" | "valid";
  hasErrors: boolean;
  canPersistInFuture: boolean;
  renderable: boolean;
  counts: Record<ValidationSeverity, number>;
  issues: ValidationIssue[];
  draftFingerprint: string | null;
  contextFingerprint: string;
  subjectId: string;
  lessonId: string;
}
export const validationLimits = {
  requestBytes: 1024 * 1024, blocks: 200, collection: 200, columns: 32,
  text: 20_000, code: 20_000, id: 200, language: 120, issues: 500,
} as const;

export function boundedIssues(issues: ValidationIssue[]): ValidationIssue[] {
  return issues.length <= validationLimits.issues ? issues : [...issues.slice(0, validationLimits.issues - 1), {
    code: "ISSUE_LIMIT_REACHED", severity: "ERROR", path: "draft", message: "Too many issues; repair the reported fields and validate again.",
  }];
}

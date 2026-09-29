export const judgeVerdicts = ["AC", "WA", "TLE", "MLE", "RE", "CE"] as const;
export const judgeLanguages = ["python", "c", "cpp", "java", "javascript"] as const;
export const submissionStatuses = ["queued", "running", "finished", "failed", "cancelled", "unavailable"] as const;

export type JudgeVerdict = (typeof judgeVerdicts)[number];
export type JudgeLanguageId = (typeof judgeLanguages)[number];
export type SubmissionStatus = (typeof submissionStatuses)[number];
export type JudgeErrorCode = "invalid-request" | "unauthenticated" | "forbidden" | "not-found" | "conflict" | "rate-limit" | "quota-exceeded" | "unsupported-language" | "version-mismatch" | "temporarily-unavailable" | "internal";

export interface JudgeLimits { maxSourceBytes: number; timeLimitMs: number; memoryLimitBytes: number; outputLimitBytes: number; }
export interface JudgeRuntime { languageId: JudgeLanguageId; displayName: string; version: string; supported: boolean; limits: JudgeLimits; }
export interface SubmissionRequest { problemId: string; problemVersion: number; languageId: JudgeLanguageId; source: string; idempotencyKey: string; }
export interface SubmissionUsage { durationMs?: number; memoryBytes?: number; outputBytes?: number; }
export interface SubmissionResult { submissionId: string; status: SubmissionStatus; verdict?: JudgeVerdict; message?: string; usage?: SubmissionUsage; createdAt: string; updatedAt: string; runtime?: Pick<JudgeRuntime, "languageId" | "version">; }
export interface JudgeClient { submit(input: SubmissionRequest): Promise<SubmissionResult>; getStatus(submissionId: string): Promise<SubmissionResult | null>; cancel(submissionId: string): Promise<SubmissionResult | null>; }

export type JudgeTestVisibility = "public" | "hidden";
export interface JudgeTestSuiteReference {
  id: string;
  problemId: string;
  problemVersion: number;
  visibility: JudgeTestVisibility;
  caseCount: number;
  packageChecksum: string;
}

export type JudgeEvent =
  | { type: "queued"; occurredAt: string }
  | { type: "started"; occurredAt: string; runtime: Pick<JudgeRuntime, "languageId" | "version"> }
  | { type: "completed"; occurredAt: string; verdict: JudgeVerdict; usage: SubmissionUsage }
  | { type: "failed"; occurredAt: string; message: string }
  | { type: "cancel-requested"; occurredAt: string }
  | { type: "cancelled"; occurredAt: string }
  | { type: "unavailable"; occurredAt: string; message: string };

const allowedTransitions: Record<SubmissionStatus, SubmissionStatus[]> = {
  queued: ["running", "cancelled", "failed", "unavailable"],
  running: ["finished", "cancelled", "failed", "unavailable"],
  finished: [],
  failed: [],
  cancelled: [],
  unavailable: [],
};

export function transitionSubmission(result: SubmissionResult, event: JudgeEvent): SubmissionResult {
  const nextStatus: SubmissionStatus = event.type === "started" ? "running"
    : event.type === "completed" ? "finished"
      : event.type === "failed" ? "failed"
        : event.type === "cancelled" ? "cancelled"
          : event.type === "unavailable" ? "unavailable"
            : result.status;
  if (event.type === "queued" || event.type === "cancel-requested") return { ...result, updatedAt: event.occurredAt };
  if (!allowedTransitions[result.status].includes(nextStatus)) throw new Error(`invalid-judge-transition:${result.status}:${nextStatus}`);
  return {
    ...result,
    status: nextStatus,
    updatedAt: event.occurredAt,
    ...(event.type === "started" ? { runtime: event.runtime } : {}),
    ...(event.type === "completed" ? { verdict: event.verdict, usage: event.usage } : {}),
    ...(event.type === "failed" || event.type === "unavailable" ? { message: event.message } : {}),
  };
}

export const localJudgeRuntimes: JudgeRuntime[] = [
  { languageId: "python", displayName: "Python", version: "not configured", supported: false, limits: { maxSourceBytes: 20_000, timeLimitMs: 1_000, memoryLimitBytes: 256 * 1024 * 1024, outputLimitBytes: 64 * 1024 } },
  { languageId: "c", displayName: "C", version: "not configured", supported: false, limits: { maxSourceBytes: 20_000, timeLimitMs: 1_000, memoryLimitBytes: 256 * 1024 * 1024, outputLimitBytes: 64 * 1024 } },
  { languageId: "cpp", displayName: "C++", version: "not configured", supported: false, limits: { maxSourceBytes: 20_000, timeLimitMs: 1_000, memoryLimitBytes: 256 * 1024 * 1024, outputLimitBytes: 64 * 1024 } },
  { languageId: "java", displayName: "Java", version: "not configured", supported: false, limits: { maxSourceBytes: 20_000, timeLimitMs: 2_000, memoryLimitBytes: 256 * 1024 * 1024, outputLimitBytes: 64 * 1024 } },
  { languageId: "javascript", displayName: "JavaScript", version: "not configured", supported: false, limits: { maxSourceBytes: 20_000, timeLimitMs: 1_000, memoryLimitBytes: 256 * 1024 * 1024, outputLimitBytes: 64 * 1024 } },
];

export function validateSubmissionRequest(value: unknown): { ok: true; value: SubmissionRequest } | { ok: false; code: JudgeErrorCode } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, code: "invalid-request" };
  const input = value as Record<string, unknown>;
  if (typeof input.problemId !== "string" || !input.problemId.trim() || input.problemId.length > 160 || typeof input.problemVersion !== "number" || !Number.isInteger(input.problemVersion) || input.problemVersion < 1 || !judgeLanguages.includes(input.languageId as JudgeLanguageId) || typeof input.source !== "string" || typeof input.idempotencyKey !== "string" || !/^[a-zA-Z0-9_-]{12,128}$/.test(input.idempotencyKey)) return { ok: false, code: "invalid-request" };
  const runtime = localJudgeRuntimes.find((candidate) => candidate.languageId === input.languageId);
  if (!runtime) return { ok: false, code: "unsupported-language" };
  if (new TextEncoder().encode(input.source).byteLength > runtime.limits.maxSourceBytes) return { ok: false, code: "quota-exceeded" };
  return { ok: true, value: { problemId: input.problemId, problemVersion: input.problemVersion, languageId: input.languageId as JudgeLanguageId, source: input.source, idempotencyKey: input.idempotencyKey } };
}

export function isJudgeTestSuiteReference(value: unknown): value is JudgeTestSuiteReference {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const suite = value as Record<string, unknown>;
  return typeof suite.id === "string"
    && /^[a-zA-Z0-9:_-]{1,160}$/.test(suite.id)
    && typeof suite.problemId === "string"
    && /^[a-z0-9-]{1,160}$/.test(suite.problemId)
    && typeof suite.problemVersion === "number"
    && Number.isInteger(suite.problemVersion)
    && suite.problemVersion > 0
    && ["public", "hidden"].includes(suite.visibility as string)
    && typeof suite.caseCount === "number"
    && Number.isInteger(suite.caseCount)
    && suite.caseCount > 0
    && suite.caseCount <= 10_000
    && typeof suite.packageChecksum === "string"
    && /^[a-f0-9]{64}$/.test(suite.packageChecksum);
}

export function isSubmissionResult(value: unknown): value is SubmissionResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const result = value as Record<string, unknown>;
  if (typeof result.submissionId !== "string" || !/^[a-zA-Z0-9_-]{12,128}$/.test(result.submissionId) || !submissionStatuses.includes(result.status as SubmissionStatus)) return false;
  if (result.status === "finished" ? !judgeVerdicts.includes(result.verdict as JudgeVerdict) : result.verdict !== undefined) return false;
  if (typeof result.createdAt !== "string" || Number.isNaN(Date.parse(result.createdAt)) || typeof result.updatedAt !== "string" || Number.isNaN(Date.parse(result.updatedAt))) return false;
  if (result.message !== undefined && (typeof result.message !== "string" || result.message.length > 500)) return false;
  if (result.usage !== undefined) {
    if (!result.usage || typeof result.usage !== "object" || Array.isArray(result.usage)) return false;
    if (Object.values(result.usage).some((amount) => typeof amount !== "number" || !Number.isFinite(amount) || amount < 0)) return false;
  }
  if (result.runtime !== undefined) {
    if (!result.runtime || typeof result.runtime !== "object" || Array.isArray(result.runtime)) return false;
    const runtime = result.runtime as Record<string, unknown>;
    if (!judgeLanguages.includes(runtime.languageId as JudgeLanguageId) || typeof runtime.version !== "string" || !runtime.version.trim()) return false;
  }
  return true;
}

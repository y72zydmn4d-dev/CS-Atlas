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

export function isSubmissionResult(value: unknown): value is SubmissionResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const result = value as Record<string, unknown>;
  return typeof result.submissionId === "string" && submissionStatuses.includes(result.status as SubmissionStatus) && (result.verdict === undefined || judgeVerdicts.includes(result.verdict as JudgeVerdict)) && typeof result.createdAt === "string" && !Number.isNaN(Date.parse(result.createdAt)) && typeof result.updatedAt === "string" && !Number.isNaN(Date.parse(result.updatedAt));
}

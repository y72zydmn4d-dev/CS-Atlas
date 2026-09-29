export const judgeVerdicts = ["AC", "WA", "TLE", "MLE", "RE", "CE"] as const;
export const judgeLanguages = ["python", "c", "cpp", "java", "javascript"] as const;

export type JudgeVerdict = (typeof judgeVerdicts)[number];
export type JudgeLanguageId = (typeof judgeLanguages)[number];
export type SubmissionStatus = "queued" | "running" | "finished" | "failed" | "cancelled" | "unavailable";

export interface SubmissionRequest {
  problemId: string;
  problemVersion: number;
  languageId: JudgeLanguageId;
  source: string;
  idempotencyKey: string;
}

export interface SubmissionResult {
  submissionId: string;
  status: SubmissionStatus;
  verdict?: JudgeVerdict;
  message?: string;
  durationMs?: number;
  memoryBytes?: number;
}

export interface JudgeClient {
  submit(input: SubmissionRequest): Promise<SubmissionResult>;
  getStatus(submissionId: string): Promise<SubmissionResult | null>;
  cancel(submissionId: string): Promise<SubmissionResult | null>;
}

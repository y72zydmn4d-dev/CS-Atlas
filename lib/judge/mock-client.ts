import type { JudgeClient, SubmissionRequest, SubmissionResult } from "@/lib/domain/judge";

/**
 * Development-only lifecycle adapter. It intentionally never evaluates source
 * code and keeps Remote Judge unavailable until an independently reviewed
 * execution service is configured.
 */
export class UnavailableJudgeClient implements JudgeClient {
  private readonly submissions = new Map<string, SubmissionResult>();

  async submit(input: SubmissionRequest): Promise<SubmissionResult> {
    const existing = this.submissions.get(input.idempotencyKey);
    if (existing) return existing;
    const result: SubmissionResult = {
      submissionId: input.idempotencyKey,
      status: "unavailable",
      message: "Remote Judge is not configured. Public browser runs remain available.",
    };
    this.submissions.set(input.idempotencyKey, result);
    return result;
  }

  async getStatus(submissionId: string): Promise<SubmissionResult | null> {
    return this.submissions.get(submissionId) ?? null;
  }

  async cancel(submissionId: string): Promise<SubmissionResult | null> {
    const existing = this.submissions.get(submissionId);
    if (!existing) return null;
    const result: SubmissionResult = { ...existing, status: "cancelled", message: "Submission cancelled before remote execution." };
    this.submissions.set(submissionId, result);
    return result;
  }
}

export type LocalizedText = { en: string; vi: string };
export type PracticeLanguage = "python" | "javascript";
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type Verdict = "accepted" | "wrong-answer" | "runtime-error" | "time-limit" | "output-limit" | "resource-limit" | "unavailable" | "cancelled";
export interface PracticeTest { id: string; label: LocalizedText; input: JsonValue; expected: JsonValue; explanation: LocalizedText }
export interface PracticeProblem {
  id: string; version: number; kind: "dsa" | "ml"; title: LocalizedText; summary: LocalizedText;
  difficulty: "easy" | "medium"; domainId: string; topicIds: string[]; algorithmIds: string[]; techniqueIds: string[];
  statement: LocalizedText; contract: LocalizedText; constraints: LocalizedText[];
  starters: Record<PracticeLanguage, string>; tests: PracticeTest[]; hints: [LocalizedText, LocalizedText, LocalizedText];
  complexity: LocalizedText; rubric?: LocalizedText[]; comparator: "exact" | "numeric-tolerance";
}
export interface TestResult { testId: string; verdict: Verdict; actual?: JsonValue; message?: string; durationMs: number }
export interface JudgeResult { verdict: Verdict; tests: TestResult[]; durationMs: number; scope: "public"; diagnostic?: string }
export interface JudgeRunner { run(problem: PracticeProblem, code: string, signal?: AbortSignal): Promise<JudgeResult> }
export interface PracticeAttempt {
  id: string; problemId: string; problemVersion: number; code: string; createdAt: string;
  language: PracticeLanguage; result: JudgeResult;
}
export interface PracticeDraft { version: number; code: string; reflection: string; rubric: number[] }
export interface PracticeState { schemaVersion: 2; preferredLanguage: PracticeLanguage; attempts: PracticeAttempt[]; drafts: Record<string, PracticeDraft>; completions?: Record<string, { version: number; testIds: string[] }> }
export const PRACTICE_LIMITS = { codeCharacters: 20_000, outputCharacters: 8_000, memoryBytes: 32 * 1024 * 1024, stackBytes: 512 * 1024, testMs: 1_000, workerMs: 12_000, maxTests: 12, maxAttempts: 40, cooldownMs: 1_000 } as const;

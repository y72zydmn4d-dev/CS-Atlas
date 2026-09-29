import type { PracticeProblem, PracticeState } from "@/lib/practice/types";
export function practiceStatus(problem: PracticeProblem, state: PracticeState): "passed" | "attempted" | "unattempted" {
  const completion = state.completions?.[problem.id];
  if (completion?.version === problem.version && completion.testIds.length === problem.tests.length && completion.testIds.every((id, index) => id === problem.tests[index].id)) return "passed";
  const attempts = state.attempts.filter((attempt) => attempt.problemId === problem.id && attempt.problemVersion === problem.version && attempt.result.tests.length > 0);
  if (attempts.some((attempt) => attempt.result.verdict === "accepted" && attempt.result.tests.length === problem.tests.length && attempt.result.tests.every((test, index) => test.testId === problem.tests[index].id && test.verdict === "accepted"))) return "passed";
  return attempts.length ? "attempted" : "unattempted";
}

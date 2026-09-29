import { PRACTICE_LIMITS, type JsonValue, type PracticeProblem, type PracticeState, type Verdict } from "@/lib/practice/types";
import { isPracticeLanguage, practiceDraftKey } from "@/lib/practice/languages";

export function isJson(value: unknown, depth = 0): value is JsonValue {
  if (depth > 30) return false;
  if (value === null || typeof value === "boolean" || typeof value === "string") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= 100_000 && value.every((item) => isJson(item, depth + 1));
  return Boolean(value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype && Object.values(value).every((item) => isJson(item, depth + 1)));
}

export function validateProblems(problems: PracticeProblem[], registry: { domains: Set<string>; topics: Set<string>; algorithms: Set<string>; techniques: Set<string> }): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const problem of problems) {
    if (!/^[a-z0-9-]+$/.test(problem.id) || ids.has(problem.id)) errors.push(`Duplicate or invalid problem: ${problem.id}`);
    ids.add(problem.id);
    if (!Number.isInteger(problem.version) || problem.version < 1 || !["dsa", "ml"].includes(problem.kind) || !["easy", "medium"].includes(problem.difficulty) || !["exact", "numeric-tolerance"].includes(problem.comparator)) errors.push(`${problem.id}: invalid schema`);
    if (!problem.starters.python?.trim() || !problem.starters.javascript?.trim()) errors.push(`${problem.id}: missing language starter`);
    const textFields = [problem.title, problem.summary, problem.statement, problem.contract, problem.complexity, ...problem.constraints, ...problem.hints, ...(problem.rubric ?? [])];
    if (textFields.some((text) => !text.en?.trim() || !text.vi?.trim()) || problem.hints.length !== 3) errors.push(`${problem.id}: incomplete translation or hints`);
    if (!registry.domains.has(problem.domainId)) errors.push(`${problem.id}: missing domain`);
    for (const [values, set] of [[problem.topicIds, registry.topics], [problem.algorithmIds, registry.algorithms], [problem.techniqueIds, registry.techniques]] as const) for (const id of values) if (!set.has(id)) errors.push(`${problem.id}: missing relation ${id}`);
    if (!problem.tests.length || problem.tests.length > PRACTICE_LIMITS.maxTests || new Set(problem.tests.map((test) => test.id)).size !== problem.tests.length) errors.push(`${problem.id}: invalid tests`);
    if (problem.tests.some((test) => !isJson(test.input) || !isJson(test.expected) || !test.label.en || !test.label.vi || !test.explanation.en || !test.explanation.vi)) errors.push(`${problem.id}: invalid test data`);
  }
  return errors;
}

const verdicts = new Set<Verdict>(["accepted", "wrong-answer", "runtime-error", "time-limit", "output-limit", "resource-limit", "unavailable", "cancelled"]);
export const emptyPracticeState = (): PracticeState => ({ schemaVersion: 2, preferredLanguage: "python", attempts: [], drafts: {} });
export function sanitizePracticeState(value: unknown): PracticeState {
  const state = emptyPracticeState();
  if (!value || typeof value !== "object" || !("schemaVersion" in value) || (value.schemaVersion !== 1 && value.schemaVersion !== 2)) return state;
  const record = value as Record<string, unknown>;
  const legacy = record.schemaVersion === 1;
  if (isPracticeLanguage(record.preferredLanguage)) state.preferredLanguage = record.preferredLanguage;
  state.completions = {};
  if (record.completions && typeof record.completions === "object" && !Array.isArray(record.completions)) {
    for (const [id, completion] of Object.entries(record.completions).slice(0, 100)) {
      if (!/^[a-z0-9-]+$/.test(id) || !completion || typeof completion !== "object") continue;
      const c = completion as Record<string, unknown>;
      if (typeof c.version === "number" && Number.isInteger(c.version) && c.version > 0 && Array.isArray(c.testIds) && c.testIds.length > 0 && c.testIds.length <= PRACTICE_LIMITS.maxTests && c.testIds.every((id) => typeof id === "string" && id.length < 100)) state.completions[id] = { version: c.version, testIds: c.testIds };
    }
  }
  if (Array.isArray(record.attempts)) {
    state.attempts = record.attempts.filter((entry) => {
      if (!entry || typeof entry !== "object") return false;
      const r = entry.result;
      return typeof entry.id === "string" && typeof entry.problemId === "string" && /^[a-z0-9-]+$/.test(entry.problemId) && Number.isInteger(entry.problemVersion) && entry.problemVersion > 0 && typeof entry.code === "string" && entry.code.length <= PRACTICE_LIMITS.codeCharacters && isPracticeLanguage(entry.language) && typeof entry.createdAt === "string" && Number.isFinite(Date.parse(entry.createdAt)) && r?.scope === "public" && verdicts.has(r.verdict) && Number.isFinite(r.durationMs) && r.durationMs >= 0 && (r.diagnostic === undefined || (typeof r.diagnostic === "string" && r.diagnostic.length <= 200)) && Array.isArray(r.tests) && r.tests.length <= PRACTICE_LIMITS.maxTests && r.tests.every((test: Record<string, unknown>) => test && typeof test === "object" && typeof test.testId === "string" && verdicts.has(test.verdict as Verdict) && typeof test.durationMs === "number" && Number.isFinite(test.durationMs) && test.durationMs >= 0 && (test.message === undefined || (typeof test.message === "string" && test.message.length <= 300)) && (test.actual === undefined || (isJson(test.actual) && JSON.stringify(test.actual).length <= PRACTICE_LIMITS.outputCharacters)));
    }).slice(-PRACTICE_LIMITS.maxAttempts);
  }
  for (const attempt of state.attempts) {
    if (attempt.result.verdict === "accepted" && attempt.result.tests.length && attempt.result.tests.every((test) => test.verdict === "accepted")) state.completions[attempt.problemId] = { version: attempt.problemVersion, testIds: attempt.result.tests.map((test) => test.testId) };
  }
  if (record.drafts && typeof record.drafts === "object" && !Array.isArray(record.drafts)) {
    for (const [storedId, draft] of Object.entries(record.drafts).slice(0, 200)) {
      const id = legacy && /^[a-z0-9-]+$/.test(storedId) ? practiceDraftKey(storedId, "javascript") : storedId;
      if (!/^[a-z0-9-]+:(python|javascript)$/.test(id) || !draft || typeof draft !== "object") continue;
      const d = draft as Record<string, unknown>;
      if (typeof d.code === "string" && d.code.length <= PRACTICE_LIMITS.codeCharacters && typeof d.version === "number" && Number.isInteger(d.version) && d.version > 0 && typeof d.reflection === "string" && d.reflection.length <= 5_000 && Array.isArray(d.rubric) && d.rubric.every((index) => Number.isInteger(index) && index >= 0 && index < 20)) state.drafts[id] = d as unknown as PracticeState["drafts"][string];
    }
  }
  return state;
}

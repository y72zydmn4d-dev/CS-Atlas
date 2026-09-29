import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { algorithms, domains, techniques, topics } from "@/content";
import { practiceProblems } from "@/content/practice/problems";
import { referenceSolutions } from "@/content/practice/references.server";
import { compareOutput } from "@/lib/practice/comparator";
import { runPublicTests as executePublicTests } from "@/lib/practice/engine";
import { newQuickJSWASMModuleFromVariant } from "quickjs-emscripten-core";
import variant from "@jitl/quickjs-singlefile-browser-release-sync";
import { practiceStatus } from "@/lib/practice/progress";
import { emptyPracticeState, sanitizePracticeState, validateProblems } from "@/lib/practice/validation";
import { storage } from "@/lib/storage";
import type { PracticeProblem } from "@/lib/practice/types";
const runPublicTests = (problem: PracticeProblem, code: string) => executePublicTests(problem, code, () => newQuickJSWASMModuleFromVariant(variant));

describe("practice contracts and content", () => {
  it("validates every relation and bilingual problem, including six DSA and one ML task", () => {
    const registry = { domains: new Set(domains.map((x) => x.id)), topics: new Set(topics.map((x) => x.id)), algorithms: new Set(algorithms.map((x) => x.id)), techniques: new Set(techniques.map((x) => x.id)) };
    expect(validateProblems(practiceProblems, registry)).toEqual([]);
    expect(practiceProblems.filter((p) => p.kind === "dsa")).toHaveLength(6);
    expect(practiceProblems.filter((p) => p.kind === "ml")).toHaveLength(1);
    expect(validateProblems([{ ...practiceProblems[0], topicIds: ["missing-topic"] }], registry)).toContain("first-occurrence: missing relation missing-topic");
  });
  it("compares shape, order and type without coercion; tolerates only ML numeric leaves", () => {
    expect(compareOutput([1, 2], [2, 1], "exact")).toBe(false);
    expect(compareOutput("1", 1, "exact")).toBe(false);
    expect(compareOutput({ mse: 0, extra: 1 }, { mse: 0 }, "numeric-tolerance")).toBe(false);
    expect(compareOutput({ mse: 1 + 1e-7 }, { mse: 1 }, "numeric-tolerance")).toBe(true);
    expect(compareOutput({ mse: 1.01 }, { mse: 1 }, "numeric-tolerance")).toBe(false);
    expect(compareOutput(NaN, 0, "numeric-tolerance")).toBe(false);
    expect(compareOutput(null, 0, "numeric-tolerance")).toBe(false);
  });
});

describe("WASM guest execution", () => {
  for (const problem of practiceProblems) it(`verifies reference solution and edge cases: ${problem.id}`, async () => {
    const result = await runPublicTests(problem, referenceSolutions[problem.id]);
    expect(result.verdict).toBe("accepted");
    expect(result.tests).toHaveLength(problem.tests.length);
    expect(result.tests.every((test) => test.verdict === "accepted")).toBe(true);
  });
  it("reports reproducible wrong answer, runtime error and output limit", async () => {
    const p = practiceProblems[0];
    expect((await runPublicTests(p, "function solve() { return -1; }")).verdict).toBe("wrong-answer");
    expect((await runPublicTests(p, "function solve() { throw new Error('oops'); }")).verdict).toBe("runtime-error");
    expect((await runPublicTests(p, "function solve() { return 'a'.repeat(9000); }")).verdict).toBe("output-limit");
    expect((await runPublicTests(p, "function solve() { return undefined; }")).verdict).toBe("runtime-error");
  });
  it("interrupts an infinite loop rather than blocking the host", async () => {
    const result = await runPublicTests(practiceProblems[0], "function solve() { while(true) {} }");
    expect(result.verdict).toBe("time-limit");
    expect(result.tests).toHaveLength(1);
  });
  it("does not expose network, browser storage, process or module imports to guest code", async () => {
    const problem: PracticeProblem = { ...practiceProblems[0], tests: [{ ...practiceProblems[0].tests[0], expected: ["undefined", "undefined", "undefined", "undefined", "undefined", "undefined", "undefined"] }] };
    const code = "function solve() { return [typeof fetch, typeof window, typeof localStorage, typeof process, typeof require, typeof XMLHttpRequest, typeof WebSocket]; }";
    expect((await runPublicTests(problem, code)).verdict).toBe("accepted");
    expect((await runPublicTests(practiceProblems[0], "import fs from 'node:fs'; function solve() { return 1; }")).verdict).toBe("runtime-error");
  });
  it("keeps comparison outside the guest and recreates state between tests", async () => {
    expect((await runPublicTests(practiceProblems[0], "JSON.stringify = () => '1'; function solve(){ return -1; }")).verdict).toBe("wrong-answer");
    const p: PracticeProblem = { ...practiceProblems[0], tests: practiceProblems[0].tests.slice(0, 2).map((test) => ({ ...test, expected: 1 })) };
    expect((await runPublicTests(p, "let count = 0; function solve(){ return ++count; }")).verdict).toBe("accepted");
  });
  it("contains oversized guest allocations without exposing a host memory API", async () => {
    const result = await runPublicTests(practiceProblems[0], "function solve() { return new Array(100000000).fill(1); }");
    expect(["runtime-error", "time-limit"]).toContain(result.verdict);
    expect((await runPublicTests(practiceProblems[0], referenceSolutions[practiceProblems[0].id])).verdict).toBe("accepted");
  });
});

describe("practice storage and versioned progress", () => {
  beforeEach(() => localStorage.clear());
  it("persists a wrong answer followed by accepted across reloads", async () => {
    const p = practiceProblems[0]; const state = emptyPracticeState();
    for (const [id, code] of [["wrong", p.starters.javascript], ["correct", referenceSolutions[p.id]]]) {
      state.attempts.push({ id, code, problemId: p.id, problemVersion: p.version, language: "javascript", createdAt: new Date().toISOString(), result: await runPublicTests(p, code) });
    }
    expect(storage.savePractice(state)).toBe(true);
    const reloaded = storage.loadPractice().state;
    expect(reloaded.attempts.map((a) => a.result.verdict)).toEqual(["wrong-answer", "accepted"]);
    expect(practiceStatus(p, reloaded)).toBe("passed");
    expect(practiceStatus({ ...p, version: 2 }, reloaded)).toBe("unattempted");
  });
  it("recovers malformed records and rejects unsupported storage versions", () => {
    expect(sanitizePracticeState({ schemaVersion: 9, attempts: [] })).toEqual(emptyPracticeState());
    localStorage.setItem("cs-atlas.practice.v1", JSON.stringify({ schemaVersion: 1, attempts: [null, { result: { verdict: "accepted" } }], drafts: {} }));
    expect(storage.loadPractice().state.attempts).toEqual([]);
    expect(storage.loadPractice().recovered).toBe(true);
  });
  it("migrates the old JavaScript draft and defaults new work to Python", () => {
    localStorage.setItem("cs-atlas.practice.v1", JSON.stringify({ schemaVersion: 1, attempts: [], drafts: { "first-occurrence": { version: 1, code: "legacy js", reflection: "", rubric: [] } } }));
    const loaded = storage.loadPractice();
    expect(loaded.recovered).toBe(false);
    expect(loaded.state.schemaVersion).toBe(2);
    expect(loaded.state.preferredLanguage).toBe("python");
    expect(loaded.state.drafts["first-occurrence:javascript"].code).toBe("legacy js");
  });
  it("reports storage failures instead of claiming persistence", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Quota exceeded"); });
    expect(storage.savePractice(emptyPracticeState())).toBe(false); spy.mockRestore();
  });
  it("adds derived completion records to older valid v1 storage without a corruption warning", () => {
    localStorage.setItem("cs-atlas.practice.v1", JSON.stringify(emptyPracticeState()));
    expect(storage.loadPractice().recovered).toBe(false);
  });
  it("discards null test records and preserves a completion after history rotates", async () => {
    const p = practiceProblems[0];
    const state = emptyPracticeState();
    const attempt = { id: "pass", problemId: p.id, problemVersion: 1, code: "", language: "javascript" as const, createdAt: new Date().toISOString(), result: await runPublicTests(p, referenceSolutions[p.id]) };
    state.attempts.push(attempt);
    storage.savePractice(state);
    const saved = storage.loadPractice().state;
    saved.attempts = [];
    storage.savePractice(saved);
    expect(practiceStatus(p, storage.loadPractice().state)).toBe("passed");
    expect(practiceStatus({ ...p, version: 2 }, storage.loadPractice().state)).toBe("unattempted");
    expect(sanitizePracticeState({ ...state, attempts: [{ ...attempt, result: { ...attempt.result, tests: [null] } }] }).attempts).toEqual([]);
  });
});

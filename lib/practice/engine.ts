import type { QuickJSWASMModule } from "quickjs-emscripten-core";
import { compareOutput } from "@/lib/practice/comparator";
import { PRACTICE_LIMITS, type JudgeResult, type PracticeProblem, type TestResult } from "@/lib/practice/types";
import { isJson } from "@/lib/practice/validation";

let modulePromise: Promise<QuickJSWASMModule> | undefined;
/** Only imported by the browser Worker and trusted test tooling. Never by a Next route. */
export async function runPublicTests(problem: PracticeProblem, code: string, initialize: () => Promise<QuickJSWASMModule>): Promise<JudgeResult> {
  const started = performance.now();
  if (code.length > PRACTICE_LIMITS.codeCharacters || problem.tests.length > PRACTICE_LIMITS.maxTests) return { verdict: "resource-limit", tests: [], durationMs: 0, scope: "public" };
  const QuickJS = await (modulePromise ??= initialize());
  const tests: TestResult[] = [];
  for (const test of problem.tests) {
    const runtime = QuickJS.newRuntime();
    runtime.setMemoryLimit(PRACTICE_LIMITS.memoryBytes);
    runtime.setMaxStackSize(PRACTICE_LIMITS.stackBytes);
    const begin = performance.now();
    let interrupted = false;
    runtime.setInterruptHandler(() => { interrupted = performance.now() - begin > PRACTICE_LIMITS.testMs; return interrupted; });
    const context = runtime.newContext();
    let result: TestResult = { testId: test.id, verdict: "runtime-error", durationMs: 0 };
    try {
      // Capture a bounded serializer before guest code can alter built-ins.
      // evalCode is the WASM interpreter API, never the host's eval/Function.
      const serializer = context.unwrapResult(context.evalCode(`((stringify) => value => { const text = stringify(value); if (typeof text !== 'string') return 'U'; return text.length > ${PRACTICE_LIMITS.outputCharacters} ? 'L' : 'J' + text; })(JSON.stringify)`));
      try {
        const setup = context.evalCode("globalThis.Date = undefined; globalThis.eval = undefined; globalThis.Function = undefined; Math.random = () => { throw new Error('Non-deterministic random is unavailable'); };");
        if (setup.error) { setup.error.dispose(); throw new Error("runtime"); } setup.value.dispose();
        const executed = context.evalCode(code, "solution.js");
        if (executed.error) { executed.error.dispose(); throw new Error("runtime"); } executed.value.dispose();
        const solve = context.unwrapResult(context.evalCode("solve"));
        const input = context.unwrapResult(context.evalCode(`(${JSON.stringify(test.input)})`));
        try {
          const output = context.callFunction(solve, context.undefined, input);
          if (output.error) { output.error.dispose(); throw new Error("runtime"); }
          try {
            const encoded = context.callFunction(serializer, context.undefined, output.value);
            if (encoded.error) { encoded.error.dispose(); throw new Error("runtime"); }
            try {
              const text = context.getString(encoded.value);
              if (text === "L") result.verdict = "output-limit";
              else if (text.startsWith("J")) {
                const actual: unknown = JSON.parse(text.slice(1));
                if (!isJson(actual)) throw new Error("runtime");
                result = { ...result, actual, verdict: compareOutput(actual, test.expected, problem.comparator) ? "accepted" : "wrong-answer" };
              }
            } finally { encoded.value.dispose(); }
          } finally { output.value.dispose(); }
        } finally { input.dispose(); solve.dispose(); }
      } finally { serializer.dispose(); }
    } catch { result.verdict = interrupted ? "time-limit" : "runtime-error"; }
    finally { context.dispose(); runtime.dispose(); }
    result.durationMs = Math.round((performance.now() - begin) * 100) / 100;
    tests.push(result);
    // Avoid spending a full time budget repeatedly on the same unbounded program.
    if (["time-limit", "output-limit", "runtime-error"].includes(result.verdict)) break;
  }
  return { verdict: tests.find((test) => test.verdict !== "accepted")?.verdict ?? "accepted", tests, durationMs: Math.round(performance.now() - started), scope: "public" };
}

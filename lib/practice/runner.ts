import { PRACTICE_LIMITS, type JudgeResult, type JudgeRunner, type PracticeProblem } from "@/lib/practice/types";

export class BrowserPracticeRunner implements JudgeRunner {
  private running = false;
  private lastRun = 0;
  run(problem: PracticeProblem, code: string, signal?: AbortSignal): Promise<JudgeResult> {
    if (this.running || Date.now() - this.lastRun < PRACTICE_LIMITS.cooldownMs) return Promise.reject(new Error("busy"));
    this.running = true; this.lastRun = Date.now();
    return new Promise((resolve) => {
      let worker: Worker | undefined;
      let timer: ReturnType<typeof setTimeout> | undefined;
      let done = false;
      const finish = (result: JudgeResult) => {
        if (done) return; done = true;
        clearTimeout(timer); worker?.terminate(); signal?.removeEventListener("abort", cancel);
        this.running = false; resolve(result);
      };
      const fallback = (verdict: JudgeResult["verdict"]): JudgeResult => ({ verdict, tests: [], durationMs: 0, scope: "public" });
      const cancel = () => finish(fallback("cancelled"));
      if (signal?.aborted) { cancel(); return; }
      try {
        worker = new Worker(new URL("./judge.worker.ts", import.meta.url), { type: "module" });
        timer = setTimeout(() => finish(fallback("unavailable")), PRACTICE_LIMITS.workerMs);
        worker.onmessage = (event: MessageEvent<JudgeResult>) => finish(event.data);
        worker.onerror = (event) => finish({ ...fallback("unavailable"), diagnostic: event.message?.slice(0, 200) });
        worker.onmessageerror = () => finish(fallback("unavailable"));
        signal?.addEventListener("abort", cancel, { once: true });
        worker.postMessage({ problem, code });
      } catch { finish(fallback("unavailable")); }
    });
  }
}

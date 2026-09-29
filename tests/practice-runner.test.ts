import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserPracticeRunner } from "@/lib/practice/runner";
import { practiceProblems } from "@/content/practice/problems";
import { PRACTICE_LIMITS } from "@/lib/practice/types";

class TestWorker {
  static instances: TestWorker[] = [];
  onmessage?: (event: { data: unknown }) => void;
  onerror?: (event: { message: string }) => void;
  onmessageerror?: () => void;
  terminate = vi.fn();
  postMessage = vi.fn();
  constructor() { TestWorker.instances.push(this); }
}
describe("browser runner lifecycle", () => {
  beforeEach(() => { vi.useFakeTimers(); TestWorker.instances = []; vi.stubGlobal("Worker", TestWorker); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
  it("terminates after a result and rejects overlapping requests", async () => {
    const runner = new BrowserPracticeRunner();
    const pending = runner.run(practiceProblems[0], "function solve(){}");
    await expect(runner.run(practiceProblems[0], "")).rejects.toThrow("busy");
    const worker = TestWorker.instances[0];
    expect(worker.postMessage).toHaveBeenCalledWith({ problem: practiceProblems[0], code: "function solve(){}" });
    worker.onmessage?.({ data: { verdict: "wrong-answer", scope: "public", tests: [], durationMs: 1 } });
    expect((await pending).verdict).toBe("wrong-answer");
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("cancels a worker and does not start one for an already-aborted request", async () => {
    const controller = new AbortController();
    const pending = new BrowserPracticeRunner().run(practiceProblems[0], "", controller.signal);
    controller.abort();
    expect((await pending).verdict).toBe("cancelled");
    expect(TestWorker.instances[0].terminate).toHaveBeenCalledOnce();
    expect((await new BrowserPracticeRunner().run(practiceProblems[0], "", controller.signal)).verdict).toBe("cancelled");
    expect(TestWorker.instances).toHaveLength(1);
  });
  it("bounds initialization and reports startup failure honestly, not algorithm TLE", async () => {
    const pending = new BrowserPracticeRunner().run(practiceProblems[0], "");
    await vi.advanceTimersByTimeAsync(PRACTICE_LIMITS.workerMs);
    expect((await pending).verdict).toBe("unavailable");
    expect(TestWorker.instances[0].terminate).toHaveBeenCalledOnce();
    const crashed = new BrowserPracticeRunner().run(practiceProblems[0], "");
    TestWorker.instances[1].onerror?.({ message: "WASM unavailable" });
    expect((await crashed).diagnostic).toBe("WASM unavailable");
    expect(TestWorker.instances[1].terminate).toHaveBeenCalledOnce();
  });
});

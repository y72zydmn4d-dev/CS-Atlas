import { runPublicTests } from "@/lib/practice/engine";
import type { PracticeProblem } from "@/lib/practice/types";
import { newQuickJSWASMModuleFromVariant } from "quickjs-emscripten-core";

const initialize = () => newQuickJSWASMModuleFromVariant({
  type: "sync",
  importFFI: () => import("@jitl/quickjs-singlefile-browser-release-sync/ffi").then((module) => module.QuickJSFFI),
  importModuleLoader: async () => {
    const url = "/practice-engine/quickjs-0.32.0.mjs";
    return (await import(/* webpackIgnore: true */ url)).default;
  },
});

self.onmessage = async (event: MessageEvent<{ problem: PracticeProblem; code: string }>) => {
  try { self.postMessage(await runPublicTests(event.data.problem, event.data.code, initialize)); }
  catch (error) { self.postMessage({ verdict: "unavailable", tests: [], durationMs: 0, scope: "public", diagnostic: error instanceof Error ? error.message.slice(0, 200) : "Engine initialization failed" }); }
};

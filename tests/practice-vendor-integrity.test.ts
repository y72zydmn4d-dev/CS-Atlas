// @vitest-environment node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

function sha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

describe("Practice vendor loader integrity", () => {
  it("preserves the locally served QuickJS loader byte-for-byte", () => {
    const sourceRoot = dirname(require.resolve("@jitl/quickjs-singlefile-browser-release-sync/package.json"));
    const source = join(sourceRoot, "dist/emscripten-module.browser.mjs");
    const served = resolve(process.cwd(), "public/practice-engine/quickjs-0.32.0.mjs");
    expect(sha256(served)).toBe(sha256(source));
  });
});

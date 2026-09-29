import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// Preserve the upstream embedded WASM bytes. Running this already-built module
// through SWC corrupts binary string escapes in production (Next 16.3.6).
// Serve it locally, unmodified, and load it only inside the Practice worker.
const require = createRequire(import.meta.url);
const source = dirname(require.resolve("@jitl/quickjs-singlefile-browser-release-sync/package.json"));
const destination = new URL("../public/practice-engine/", import.meta.url);
await mkdir(destination, { recursive: true });
await copyFile(join(source, "dist/emscripten-module.browser.mjs"), new URL("quickjs-0.32.0.mjs", destination));
await copyFile(join(source, "LICENSE"), new URL("LICENSE", destination));

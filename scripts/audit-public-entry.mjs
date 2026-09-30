import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";

// Diagnostic GETs only, against a deliberately isolated local QA origin.
const origin = new URL(process.argv[2] || "http://localhost:3010");
assert(["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname), "Use a local QA origin");
assert(["http:", "https:"].includes(origin.protocol) && !origin.username && !origin.password, "Invalid QA origin");

async function get(path) {
  const response = await fetch(new URL(path,origin), { signal: AbortSignal.timeout(15_000), redirect: "manual" });
  return { response, body: await response.text() };
}
const routes = ["/", "/home", "/learn", "/learn/python", "/learn/python/introduction", "/practice", "/explore", "/library", "/progress", "/assistant", "/profile", "/settings", "/search", "/atlas", "/topics/python", "/concepts/topic-python"];
let publicHtml = "";
for (const path of routes) {
  const { response, body } = await get(path);
  assert.equal(response.status,200,`Route failed: ${path}`);
  if (path === "/") {
    publicHtml = body;
    assert(body.includes('class="public-landing"'), "Root must render public shell");
    assert(!body.includes("workspace-frame"), "Public root must not render workspace shell");
    assert(body.includes('href="/home"') && body.includes("Continue as guest"), "Guest destination missing");
    assert(!/<(?:input|form)\b/i.test(body), "Unavailable auth must not collect credentials");
  } else {
    assert(body.includes("workspace-frame"),`Missing directly accessible workspace shell: ${path}`);
    if (path === "/home") assert(body.includes("workspace-home") && body.includes("Trịnh Gia Huy"), "Home composition/creator footer missing");
  }
  console.log(`route ${path} 200`);
}

const assets = [...new Set([...publicHtml.matchAll(/<script\b[^>]*>/gi)]
  .filter(([tag]) => !/nomodule/i.test(tag))
  .flatMap(([tag]) => { const src = tag.match(/\bsrc="([^"]+)"/); return src ? [src[1]] : []; }))];
let initialGzip = 0;
let entryRouteGzip = 0;
for (const path of assets) {
  assert(path.startsWith("/_next/static/"), "Unexpected public script source");
  const { response, body } = await get(path);
  assert.equal(response.status,200,`Missing public script ${path}`);
  assert(!/react-flow__|quickjs-emscripten|mammoth|pdfjs-dist/i.test(body),`Heavy workspace runtime leaked: ${path}`);
  assert(!body.includes("programming-fundamentals"),`Full knowledge records leaked into public script: ${path}`);
  const bytes = gzipSync(body).length;
  initialGzip += bytes;
  if (path.includes("/app/page-")) entryRouteGzip += bytes;
  console.log(`script ${path.split("/").at(-1)} gzip=${bytes}`);
}
assert(entryRouteGzip > 0 && entryRouteGzip < 30 * 1024, "Entry route exceeds additive JS budget");
console.log(JSON.stringify({ modernInitialScriptCount: assets.length, modernInitialGzipBytes: initialGzip, entryRouteGzipBytes: entryRouteGzip, note: "HTML script census, not a hydration/network timing benchmark. Shared framework/providers included in total." },null,2));

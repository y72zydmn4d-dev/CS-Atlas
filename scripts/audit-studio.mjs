import assert from "node:assert/strict";

// GET-only diagnostics. Never create/edit content or invoke an authoring action.
const origin = new URL(process.argv[2] || "http://127.0.0.1:3011");
const mode = process.argv[3];
assert(["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname), "Local QA origin required");
assert(origin.protocol === "http:" && !origin.username && !origin.password, "Use an isolated local HTTP server");
assert(["enabled", "disabled"].includes(mode), "Specify enabled or disabled");

async function get(path) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(20_000), redirect: "manual" });
  const html = await response.text();
  console.log(`studio smoke ${path} ${response.status} ${html.length} chars`);
  return { response, html };
}

const studioPaths = ["/studio", "/studio?subject=python", "/studio?subject=python&lesson=learn%3Apython%3Aintroduction", "/studio?subject=java&lesson=learn%3Ajava%3Ainterfaces"];
for (const path of studioPaths) {
  const { response, html } = await get(path);
  assert.equal(response.status, mode === "enabled" ? 200 : 404);
  assert.equal(html.includes('class="page studio-page"'), mode === "enabled");
  if (mode === "enabled") {
    assert(!html.includes("workspace-frame"), "Studio must not mount eager learner/Search/persistence services");
    assert(html.includes("Existing lessons") && html.includes("not scanned"));
    if (!path.includes("lesson=")) assert(!html.includes('class="studio-block-list"'), "Body must not render before selection");
    if (path.includes("introduction")) assert(html.includes('class="studio-block-list"'), "Selected authored body missing");
    if (path.includes("interfaces")) assert(html.includes("No authored body exists"), "Actual skeleton absence missing");
  }
}

if (mode === "enabled") {
  for (const path of ["/studio?subject=unknown", "/studio?subject=python&lesson=learn%3Ajava%3Ainterfaces", "/studio?subject=..%2Fpackage.json", "/studio?lesson=learn%3Apython%3Aintroduction"]) {
    const { response, html } = await get(path);
    // Next may already be streaming its root loading boundary (soft 404).
    assert([200, 404].includes(response.status));
    assert(!html.includes('class="page studio-page"') && html.includes("NEXT_HTTP_ERROR_FALLBACK;404"), "Invalid selection must render not-found, never Studio content");
  }
}

for (const path of ["/api/studio", "/api/studio/write-file"]) {
  const { response } = await get(path);
  assert.equal(response.status, 404, "No generic Studio writer endpoint exists");
}
for (const kind of ["concepts", "exercises", "problems", "references", "examples", "lessons"]) {
  const { response, html } = await get(`/api/studio/relationships/${kind}?q=`);
  assert.equal(response.status, mode === "enabled" ? 200 : 404);
  assert.equal(response.headers.get("cache-control"), "no-store");
  if (mode === "enabled") {
    const payload = JSON.parse(html);
    assert.equal(payload.version, 1); assert.equal(payload.kind, kind);
    assert(payload.items.length > 0 && payload.items.length <= 20);
    assert(payload.items.every((item) => item.kind === kind && typeof item.id === "string"));
    assert(!/"(?:blocks|starterSource|assessment|tests|referenceSolution)"/.test(html), "Only narrow public projections");
  }
}
if (mode === "enabled") {
  const { response, html } = await get("/api/studio/relationships/concepts?id=topic%3Arecursion&id=missing%3Aid");
  assert.equal(response.status, 200);
  const result = JSON.parse(html);
  assert.equal(result.items[0].id, "topic:recursion"); assert.deepEqual(result.unresolvedIds, ["missing:id"]);
  assert.equal((await get("/api/studio/relationships/concepts?path=../../package.json")).response.status, 400);
  assert.equal((await get("/api/studio/relationships/write-file")).response.status, 404);
}
for (const path of ["/", "/home", "/learn", "/learn/python", "/learn/python/introduction", "/learn/java"]) {
  const { response, html } = await get(path);
  assert.equal(response.status, 200, `Learner route regressed: ${path}`);
  assert(!html.includes('class="page studio-page"'));
}

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

// Ephemeral read-only computations. Never writes content, drafts, browser state or Git.
const origin = new URL(process.argv[2] || "http://127.0.0.1:3011");
const enabled = process.argv[3] === "enabled";
assert(["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname));
assert(origin.protocol === "http:" && !origin.username && !origin.password);
assert(["enabled", "disabled"].includes(process.argv[3]));
const target = new URL("/api/studio/preview", origin);
const files = ["content/learn/registry.ts", "content/learn/lesson-content.ts", "content/concepts/registry.ts", "content/exercises.ts", "content/problems.ts"];
const hashes = () => Promise.all(files.map(async (file) => createHash("sha256").update(await readFile(file)).digest("hex")));
const before = await hashes();
async function submit(body, expected, headers = {}) {
  const response = await fetch(target, { method: "POST", headers: { origin: origin.origin, "content-type": "application/json", ...headers }, body, signal: AbortSignal.timeout(20_000) });
  assert.equal(response.status, expected); assert.equal(response.headers.get("cache-control"), "no-store");
  const result = await response.json();
  console.log("preview smoke", response.status, result.code || result.report?.status, result.report?.counts || "");
  return result;
}
// Existing Java Interfaces fixture, never create a duplicate or write a body file.
const draft = { lesson: {
  id: "learn:java:interfaces", subjectId: "java", sectionId: "learn-section:java:object-model", slug: "interfaces", title: { en: "Interfaces", vi: "Interfaces" },
  description: { en: "Learn interfaces through concise explanations, examples, and connected practice.", vi: "Learn interfaces through concise explanations, examples, and connected practice." },
  order: 3, conceptIds: ["topic:object-oriented-programming"], prerequisiteLessonIds: ["learn:java:inheritance"], estimatedMinutes: 12, difficulty: "Foundational", status: "SKELETON", translationStatus: "english-only", exerciseIds: [], problemIds: [],
}, content: null };
const payload = () => JSON.stringify({ subjectId: "java", lessonId: draft.lesson.id, draft });
if (enabled) {
  const initial = await submit(payload(), 200); assert(initial.report.renderable); assert.equal(initial.model.content, null);
  draft.lesson.title.en = "UNSAVED Interfaces preview";
  draft.content = { lessonId: draft.lesson.id, version: 1, reviewedAt: "", summary: { en: "Transient summary", vi: "" }, blocks: [
    { id: "objectives", type: "objectives", items: [{ en: "Declare an interface", vi: "" }] },
    { id: "prose", type: "paragraph", body: { en: "Unsaved Java interfaces explanation", vi: "" } },
    { id: "code", type: "code", language: "java", code: "interface Readable { String read(); }" },
    { id: "html-code", type: "code", language: "html", code: "<script>alert(1)</script>" },
  ] };
  const result = await submit(payload(), 200);
  assert(result.report.renderable); assert.equal(result.model.lesson.title.en, draft.lesson.title.en);
  assert.deepEqual(result.model.content, draft.content); assert.notEqual(result.report.draftFingerprint, initial.report.draftFingerprint);
  assert.deepEqual(result.model.resources, { examples: [], references: [], lessons: [] });
  const canonical = await fetch(new URL("/learn/java/interfaces", origin)); assert.equal(canonical.status, 200);
  const html = await canonical.text(); assert(!html.includes("UNSAVED Interfaces preview")); assert(html.includes("This lesson is not fully authored yet"));
  draft.lesson.status = "COMPLETE";
  const incomplete = await submit(payload(), 200); assert(incomplete.report.renderable); assert(!incomplete.report.canPersistInFuture); assert(incomplete.model);
  draft.lesson.conceptIds = ["legacy:unresolved"];
  const invalid = await submit(payload(), 200); assert(!invalid.report.renderable); assert.equal(invalid.model, null); assert(invalid.report.issues.some((issue) => issue.code === "UNKNOWN_CONCEPT_ID"));
  await submit(JSON.stringify({ subjectId: "java", lessonId: draft.lesson.id, draft: { broken: true } }), 200);
  await submit("{", 400); await submit("{}", 403, { origin: "https://evil.test" }); await submit("{}", 415, { "content-type": "text/plain" });
  await submit("x".repeat(1048577), 413);
} else { await submit(payload(), 404); await submit("{", 404, { origin: "https://evil.test" }); }
for (const method of ["GET", "PUT", "PATCH", "DELETE"]) {
  const response = await fetch(target, { method, signal: AbortSignal.timeout(20_000) }); assert.equal(response.status, 405); console.log("preview unsupported method", method, response.status);
}
assert.deepEqual(await hashes(), before, "Preview modified canonical content files");
for (const route of ["/learn/python", "/learn/python/introduction", "/learn/python/lists", "/learn/dsa/binary-search", "/learn/java/interfaces"]) {
  const response = await fetch(new URL(route, origin), { signal: AbortSignal.timeout(20_000) }); assert.equal(response.status, 200);
  const html = await response.text(); assert(!html.includes("studio-page") && !html.includes("UNSAVED Interfaces preview"));
  assert(!html.includes("Author preview · static")); console.log("preview learner regression", route, response.status);
}
console.log("preview smoke canonical hashes unchanged");

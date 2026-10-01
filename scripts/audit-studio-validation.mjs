import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

// Read-only computations only. Never invoke persistence, modify content or Git.
const origin = new URL(process.argv[2] || "http://127.0.0.1:3011");
const enabled = process.argv[3] === "enabled";
assert(["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname));
assert(origin.protocol === "http:" && !origin.username && !origin.password);
assert(["enabled", "disabled"].includes(process.argv[3]));
const target = new URL("/api/studio/validation", origin);
const files = ["content/learn/registry.ts", "content/learn/lesson-content.ts", "content/concepts/registry.ts", "content/exercises.ts", "content/problems.ts"];
const hashes = () => Promise.all(files.map(async (file) => createHash("sha256").update(await readFile(file)).digest("hex")));
const before = await hashes();
async function submit(body, expected, headers = {}) {
  const response = await fetch(target, { method: "POST", headers: { origin: origin.origin, "content-type": "application/json", ...headers }, body, signal: AbortSignal.timeout(20_000) });
  assert.equal(response.status, expected);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const result = await response.json();
  console.log("validation smoke", response.status, result.code || result.status, result.counts || "");
  return result;
}
// Existing Java Interfaces fixture: no creation, no duplicate, no persistence.
const draft = { lesson: {
  id: "learn:java:interfaces", subjectId: "java", sectionId: "learn-section:java:object-model", slug: "interfaces", title: { en: "Interfaces", vi: "Interfaces" },
  description: { en: "Learn interfaces through concise explanations, examples, and connected practice.", vi: "Learn interfaces through concise explanations, examples, and connected practice." },
  order: 3, conceptIds: ["topic:object-oriented-programming"], prerequisiteLessonIds: ["learn:java:inheritance"], estimatedMinutes: 12, difficulty: "Foundational", status: "SKELETON", translationStatus: "english-only", exerciseIds: [], problemIds: [],
}, content: null };
const payload = () => JSON.stringify({ subjectId: "java", lessonId: draft.lesson.id, draft });
if (enabled) {
  const report = await submit(payload(), 200); assert.equal(report.hasErrors, false); assert.equal(report.canPersistInFuture, true); assert.match(report.draftFingerprint, /^[a-f0-9]{64}$/);
  draft.lesson.conceptIds = ["legacy:unresolved"];
  const invalid = await submit(payload(), 200); assert.equal(invalid.hasErrors, true); assert(invalid.issues.some((issue) => issue.code === "UNKNOWN_CONCEPT_ID" && issue.path === "lesson.conceptIds[0]"));
  const malformed = await submit(JSON.stringify({ subjectId: "java", lessonId: draft.lesson.id, draft: { broken: true } }), 200); assert.equal(malformed.renderable, false);
  await submit("{", 400); await submit("{}", 403, { origin: "https://evil.test" }); await submit("{}", 415, { "content-type": "text/plain" });
  await submit("x".repeat(1048577), 413);
} else { await submit(payload(), 404); await submit("{", 404, { origin: "https://evil.test" }); }
for (const method of ["GET", "PUT", "PATCH", "DELETE"]) {
  const response = await fetch(target, { method, signal: AbortSignal.timeout(20_000) }); assert.equal(response.status, 405); console.log("validation unsupported method", method, response.status);
}
assert.deepEqual(await hashes(), before, "Validation changed canonical source files");
console.log("validation smoke canonical hashes unchanged");

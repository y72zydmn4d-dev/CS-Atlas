/** Explicit reversible live QA only; never imported by Studio. No Git commands. */
import { readFile, writeFile, mkdtemp, rm, rename } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import assert from "node:assert/strict";
const origin = process.argv[2] ?? "http://127.0.0.1:3011";
if (!/^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(origin)) throw Error("Loopback only");
const disabled = process.argv[3] === "disabled";
const endpoint = `${origin}/api/studio/lesson`;
const headers = { origin, "content-type": "application/json" };
const query = "?subjectId=python&lessonId=learn%3Apython%3Aintroduction";
if (disabled) {
  for (const method of ["GET", "PUT"]) {
    const response = await fetch(endpoint + (method === "GET" ? query : ""), { method, headers, ...(method === "PUT" ? { body: "{}" } : {}) });
    assert.equal(response.status, 404); assert.equal(response.headers.get("cache-control"), "no-store");
  }
  console.log("Studio Save disabled: GET/PUT 404, no-store");
} else {
  if (process.env.CS_ATLAS_LIVE_SAVE_QA !== "1") throw Error("Set CS_ATLAS_LIVE_SAVE_QA=1 for one reversible real canonical Save test");
  const files = ["content/learn/subjects/python.json", "content/learn/lessons/python/introduction.json"];
  const before = await Promise.all(files.map(file => readFile(file)));
  const recovery = await mkdtemp(path.join(tmpdir(), "cs-atlas-save-qa-"));
  for (let i = 0; i < files.length; i++) await writeFile(path.join(recovery, String(i)), before[i]);
  await writeFile(path.join(recovery, "manifest.json"), JSON.stringify(files));
  console.log("Reversible QA originals retained at", recovery);
  let success = false;
  try {
    const response = await fetch(endpoint + query, { headers });
    assert.equal(response.status, 200, await response.clone().text());
    const source = await response.json();
    const draft = structuredClone({ lesson: source.lesson, content: source.content });
    const marker = `Studio parity ${randomUUID()}`;
    draft.lesson.title.en = marker;
    draft.content.summary.vi += " Kiểm tra lưu Unicode.";
    const input = { subjectId: "python", lessonId: source.lesson.id, draft, baseRevision: source.baseRevision };
    const save = await fetch(endpoint, { method: "PUT", headers, body: JSON.stringify(input) });
    assert.equal(save.status, 200, await save.clone().text());
    const result = await save.json();
    assert.equal(result.status, "saved"); assert.notEqual(result.inspection.baseRevision, source.baseRevision);
    assert.equal(result.inspection.lesson.title.en, marker); assert.equal(result.changedFiles.length, 2);
    const learner = await fetch(`${origin}/learn/python/introduction`);
    assert.equal(learner.status, 200); assert.ok((await learner.text()).includes(marker), "normal Learn must see saved title without restart");
    const studio = await fetch(`${origin}/studio?subject=python&lesson=learn%3Apython%3Aintroduction`);
    assert.equal(studio.status, 200); assert.ok((await studio.text()).includes(marker));
    const stale = await fetch(endpoint, { method: "PUT", headers, body: JSON.stringify(input) }); assert.equal(stale.status, 409);
    const current = await (await fetch(endpoint + query, { headers })).json();
    const invalid = structuredClone({ lesson: current.lesson, content: current.content }); invalid.lesson.conceptIds = ["invalid-concept"];
    assert.equal((await fetch(endpoint, { method: "PUT", headers, body: JSON.stringify({ ...input, draft: invalid, baseRevision: current.baseRevision }) })).status, 422);
    assert.equal((await fetch(endpoint, { method: "PUT", headers: { ...headers, origin: "https://evil.example" }, body: "{}" })).status, 403);
    assert.equal((await fetch(endpoint, { method: "PUT", headers: { ...headers, "content-type": "text/plain" }, body: "{}" })).status, 415);
    console.log("Live Save → fresh Studio/Learn readback; Unicode; stale409; validation422; origin403; type415: PASS");
    success = true;
  } finally {
    // Developer QA cleanup, not application Save: exact baseline bytes including version.
    // Fixed two targets only. Backups remain if interrupted or cleanup fails.
    for (let i = 0; i < files.length; i++) {
      const temp = `${files[i]}.qa-${randomUUID()}`;
      await writeFile(temp, before[i], { flag: "wx" }); await rename(temp, files[i]);
      assert.ok((await readFile(files[i])).equals(before[i]));
    }
    if (success) { await rm(recovery, { recursive: true }); console.log("Exact original content restored", before.map(b => createHash("sha256").update(b).digest("hex"))); }
  }
}

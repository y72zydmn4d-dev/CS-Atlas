// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { readFile, writeFile } from "node:fs/promises";
import { learnSubjects, learnRouteAliases } from "@/content/learn/registry";
import { learnLessonContent, learnExamples, learnReferences, learnQuizQuestions } from "@/content/learn/lesson-content";
import { canonicalJson, sha256 } from "@/lib/studio/writer/serialization.server";
import { storageFiles, migrateLearnStorage } from "../scripts/migrate-learn-storage";

function semanticHashes() {
  const subjects = structuredClone(learnSubjects).sort((a,b) => a.id.localeCompare(b.id));
  for (const s of subjects) for (const section of s.sections) for (const lesson of section.lessons) if (lesson.contentSource) lesson.contentSource = "canonical-body";
  return { subjects: sha256(canonicalJson(subjects)), bodies: sha256(canonicalJson([...learnLessonContent].sort((a,b) => a.lessonId.localeCompare(b.lessonId)))), relationships: sha256(canonicalJson([learnRouteAliases, learnExamples, learnReferences, learnQuizQuestions])) };
}
describe("canonical storage cutover", () => {
  it("round trips every expanded manifest/body, preserving semantics and ordering", () => {
    const files = storageFiles(learnSubjects, learnLessonContent);
    expect(files.size).toBe(24);
    for (const subject of learnSubjects) {
      const output = JSON.parse(files.get(`content/learn/subjects/${subject.id}.json`) ?? "null");
      const expected = structuredClone(subject);
      for (const section of expected.sections) for (const lesson of section.lessons) if (lesson.contentSource) lesson.contentSource = `content/learn/lessons/${lesson.subjectId}/${lesson.id.split(":")[2]}.json`;
      expect(output).toEqual(expected);
    }
    for (const body of learnLessonContent) expect(JSON.parse(files.get(`content/learn/lessons/${body.lessonId.split(":")[1]}/${body.lessonId.split(":")[2]}.json`) ?? "null")).toEqual(body);
    expect([...storageFiles(learnSubjects, learnLessonContent)]).toEqual([...files]);
  });
  it("matches the pre-cutover semantic digest", async () => {
    if (process.env.CS_ATLAS_MIGRATE_LEARN === "1") {
      await writeFile("tests/fixtures/learn-storage-parity.json", JSON.stringify(semanticHashes(), null, 2) + "\n");
      await migrateLearnStorage(process.cwd(), learnSubjects, learnLessonContent);
    } else expect(semanticHashes()).toEqual(JSON.parse(await readFile("tests/fixtures/learn-storage-parity.json", "utf8")));
  });
});

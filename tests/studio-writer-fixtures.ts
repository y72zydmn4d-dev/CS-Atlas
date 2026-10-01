import { mkdtemp, mkdir, writeFile, readFile, rm, realpath } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { learnSubjects } from "@/content/learn/registry";
import { concepts } from "@/content/concepts/registry";
import type { LearnLessonContent } from "@/lib/domain/learn-platform";
import { createCanonicalLessonWriter } from "@/lib/studio/writer/service.server";
import { serializeBody, serializeSubject, generateBodyIndex, generateSubjectIndex, sha256 } from "@/lib/studio/writer/serialization.server";
import { targetPath } from "@/lib/studio/writer/paths.server";
import { inventory } from "@/lib/studio/writer/repository.server";
import type { CanonicalReadOnlyDependencies, WriterDependencies } from "@/lib/studio/writer/types.server";

export async function writerFixture(hooks?: WriterDependencies["hooks"]) {
  const root = await realpath(await mkdtemp(path.join(os.tmpdir(), "cs-atlas-writer-")));
  const java = learnSubjects.find((subject) => subject.id === "java");
  const section = java?.sections.find((section) => section.lessons.some((lesson) => lesson.id === "learn:java:interfaces"));
  const interfaces = section?.lessons.find((lesson) => lesson.id === "learn:java:interfaces");
  const classes = section?.lessons.find((lesson) => lesson.id === "learn:java:classes");
  if (!java || !section || !interfaces || !classes) throw Error("Missing canonical fixture seeds");
  const subject = structuredClone(java);
  const first = structuredClone(interfaces); first.order = 1; first.status = "COMPLETE"; first.conceptIds = [concepts[0].id]; first.prerequisiteLessonIds = []; first.exerciseIds = []; first.problemIds = [];
  first.contentSource = targetPath({ kind: "body", subjectId: "java", lessonId: first.id });
  const second = structuredClone(classes); second.order = 2; second.conceptIds = [concepts[0].id]; second.prerequisiteLessonIds = []; second.exerciseIds = []; second.problemIds = []; delete second.contentSource;
  subject.navigationOrder = 1; subject.conceptIds = [concepts[0].id]; subject.sections = [{ ...structuredClone(section), order: 1, lessons: [first, second] }];
  subject.references = []; subject.exerciseGroups = []; subject.quizGroups = []; subject.relatedRoadmapIds = []; subject.relatedProblemIds = [];
  const body: LearnLessonContent = { lessonId: first.id, version: 1, reviewedAt: "2026-10-01", summary: { en: "Java interface contracts.", vi: "Hợp đồng giao diện Java." }, blocks: [
    { id: "objectives", type: "objectives", items: [{ en: "Declare an interface.", vi: "Khai báo giao diện." }] },
    { id: "explanation", type: "paragraph", body: { en: "An interface specifies a contract without choosing its implementation.", vi: "Giao diện mô tả hợp đồng, không chọn cách triển khai." } },
    { id: "example", type: "code", language: "java", code: "interface Named { String name(); }\n", caption: { en: "A contract", vi: "Một hợp đồng" } },
  ] };
  for (const relative of ["content/learn/subjects", "content/learn/lessons/java", "content/learn/generated", "content/concepts"]) await mkdir(path.join(root, relative), { recursive: true });
  for (const [relative, text] of [
    ["package.json", '{"name":"cs-atlas"}\n'], ["AGENTS.md", "# Fixture repository\n"],
    ["content/learn/registry.ts", "// Hand-maintained fixture source marker. Never rewritten.\n"],
    ["content/learn/lesson-content.ts", "// Read-only fixture example/reference/quiz source.\n"],
    ["content/concepts/registry.ts", "// Read-only fixture canonical Concept source.\n"],
    ["content/learn/subjects/java.json", serializeSubject(subject)], [first.contentSource, serializeBody(first, body)],
    ["content/learn/generated/subject-index.ts", generateSubjectIndex([subject.id])],
    ["content/learn/generated/lesson-content-index.ts", generateBodyIndex([first])],
  ]) await writeFile(path.join(root, relative), text, "utf8");
  const dependencies: CanonicalReadOnlyDependencies = { conceptIds: new Set([concepts[0].id]), exerciseIds: new Set(), problemIds: new Set(), examples: [], references: [], quizQuestions: [], aliases: [] };
  const configuration: WriterDependencies = { rootAnchor: path.join(root, "content/learn/generated"), readDependencies: async () => structuredClone(dependencies), hooks };
  const writer = createCanonicalLessonWriter(configuration);
  return { root, subject, body, dependencies, configuration, writer,
    async hashes() { return Object.fromEntries(await Promise.all((await inventory(root)).map(async (relative) => [relative, sha256(await readFile(path.join(root, relative)))]))); },
    async cleanup() { await rm(root, { recursive: true, force: true }); },
  };
}
export type WriterFixture = Awaited<ReturnType<typeof writerFixture>>;
export async function preparedUpdate(fixture: WriterFixture, edit = true) {
  const loaded = await fixture.writer.loadExistingLesson("java", "learn:java:interfaces");
  if (edit) {
    loaded.draft.lesson.title.en += " (revised)";
    const paragraph = loaded.draft.content?.blocks.find((block) => block.type === "paragraph");
    if (!paragraph || paragraph.type !== "paragraph") throw Error("Missing fixture paragraph");
    paragraph.body.vi += " Giữ nguyên Unicode và thứ tự.";
  }
  const receipt = await fixture.writer.validateExistingLesson("java", loaded.draft.lesson.id, loaded.draft);
  const request = { subjectId: "java", lessonId: loaded.draft.lesson.id, draft: loaded.draft, baseRevision: loaded.revision, receipt };
  return { loaded, receipt, request, plan: await fixture.writer.planExistingLessonUpdate(request) };
}

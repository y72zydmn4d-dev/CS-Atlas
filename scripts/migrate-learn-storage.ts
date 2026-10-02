/** Explicit engineering migration, never imported by Studio or run on application startup. */
import ts from "typescript";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SubjectManifest, LearnLessonContent } from "../lib/domain/learn-platform";
import { serializeBody, serializeSubject, generateBodyIndex, generateSubjectIndex } from "../lib/studio/writer/serialization.server";
import { targetPath } from "../lib/studio/writer/paths.server";

export function storageFiles(subjects: SubjectManifest[], bodies: LearnLessonContent[]) {
  const migrated = structuredClone(subjects);
  const lessons = migrated.flatMap(s => s.sections.flatMap(s => s.lessons));
  for (const lesson of lessons) if (bodies.some(b => b.lessonId === lesson.id)) lesson.contentSource = targetPath({ kind: "body", subjectId: lesson.subjectId, lessonId: lesson.id });
  const files = new Map<string, string>();
  for (const subject of migrated) files.set(targetPath({ kind: "subject", subjectId: subject.id }), serializeSubject(subject));
  for (const body of bodies) {
    const lesson = lessons.find(l => l.id === body.lessonId);
    if (!lesson?.contentSource) throw Error("Missing migration lesson");
    files.set(lesson.contentSource, serializeBody(lesson, body));
  }
  files.set("content/learn/generated/subject-index.ts", generateSubjectIndex(migrated.map(s => s.id)));
  files.set("content/learn/generated/lesson-content-index.ts", generateBodyIndex(lessons.filter(l => l.contentSource)));
  return files;
}
function declarationName(node: ts.Statement): string | undefined {
  if (ts.isVariableStatement(node) && node.declarationList.declarations.length === 1) {
    const name = node.declarationList.declarations[0].name;
    if (ts.isIdentifier(name)) return name.text;
  }
  if ((ts.isFunctionDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name) return node.name.text;
}
export async function migrateLearnStorage(root: string, subjects: SubjectManifest[], bodies: LearnLessonContent[]) {
  const registryPath = path.join(root, "content/learn/registry.ts");
  const registry = await readFile(registryPath, "utf8");
  if (registry.includes('from "./generated/subject-index"')) return; // already cut over; never overwrite edits
  const bodyPath = path.join(root, "content/learn/lesson-content.ts");
  const body = await readFile(bodyPath, "utf8");
  const files = storageFiles(subjects, bodies);
  // All serialization/collision checks before migration output.
  for (const [relative, text] of files) {
    try { if (await readFile(path.join(root, relative), "utf8") !== text) throw Error(`Migration collision: ${relative}`); }
    catch (error) { if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error; }
  }
  const registryAst = ts.createSourceFile("registry.ts", registry, ts.ScriptTarget.Latest, true);
  const keepRegistry = registryAst.statements.filter(s => !ts.isImportDeclaration(s) && !new Set(["text", "slugify", "LessonSeed", "SectionSeed", "authoredLessonIds", "buildSections", "subject", "pythonSections", "dsaSections", "learnSubjects"]).has(declarationName(s) ?? ""));
  const bodyAst = ts.createSourceFile("lesson-content.ts", body, ts.ScriptTarget.Latest, true);
  for (const [name, type, filename] of [["learnExamples", "LearnExample", "examples"], ["learnReferences", "LearnReference", "references"], ["learnQuizQuestions", "LearnQuizQuestion", "quizzes"]]) {
    const node = bodyAst.statements.find(s => declarationName(s) === name);
    if (!node) throw Error(`Missing ${name}`);
    files.set(`content/learn/${filename}.ts`, `import type { ${type} } from "@/lib/domain/learn-platform";\nconst t = (en: string, vi = en) => ({ en, vi });\n${node.getText(bodyAst)}\n`);
  }
  files.set("content/learn/registry.ts", 'import { lessons as legacyLessons } from "@/content/lessons";\nimport type { LearnRouteAlias } from "@/lib/domain/learn-platform";\nimport { parseSubjectManifest } from "@/lib/domain/learn-validation/subject";\nimport { learnSubjects as storedSubjects } from "./generated/subject-index";\n\nexport const learnSubjects = storedSubjects.map(value => {\n  const result = parseSubjectManifest(value);\n  if (!result.subject) throw new Error("Invalid canonical subject storage");\n  return result.subject;\n});\n\n' + keepRegistry.map(s => s.getText(registryAst)).join("\n\n") + "\n");
  const maps = bodyAst.statements.filter(s => declarationName(s)?.includes("By"));
  files.set("content/learn/lesson-content.ts", 'import { learnExamples } from "./examples";\nimport { learnReferences } from "./references";\nimport { learnQuizQuestions } from "./quizzes";\nimport { learnLessonContent as storedBodies } from "./generated/lesson-content-index";\nimport { learnLessonById } from "./registry";\nimport { parseLessonCandidate } from "@/lib/domain/learn-validation/parse";\nexport { learnExamples, learnReferences, learnQuizQuestions };\nexport const learnLessonContent = storedBodies.map(content => {\n  const lesson = learnLessonById.get(content.lessonId);\n  const result = parseLessonCandidate({ lesson, content });\n  if (!result.candidate?.content) throw new Error("Invalid canonical body storage");\n  return result.candidate.content;\n});\n' + maps.map(s => s.getText(bodyAst)).join("\n") + "\n");
  for (const [relative, text] of files) { await mkdir(path.dirname(path.join(root, relative)), { recursive: true }); await writeFile(path.join(root, relative), text, "utf8"); }
}

import "server-only";
import { readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { parseSubjectManifest } from "@/lib/domain/learn-validation/subject";
import { parseLessonCandidate } from "@/lib/domain/learn-validation/parse";
import type { LessonManifest } from "@/lib/domain/learn-platform";

/** Shared canonical disk reader. No Studio dependency, mutation, cache or fallback. */
export async function learnRepositoryRoot(anchor = process.cwd()): Promise<string> {
  let current = path.resolve(anchor);
  for (;;) {
    try {
      const pkg: unknown = JSON.parse(await readFile(path.join(current, "package.json"), "utf8"));
      if (pkg && typeof pkg === "object" && "name" in pkg && pkg.name === "cs-atlas") {
        await readFile(path.join(current, "AGENTS.md"));
        return realpath(current);
      }
    } catch (error) { if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error; }
    const parent = path.dirname(current);
    if (parent === current) throw Error("Canonical content root unavailable");
    current = parent;
  }
}
const token = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
export async function readCanonicalSubjects(root: string) {
  const directory = path.join(root, "content/learn/subjects");
  const names = (await readdir(directory)).sort();
  return Promise.all(names.map(async name => {
    if (!name.endsWith(".json") || !token(name.slice(0, -5))) throw Error("Invalid canonical subject filename");
    const parsed = parseSubjectManifest(JSON.parse(await readFile(path.join(directory, name), "utf8")));
    if (!parsed.subject || name !== `${parsed.subject.id}.json`) throw Error("Invalid canonical subject");
    return parsed.subject;
  }));
}
export async function readCanonicalLessonBody(root: string, lesson: LessonManifest) {
  if (!lesson.contentSource) return null;
  const parts = lesson.id.split(":");
  if (parts.length !== 3 || parts[0] !== "learn" || parts[1] !== lesson.subjectId || !token(parts[1]) || !token(parts[2])) throw Error("Invalid canonical lesson identity");
  const relative = `content/learn/lessons/${parts[1]}/${parts[2]}.json`;
  if (lesson.contentSource !== relative) throw Error("Invalid canonical body association");
  const result = parseLessonCandidate({ lesson, content: JSON.parse(await readFile(path.join(root, relative), "utf8")) });
  if (!result.candidate?.content) throw Error("Invalid canonical lesson body");
  return result.candidate.content;
}

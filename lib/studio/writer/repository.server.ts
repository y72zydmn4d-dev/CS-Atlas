import "server-only";
import { lstat, readFile, readdir } from "node:fs/promises";
import type { LearnLessonContent, LessonManifest, SubjectManifest } from "@/lib/domain/learn-platform";
import { flattenSubjectLessons, validateLearnPlatform } from "@/lib/domain/learn-platform";
import { parseSubjectManifest } from "@/lib/domain/learn-validation/subject";
import { parseLessonCandidate } from "@/lib/domain/learn-validation/parse";
import { checkedPath, bodyIndexPath, subjectIndexPath, targetPath, transactionRelativeRoot, safeToken } from "./paths.server";
import { generateBodyIndex, generateSubjectIndex, sha256 } from "./serialization.server";
import { AuthoringWriteError, writerLimits, type CanonicalRevision, type CanonicalReadOnlyDependencies } from "./types.server";

export interface CanonicalSnapshot {
  subjects: SubjectManifest[];
  lessons: Map<string, LessonManifest>;
  bodies: Map<string, LearnLessonContent>;
  texts: ReadonlyMap<string, string>;
  revision: CanonicalRevision;
  dependencies: CanonicalReadOnlyDependencies;
}
export async function inventory(root: string): Promise<string[]> {
  const files: string[] = [];
  async function walk(relative: string) {
    if (relative === transactionRelativeRoot) return;
    const absolute = await checkedPath(root, relative);
    const entries = await readdir(absolute, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, "en"))) {
      const next = `${relative}/${entry.name}`;
      if (next === transactionRelativeRoot) continue;
      if (entry.isSymbolicLink()) throw new AuthoringWriteError("PATH_REJECTED", [next]);
      if (entry.isDirectory()) await walk(next);
      else { await checkedPath(root, next); files.push(next); }
      if (files.length > writerLimits.inventory) throw new AuthoringWriteError("PREFLIGHT_FAILED");
    }
  }
  await walk("content");
  return files.sort();
}
async function resourceTexts(root: string, files: string[]): Promise<Map<string, string>> {
  const texts = new Map<string, string>(); let total = 0;
  for (const relative of files) {
    const absolute = await checkedPath(root, relative);
    const stat = await lstat(absolute);
    if (!stat.isFile() || stat.size > writerLimits.fileBytes || (total += stat.size) > writerLimits.snapshotBytes) throw new AuthoringWriteError("PREFLIGHT_FAILED", [relative]);
    // Preserve byte hashes (including invalid UTF8) separately through strict UTF8 roundtrip.
    const bytes = await readFile(absolute);
    const text = bytes.toString("utf8");
    if (!bytes.equals(Buffer.from(text, "utf8"))) throw new AuthoringWriteError("PREFLIGHT_FAILED", [relative]);
    texts.set(relative, text);
  }
  return texts;
}
export function revisionOf(texts: ReadonlyMap<string, string>): CanonicalRevision {
  const resources = Object.freeze(Object.fromEntries([...texts].sort(([a], [b]) => a.localeCompare(b, "en")).map(([relative, text]) => [relative, sha256(text)])));
  return Object.freeze({ fingerprint: sha256(JSON.stringify(resources)), resources });
}
export function assertRevision(expected: CanonicalRevision, current: CanonicalRevision) {
  if (expected.fingerprint !== current.fingerprint) {
    const resources = [...new Set([...Object.keys(expected.resources), ...Object.keys(current.resources)])].filter((key) => expected.resources[key] !== current.resources[key]).sort();
    throw new AuthoringWriteError("REVISION_CONFLICT", resources, undefined, { expectedRevision: expected.fingerprint, currentRevision: current.fingerprint });
  }
}
function parseJson(text: string): unknown {
  try { return JSON.parse(text); } catch { throw new AuthoringWriteError("VALIDATION_FAILED"); }
}
export function decodeSnapshot(texts: ReadonlyMap<string, string>, dependencies: CanonicalReadOnlyDependencies): CanonicalSnapshot {
  const subjects: SubjectManifest[] = [];
  for (const [relative, text] of texts) if (relative.startsWith("content/learn/subjects/")) {
    const parsed = parseSubjectManifest(parseJson(text));
    if (!parsed.subject || targetPath({ kind: "subject", subjectId: parsed.subject.id }) !== relative || !safeToken(parsed.subject.slug)) throw new AuthoringWriteError("VALIDATION_FAILED", [relative]);
    subjects.push(parsed.subject);
  }
  if (!subjects.length || !texts.has(subjectIndexPath) || !texts.has(bodyIndexPath)) throw new AuthoringWriteError("STORAGE_NOT_READY");
  subjects.sort((a, b) => a.navigationOrder - b.navigationOrder);
  const lessons = new Map(subjects.flatMap(flattenSubjectLessons).map((lesson) => [lesson.id, lesson]));
  const bodies = new Map<string, LearnLessonContent>();
  for (const [relative, text] of texts) if (relative.startsWith("content/learn/lessons/")) {
    const value = parseJson(text);
    const id = value && typeof value === "object" && "lessonId" in value && typeof value.lessonId === "string" ? value.lessonId : "";
    const lesson = lessons.get(id);
    if (!lesson || targetPath({ kind: "body", subjectId: lesson.subjectId, lessonId: id }) !== relative) throw new AuthoringWriteError("VALIDATION_FAILED", [relative]);
    const parsed = parseLessonCandidate({ lesson, content: value });
    if (!parsed.candidate?.content) throw new AuthoringWriteError("VALIDATION_FAILED", [relative]);
    bodies.set(id, parsed.candidate.content);
  }
  for (const lesson of lessons.values()) {
    const expectedSource = bodies.has(lesson.id) ? targetPath({ kind: "body", subjectId: lesson.subjectId, lessonId: lesson.id }) : undefined;
    if (lesson.contentSource !== expectedSource) throw new AuthoringWriteError("VALIDATION_FAILED");
  }
  const graphIssues = validateLearnPlatform({ subjects, lessonContent: [...bodies.values()], ...dependencies });
  if (graphIssues.length) throw new AuthoringWriteError("VALIDATION_FAILED");
  if (texts.get(subjectIndexPath) !== generateSubjectIndex(subjects.map((subject) => subject.id)) || texts.get(bodyIndexPath) !== generateBodyIndex([...lessons.values()].filter((lesson) => bodies.has(lesson.id)))) throw new AuthoringWriteError("VALIDATION_FAILED", [subjectIndexPath, bodyIndexPath]);
  return { subjects, lessons, bodies, texts, dependencies, revision: revisionOf(texts) };
}
/** Same canonical reader for baseline, preflight merged graph, and read-after-write. */
export async function readCanonicalSnapshot(root: string, readDependencies: () => Promise<CanonicalReadOnlyDependencies>, expectedRevision?: CanonicalRevision): Promise<CanonicalSnapshot> {
  const names = await inventory(root);
  // Fail before loading dependencies on the real, unmigrated checkout.
  if (!names.some((name) => /^content\/learn\/subjects\/[a-z0-9-]+\.json$/.test(name))) throw new AuthoringWriteError("STORAGE_NOT_READY");
  const before = await resourceTexts(root, names);
  if (expectedRevision) assertRevision(expectedRevision, revisionOf(before));
  const dependencies = await readDependencies();
  const after = await resourceTexts(root, await inventory(root));
  assertRevision(revisionOf(before), revisionOf(after));
  return decodeSnapshot(after, dependencies);
}

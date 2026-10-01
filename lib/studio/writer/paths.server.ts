import "server-only";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { isStudioEnabled } from "@/lib/studio/guard.server";
import { AuthoringWriteError, type LogicalTarget } from "./types.server";

export const transactionRelativeRoot = "content/learn/.authoring-transactions";
export const subjectIndexPath = "content/learn/generated/subject-index.ts";
export const bodyIndexPath = "content/learn/generated/lesson-content-index.ts";
export const guardWriter = () => { if (!isStudioEnabled()) throw new AuthoringWriteError("WRITE_DISABLED"); };
export function safeToken(value: unknown): value is string {
  return typeof value === "string" && value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
export function targetPath(target: LogicalTarget): string {
  if (target.kind === "body-index" && Object.keys(target).length === 1) return bodyIndexPath;
  if (!safeToken("subjectId" in target ? target.subjectId : undefined)) throw new AuthoringWriteError("PATH_REJECTED");
  if (target.kind === "subject" && Object.keys(target).length === 2) return `content/learn/subjects/${target.subjectId}.json`;
  if (target.kind === "body" && Object.keys(target).length === 3 && typeof target.lessonId === "string") {
    const parts = target.lessonId.split(":");
    if (parts.length === 3 && parts[0] === "learn" && parts[1] === target.subjectId && safeToken(parts[2])) return `content/learn/lessons/${target.subjectId}/${parts[2]}.json`;
  }
  throw new AuthoringWriteError("PATH_REJECTED");
}
export function isContained(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}
export function isMissing(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
/** Every component checked, no symlinks or hard-linked regular files even inside root. */
export async function checkedPath(root: string, relative: string, allowMissing = false): Promise<string> {
  if (!relative || relative.startsWith("/") || relative.includes("\\") || relative.includes("%") || relative.includes(":") || relative.includes("~") || /[\x00-\x1f]/.test(relative) || relative.split("/").some((part) => !part || part === "." || part === "..")) throw new AuthoringWriteError("PATH_REJECTED");
  const resolved = path.resolve(root, relative);
  if (!isContained(root, resolved) || (await realpath(root)) !== root) throw new AuthoringWriteError("PATH_REJECTED");
  const rootStat = await lstat(root);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) throw new AuthoringWriteError("PATH_REJECTED");
  let current = root;
  const parts = relative.split("/");
  for (let index = 0; index < parts.length; index++) {
    current = path.join(current, parts[index]);
    try {
      const stat = await lstat(current);
      if (stat.isSymbolicLink() || (index < parts.length - 1 && !stat.isDirectory()) || (stat.isFile() && stat.nlink !== 1) || (!stat.isFile() && !stat.isDirectory())) throw new AuthoringWriteError("PATH_REJECTED", [relative]);
      const actual = await realpath(current);
      if (!isContained(root, actual)) throw new AuthoringWriteError("PATH_REJECTED", [relative]);
    } catch (error) {
      if (isMissing(error) && allowMissing) break;
      if (isMissing(error)) throw new AuthoringWriteError("PREFLIGHT_FAILED", [relative]);
      throw error;
    }
  }
  return resolved;
}
export async function discoverRepositoryRoot(anchor: string): Promise<string> {
  let current = path.resolve(anchor);
  while (true) {
    try {
      const value: unknown = JSON.parse(await readFile(path.join(current, "package.json"), "utf8"));
      if (value && typeof value === "object" && "name" in value && value.name === "cs-atlas") {
        const root = await realpath(current);
        for (const marker of ["AGENTS.md", "content/learn/registry.ts", "content/learn/lesson-content.ts"]) await checkedPath(root, marker);
        return root;
      }
    } catch (error) { if (!isMissing(error)) throw new AuthoringWriteError("STORAGE_NOT_READY"); }
    const parent = path.dirname(current);
    if (parent === current) throw new AuthoringWriteError("STORAGE_NOT_READY");
    current = parent;
  }
}

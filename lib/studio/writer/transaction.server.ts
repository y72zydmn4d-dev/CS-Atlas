import "server-only";
import { mkdir, open, rename, link, unlink, readFile, readdir, rm, lstat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { checkedPath, guardWriter, isMissing, targetPath, transactionRelativeRoot } from "./paths.server";
import { sha256 } from "./serialization.server";
import { checkPlanTargets } from "./planning.server";
import { assertRevision, readCanonicalSnapshot, revisionOf } from "./repository.server";
import { AuthoringWriteError, writerLimits, type AuthoringWritePlan, type LogicalTarget, type WriterDependencies } from "./types.server";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
interface JournalChange { target: LogicalTarget; relativePath: string; action: "CREATE" | "UPDATE"; previousHash: string | null; nextHash: string }
interface Journal { version: 1; operationId: string; subjectId: string; lessonId: string; state: "PREPARED" | "COMMITTING" | "COMPLETED"; changes: JournalChange[] }
const operationRelative = (id: string) => {
  if (!uuidPattern.test(id)) throw new AuthoringWriteError("PATH_REJECTED");
  return `${transactionRelativeRoot}/${id}`;
};
async function syncDirectory(absolute: string) {
  const handle = await open(absolute, "r");
  try { await handle.sync(); } finally { await handle.close(); }
}
async function durableFile(absolute: string, text: string) {
  const handle = await open(absolute, "wx", 0o600);
  try { await handle.writeFile(text, "utf8"); await handle.sync(); } finally { await handle.close(); }
}
async function writeJournal(directory: string, journal: Journal) {
  const temporary = path.join(directory, `journal-${randomUUID()}`);
  await durableFile(temporary, JSON.stringify(journal, null, 2) + "\n");
  await rename(temporary, path.join(directory, "journal.json"));
  await syncDirectory(directory);
}
async function currentText(root: string, relative: string): Promise<string | null> {
  const absolute = await checkedPath(root, relative, true);
  try {
    const stat = await lstat(absolute);
    if (!stat.isFile() || stat.size > writerLimits.fileBytes) throw new AuthoringWriteError("REVISION_CONFLICT", [relative]);
    return await readFile(absolute, "utf8");
  } catch (error) { if (isMissing(error)) return null; throw error; }
}
const hashOrNull = (text: string | null) => text === null ? null : sha256(text);
async function requireHash(root: string, relative: string, expected: string | null) {
  if (hashOrNull(await currentText(root, relative)) !== expected) throw new AuthoringWriteError("REVISION_CONFLICT", [relative]);
}
async function internalDirectory(root: string) {
  const absolute = await checkedPath(root, transactionRelativeRoot, true);
  await mkdir(absolute, { mode: 0o700, recursive: true });
  await checkedPath(root, transactionRelativeRoot);
  return absolute;
}
export async function assertNoAbandonedTransaction(root: string) {
  const absolute = await checkedPath(root, transactionRelativeRoot, true);
  let entries: string[];
  try { entries = await readdir(absolute); } catch (error) { if (isMissing(error)) return; throw error; }
  if (entries.some((entry) => entry !== "writer.lock")) throw new AuthoringWriteError("RECOVERY_REQUIRED");
}
async function acquireLock(root: string, operationId: string) {
  const directory = await internalDirectory(root);
  const lock = path.join(directory, "writer.lock");
  try { await durableFile(lock, JSON.stringify({ operationId, pid: process.pid }) + "\n"); }
  catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EEXIST") throw new AuthoringWriteError("WRITE_LOCKED");
    throw new AuthoringWriteError("STAGING_FAILED");
  }
  await syncDirectory(directory);
}
async function releaseLock(root: string, operationId: string) {
  const relative = `${transactionRelativeRoot}/writer.lock`;
  const absolute = await checkedPath(root, relative);
  const value: unknown = JSON.parse(await readFile(absolute, "utf8"));
  if (!value || typeof value !== "object" || !("operationId" in value) || value.operationId !== operationId) throw new AuthoringWriteError("RECOVERY_REQUIRED");
  await unlink(absolute); await syncDirectory(path.dirname(absolute));
}
async function cleanup(root: string, operationId: string) {
  const directory = await checkedPath(root, operationRelative(operationId));
  // Exact UUID directory owned by this operation, never a supplied/broad root.
  await rm(directory, { recursive: true });
  await releaseLock(root, operationId);
}
async function rollback(root: string, directory: string, journal: Journal, hooks?: WriterDependencies["hooks"]) {
  const restores: Array<{ index: number; before: string | null }> = [];
  // Preflight every backup/current resource before restoring any one target.
  for (let index = journal.changes.length - 1; index >= 0; index--) {
    const change = journal.changes[index];
    const text = await currentText(root, change.relativePath);
    const hash = hashOrNull(text);
    if (hash === change.previousHash) continue;
    if (hash !== change.nextHash) throw new AuthoringWriteError("ROLLBACK_FAILED", [change.relativePath], journal.operationId);
    if (change.action === "CREATE") restores.push({ index, before: null });
    else {
      const beforePath = await checkedPath(root, `${operationRelative(journal.operationId)}/before-${index}`);
      if ((await lstat(beforePath)).size > writerLimits.fileBytes) throw new AuthoringWriteError("ROLLBACK_FAILED", [change.relativePath], journal.operationId);
      const before = await readFile(beforePath, "utf8");
      if (sha256(before) !== change.previousHash) throw new AuthoringWriteError("ROLLBACK_FAILED", [change.relativePath], journal.operationId);
      restores.push({ index, before });
    }
  }
  for (const { index, before } of restores) {
    const change = journal.changes[index];
    await hooks?.rollingBack?.(index);
    const absolute = await checkedPath(root, change.relativePath);
    await requireHash(root, change.relativePath, change.nextHash);
    if (before === null) await unlink(absolute);
    else {
      const restore = path.join(directory, `restore-${randomUUID()}`);
      await durableFile(restore, before);
      await requireHash(root, change.relativePath, change.nextHash);
      await rename(restore, absolute);
    }
    await syncDirectory(path.dirname(absolute));
  }
  for (const change of journal.changes) await requireHash(root, change.relativePath, change.previousHash);
}

/** Not browser reachable. Only the service can issue/authorize executable plans. */
export async function executeTransaction(root: string, plan: AuthoringWritePlan, dependencies: WriterDependencies, authorize: () => Promise<void>): Promise<{ operationId: string; changedFiles: string[] }> {
  guardWriter();
  await checkPlanTargets(root, plan);
  await acquireLock(root, plan.operationId);
  let directory: string | null = null;
  let journal: Journal | null = null;
  let retain = false;
  let phase: "preflight" | "staging" | "commit" | "verify" = "preflight";
  try {
    guardWriter();
    await assertNoAbandonedTransaction(root);
    const fresh = await readCanonicalSnapshot(root, dependencies.readDependencies, plan.baseRevision);
    assertRevision(plan.baseRevision, fresh.revision);
    await authorize();
    for (const change of plan.changes) await requireHash(root, change.relativePath, change.previousHash);
    if (!plan.changes.length) return { operationId: plan.operationId, changedFiles: [] };
    phase = "staging";
    const stagingDirectory = await checkedPath(root, operationRelative(plan.operationId), true);
    await mkdir(stagingDirectory, { mode: 0o700 });
    // Cleanup authority starts only after exclusive creation succeeds.
    directory = stagingDirectory;
    journal = { version: 1, operationId: plan.operationId, subjectId: plan.subjectId, lessonId: plan.lessonId, state: "PREPARED", changes: plan.changes.map(({ target, relativePath, action, previousHash, nextHash }) => ({ target, relativePath, action, previousHash, nextHash })) };
    for (let index = 0; index < plan.changes.length; index++) {
      const change = plan.changes[index];
      const before = await currentText(root, change.relativePath);
      if (hashOrNull(before) !== change.previousHash) throw new AuthoringWriteError("REVISION_CONFLICT", [change.relativePath]);
      if (before !== null) await durableFile(path.join(directory, `before-${index}`), before);
      await durableFile(path.join(directory, `after-${index}`), change.text);
      if (sha256(await readFile(path.join(directory, `after-${index}`))) !== change.nextHash) throw new AuthoringWriteError("STAGING_FAILED");
    }
    await writeJournal(directory, journal);
    await syncDirectory(path.dirname(directory));
    await dependencies.hooks?.staged?.();
    guardWriter();
    assertRevision(plan.baseRevision, (await readCanonicalSnapshot(root, dependencies.readDependencies, plan.baseRevision)).revision);
    await checkPlanTargets(root, plan);
    phase = "commit";
    journal.state = "COMMITTING"; await writeJournal(directory, journal);
    for (let index = 0; index < plan.changes.length; index++) {
      guardWriter();
      const change = plan.changes[index];
      const absolute = await checkedPath(root, change.relativePath, change.action === "CREATE");
      await requireHash(root, change.relativePath, change.previousHash);
      const staged = await checkedPath(root, `${operationRelative(plan.operationId)}/after-${index}`);
      if (sha256(await readFile(staged)) !== change.nextHash) throw new AuthoringWriteError("STAGING_FAILED");
      if (change.action === "CREATE") { await link(staged, absolute); await unlink(staged); }
      else await rename(staged, absolute);
      await syncDirectory(path.dirname(absolute));
      await dependencies.hooks?.replaced?.(index);
    }
    phase = "verify";
    await dependencies.hooks?.verifying?.();
    for (const change of plan.changes) await requireHash(root, change.relativePath, change.nextHash);
    const result = await readCanonicalSnapshot(root, dependencies.readDependencies);
    const expected = new Map(fresh.texts);
    for (const change of plan.changes) expected.set(change.relativePath, change.text);
    // Detect changes in any graph/readonly dependency, not just target outputs.
    assertRevision(revisionOf(expected), result.revision);
    journal.state = "COMPLETED"; await writeJournal(directory, journal);
    return { operationId: plan.operationId, changedFiles: plan.changes.map((change) => change.relativePath) };
  } catch (error) {
    if (journal && directory && journal.state !== "PREPARED") {
      try { await rollback(root, directory, journal, dependencies.hooks); }
      catch { retain = true; throw new AuthoringWriteError("ROLLBACK_FAILED", journal.changes.map((change) => change.relativePath), plan.operationId); }
    }
    if (error instanceof AuthoringWriteError && phase === "preflight") throw error;
    if (error instanceof AuthoringWriteError && error.code === "REVISION_CONFLICT" && phase !== "verify") throw error;
    throw new AuthoringWriteError(phase === "verify" ? "VERIFY_FAILED" : phase === "commit" ? "COMMIT_FAILED" : "STAGING_FAILED", [], plan.operationId);
  } finally {
    if (!retain) {
      try { if (directory) await cleanup(root, plan.operationId); else await releaseLock(root, plan.operationId); }
      catch { throw new AuthoringWriteError("RECOVERY_REQUIRED", [], plan.operationId); }
    }
  }
}

function parseJournal(value: unknown, operationId: string): Journal {
  const invalid = () => new AuthoringWriteError("RECOVERY_REQUIRED", [], operationId);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalid();
  const record = Object.fromEntries(Object.entries(value));
  if (Object.keys(record).some((key) => !["version", "operationId", "subjectId", "lessonId", "state", "changes"].includes(key)) || record.version !== 1 || record.operationId !== operationId || typeof record.subjectId !== "string" || typeof record.lessonId !== "string" || !Array.isArray(record.changes) || !record.changes.length || record.changes.length > writerLimits.files) throw invalid();
  const state = record.state;
  if (state !== "PREPARED" && state !== "COMMITTING" && state !== "COMPLETED") throw invalid();
  targetPath({ kind: "body", subjectId: record.subjectId, lessonId: record.lessonId });
  const changes: JournalChange[] = [];
  for (const value of record.changes) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw invalid();
    const entry = Object.fromEntries(Object.entries(value));
    if (Object.keys(entry).some((key) => !["target", "relativePath", "action", "previousHash", "nextHash"].includes(key)) || !entry.target || typeof entry.target !== "object") throw invalid();
    const raw = Object.fromEntries(Object.entries(entry.target));
    let target: LogicalTarget;
    if (raw.kind === "body-index" && Object.keys(raw).length === 1) target = { kind: "body-index" };
    else if (raw.kind === "subject" && raw.subjectId === record.subjectId && Object.keys(raw).length === 2) target = { kind: "subject", subjectId: record.subjectId };
    else if (raw.kind === "body" && raw.subjectId === record.subjectId && raw.lessonId === record.lessonId && Object.keys(raw).length === 3) target = { kind: "body", subjectId: record.subjectId, lessonId: record.lessonId };
    else throw invalid();
    const relativePath = targetPath(target);
    if (entry.relativePath !== relativePath || (entry.action !== "CREATE" && entry.action !== "UPDATE") || typeof entry.nextHash !== "string" || !/^[0-9a-f]{64}$/.test(entry.nextHash) || (entry.action === "CREATE" ? entry.previousHash !== null : typeof entry.previousHash !== "string" || !/^[0-9a-f]{64}$/.test(entry.previousHash))) throw invalid();
    changes.push({ target, relativePath, action: entry.action, nextHash: entry.nextHash, previousHash: typeof entry.previousHash === "string" ? entry.previousHash : null });
  }
  if (new Set(changes.map((change) => change.relativePath)).size !== changes.length) throw invalid();
  return { version: 1, operationId, subjectId: record.subjectId, lessonId: record.lessonId, state, changes };
}
/** Explicit local recovery only. Caller must establish that the crashed owner stopped. */
export async function recoverTransaction(root: string, operationId: string, confirmProcessStopped: boolean, verifyCanonical: () => Promise<void>): Promise<void> {
  guardWriter();
  if (!confirmProcessStopped) throw new AuthoringWriteError("RECOVERY_REQUIRED", [], operationId);
  const directory = await checkedPath(root, operationRelative(operationId));
  const lockPath = await checkedPath(root, `${transactionRelativeRoot}/writer.lock`);
  if ((await lstat(lockPath)).size > 1000) throw new AuthoringWriteError("RECOVERY_REQUIRED", [], operationId);
  const lock: unknown = JSON.parse(await readFile(lockPath, "utf8"));
  if (!lock || typeof lock !== "object" || !("operationId" in lock) || lock.operationId !== operationId) throw new AuthoringWriteError("RECOVERY_REQUIRED", [], operationId);
  const journalPath = await checkedPath(root, `${operationRelative(operationId)}/journal.json`);
  const stat = await lstat(journalPath);
  if (stat.size > 20_000) throw new AuthoringWriteError("RECOVERY_REQUIRED", [], operationId);
  let journal: Journal;
  try { journal = parseJournal(JSON.parse(await readFile(journalPath, "utf8")), operationId); }
  catch { throw new AuthoringWriteError("RECOVERY_REQUIRED", [], operationId); }
  if (journal.state === "COMPLETED") {
    for (const change of journal.changes) await requireHash(root, change.relativePath, change.nextHash);
  } else await rollback(root, directory, journal);
  await verifyCanonical();
  await cleanup(root, operationId);
}

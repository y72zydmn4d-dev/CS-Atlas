# 08 — Secure write foundation (Milestone F)

## Scope / activation

Internal server-only foundation, **not a Studio Save API/action**. Editor/shortcut/validation/preview remain nonpersistent. No live content migration/writes in F. Current manifests/bodies are hand-maintained TypeScript. Initialization fails STORAGE_NOT_READY until03's reviewed parity cutover. F exercises that exact canonical JSON layout in isolated fixtures, not an overlay/CMS. G must complete cutover and prove Learn/Search/HMR parity before exposing Save.

## Canonical / validation boundary

`lib/studio/writer/` receives existing canonical IDs, transient candidate and loaded revision; no browser path/report/valid:true. The canonical JSON reader uses actual SubjectManifest/LearnLessonContent and shared unknown-input parser plus `validateCanonicalLesson`/`validateLearnPlatform`. Subject parsing is a storage gate for the existing schema, not a Studio model.

A server-issued in-process receipt binds exact structural draft SHA256, fresh context revision and ERROR-free validation. Planning requires that receipt; execution re-reads/revalidates under lock. UI ValidationReport is not authorization. Existing identity/placement/source/version are immutable inputs. Body version increments only on semantic body edits; first body gets version1/server-derived contentSource. Future Save persists editor candidate, never preview projection.

## Ownership / paths

This operation may change only `content/learn/subjects/<subject>.json`, `content/learn/lessons/<subject>/<initial-slug>.json`, and exact generated `lesson-content-index.ts`. Subject index is checked, not rewritten. ASCII kebab identity tokens≤80; paths derive from registry identity, not labels/input paths. Reject dot/traversal/separators/absolute/home/URL/percent/control syntax. `path.relative` containment, lstat all ancestors/target, nearest existing real ancestor, regular singly-linked targets; reject all symlinks including in-root links. Recheck under lock before replacement. Other registries/source/config remain immutable.

Root discovery walks upward from a server-owned directory anchor, verifies `cs-atlas` package, AGENTS.md and canonical source markers, resolves real root. cwd alone is not authority. Trusted root/dependency adapter seam is server-only for fixtures/future composition, never HTTP input. Guard dev+explicit flag before I/O and again at planning/execution/recovery.

## Revisions / serialization / dry run

SHA256 revision over sorted relative names plus byte hashes: manifest/body inventory (including absence), both generated indexes and read-only content dependencies. Inventory changes conflict too. No mtime-only check/permanent cache. Bounded fresh scan favors correctness for local v1; no browser payload/catalog growth. Conflict reports relative changed resources only.

Schema-checked canonical JSON: stable recursive keys,2-space UTF-8/LF/final newline, exact strings/Unicode/code/array order. Unknown fields reject, not strip. Generated index uses a fixed literal-import template from validated IDs. Unchanged semantics avoid version bumps/rewrites. Limits≤3 files,≤2MiB/file,≤4MiB transaction. Dry run builds immutable domain-aware relative plan without lock/staging/files.

## Transaction lifecycle / guarantees

Check issued immutable plan, environment, paths/ownership/duplicates/presence/revisions and merged graph. Exclusive repository-local lock; no auto-stealing. Prepare all staged outputs/backups with exclusive restrictive files in `content/learn/.authoring-transactions/<UUID>/`, on destination filesystem. Flush files and journal before mutation, verify staged hashes. Recheck targets/hashes. Body precedes metadata; generated index last. CREATE uses no-clobber link, UPDATE same-volume atomic rename; never truncate canonical files.

Re-read every output, hash/schema/identity/graph/index verify with same canonical reader, mark COMPLETED, cleanup operation/lock. On replacement/verify failure preflight all rollback backups/current hashes, then restore prior bytes or remove only own created targets, conditional on bytes still matching transaction output; never overwrite intervening manual edits. Verify rollback hashes. ROLLBACK_FAILED retains journal/backups/lock; new writes stop. Narrow server-only phase hooks enable deterministic fault injection without changing filesystem globals.

Not globally atomic: readers can briefly see mixed files; death can interrupt renames. Durable PREPARED/COMMITTING/COMPLETED journals detect interrupted operations. Exclusive lock is fail-fast (not an in-process queue); no ambiguous automatic deletion/time-based stealing. Explicit recovery requires local operator confirmation that owning process stopped, validates paths/hashes/backups, rolls back uncertain commits or verifies completed output, then parses canonical graph before cleanup. Unsafe/mismatching/corrupt evidence remains. Death during early staging or final cleanup can leave a journal-less orphan lock/directory: explicit recovery refuses it; manual inspection is required. Manual recovery: stop all authoring processes, inspect relative journal/backups, invoke guarded recovery only after confirming ownership; otherwise independently review/restore prior bytes. Never delete old locks solely based on age.

Portable Node cannot eliminate every malicious same-OS-user path-swap/write TOCTOU; repeated checks narrow/detect but are not an OS sandbox. Flush/rename improve durability, not power-loss/hardware guarantees. Staging permissions are hygiene, not multi-user authentication.

## Errors / fixtures / G contract

Safe typed codes: WRITE_DISABLED, STORAGE_NOT_READY, VALIDATION_FAILED/STALE, REVISION_CONFLICT, PATH_REJECTED, OWNERSHIP_REJECTED, SERIALIZATION_FAILED, PREFLIGHT_FAILED, WRITE_LOCKED, RECOVERY_REQUIRED, STAGING_FAILED, COMMIT_FAILED, VERIFY_FAILED, ROLLBACK_FAILED. IDs/relative resources only, never raw stacks/prose.

Unique temporary canonical fixtures, real shared schemas/rules/readers. Gates: deterministic UTF-8/all blocks/no-op; invalid/stale validation/revisions; environments; traversal/encoded/mixed/absolute paths; symlinks/hardlinks/ownership/config/extensions/duplicates/collisions/missing targets; staging/mid-commit/verification faults; exact rollback/retained recovery evidence/locks. Real repository content hashes remain unchanged. No command/dependency/HTTP mutation exposure.

G separately requires parity migration, fresh canonical dependency adapter agreement, loaded base revision, guarded same-origin bounded typed Save, exact under-lock revalidation and safe conflicts/change report. No preview or client report can authorize persistence.

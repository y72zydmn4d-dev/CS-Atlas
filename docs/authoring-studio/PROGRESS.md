# Content Authoring Studio — resumable checkpoint

STATUS: MILESTONE G — COMPLETE.
EXISTING LESSON SAVE: ENABLED.
CREATE NEW LESSON: NOT IMPLEMENTED.
CREATE SECTION: NOT IMPLEMENTED.
CURRICULUM REORDER: NOT IMPLEMENTED.
NEXT: MILESTONE H — CREATE NEW LESSON.
G BASE COMMIT: c0ce7d6; CURRENT BRANCH: atlas-v2. LOCAL COMPLETION COMMIT: feat(studio): enable safe existing lesson saves (this checkpoint; resolve exact hash with git log).
G CURRENT WRITER CONTRACT: F receipt/revision-bound existing-lesson plans and transaction executor; guarded GET/PUT exposure, validated end to end.
G CURRENT CANONICAL STORAGE: canonical JSON manifests/bodies; hand-maintained compatibility adapters and read-only Example/Reference/Quiz leaves.
G STORAGE CUTOVER STATUS: 13 canonical manifests / 9 bodies migrated; semantic digest parity and 14 initial Learn tests passed; no skeleton body expansion. Shared fresh JSON reader powers Studio and dev Learn; static import adapters power build/Search.
G SAVE EXPOSURE STATUS: guarded GET/PUT /api/studio/lesson plus Save/Ctrl+S implemented. No other persistence operations. F executor is the sole canonical write path.
G EXACT NEXT ACTION: after owner authorizes H, verify this checkpoint/worktree, read03/08/09, design canonical new-lesson identity/collision/curriculum insertion as a distinct operation using F. Do not reuse existing-lesson Save to create identities. Keep next-env.d.ts untouched. No push/merge.
G EVIDENCE SO FAR: isolated service and request/UI suites passed; one controlled real Save changed Python title/VI summary, HTTP200 normal Learn and Studio reflected it without restarting dev; stale409, invalid422, origin403/type415 passed. Developer audit restored exact two original JSON byte hashes (see09/06). Browser inventory empty/iab unavailable. Full interim suite exposed eight outdated/first-live-storage assertions; fixed fixture subject lookup, no-Save expectations, internal boundary contract and ignored noncanonical Finder .DS_Store (never deleted).
RESUME 2026-10-02: recovered unchanged G worktree on c0ce7d6. Last full run: 82 suites passed / 1 failed, 713 tests passed / 1 failed. Sole failure studio-validation-ui.test.tsx Vietnamese diagnostic notice expectation; restore established wording, retaining Save revalidation text. Prior chained lint/typecheck did not run. Previous terminal handles expired; recover/check local processes before final smokes. No commit until all final gates pass.

### G completion evidence / files / limits

- Fixed the exact interrupted failure by restoring established VI diagnostic-language copy, not weakening the test or rewriting Save. Focused6 suites/31 tests passed. Final typecheck/lint (zero warnings),83 suites/714 tests, production build740 entries and build audit passed. Unused test-import cleanup additionally verified with35 writer-security tests/typecheck/lint. All72 F writer tests retained.
- Enabled-dev Studio/registry/validation/preview/Learn smokes pass; disabled-dev and production flag=true page/API denial verified, including Save GET/PUT404/no-store. One previous opt-in live Save/readback/restore audit passed; final original content hashes rechecked (06/09). No test content remains. Owned QA servers stopped. No safe browser available; visual/native focus/theme checklist remains manual in06.
- Storage:13 JSON manifests/nine bodies, generated literal indexes/dependency seal; retired TS literal storage, unchanged aliases/read-only Example/Reference/Quiz leaves. Shared fresh disk reader in lib/learn; existing facade imports power builds/Search. Semantic parity snapshot proves migrated content/order/relationships. Normal Learn refresh sees Save without restart; Search remains metadata projection/module invalidation, not new full-text indexing.
- Save: app/api/studio/lesson; lib/studio/save contracts/client/request/server/live composition; writer/live dependency adapter. UI LessonSave and existing draft session handle Ctrl/Cmd+S, busy state, canonical readback baseline/new revision, errors/conflicts/confirmed reload and changed paths. No create/reorder/slug/Git workflow.
- Files changed: content/learn/{subjects,lessons,generated,registry,lesson-content,examples,references,quizzes}; lib/learn/content-storage.server; lib/studio/{content-reader,types,save*,live-save,writer/live*,writer/repository}; app/api/studio/lesson and selected Studio/Learn pages/styles; components/studio/{lesson-editor,lesson-save,studio-draft-session}; i18n/messages/studio; scripts/{migrate-learn-storage,audit-studio,audit-studio-save}; G fixture/service/request/UI/seal/parity tests and narrowly updated existing assertions; Studio00–06/08/09/PROGRESS, learn-authoring, STATUS, directory ownership, TASKS, DECISIONS. No dependency/vendor changes.
- Audit:107 chunks /959,586 aggregate gzip bytes; largest148,115; Studio14,659 (+1,731 vs F). Writer stays server-only. Conservative bounded server graph scans remain; no428-body/client bulk load or build on Save.
- Remaining limits: per-file atomicity, conditional verified rollback, same-account TOCTOU/crash recovery as F; conservative cross-record conflicts; readonly dependency seal and initial migration snapshot need reviewed maintenance after intentional content changes. Readback failure after committed write is critical READBACK_FAILED, not false unchanged success. Preview/validation reset after canonical rebase. No browser visual certification.
- Original unrelated next-env.d.ts blob a419cbe4e3a5e8d4b481b851dbf4ac767de069e6 preserved/excluded. Final scoped diff/check and local commit only; no push/merge. Historical checkpoints below describe their original scope, not current G behavior.

## Completed Milestone F checkpoint (historical)
CURRENT BRANCH: atlas-v2.
CURRENT COMMIT / BASE: 13b92af (E), verified; M0/A/B/C/D/E not restarted.
LOCAL COMPLETION COMMIT: feat(studio): add secure canonical write foundation (this checkpoint; resolve with git log).
WRITE FOUNDATION: IMPLEMENTED; internal server-only, fixture-tested.
STUDIO SAVE UI: NOT CONNECTED.
CANONICAL CONTENT: real TypeScript READ-ONLY / unchanged.
REAL CANONICAL CONTENT WRITES: NOT EXERCISED BY STUDIO.
WRITER TESTS: FIXTURE-ONLY.
NEXT: MILESTONE G — SAVE EXISTING LESSON.

## Architecture decisions / current write contract

- One canonical model: exact SubjectManifest/LearnLessonContent JSON layout proposed by03, never a persisted Studio DTO/override. Current live TypeScript files remain hand-maintained. F scope forbids real migration; actual initialization fails STORAGE_NOT_READY. The reviewed parity cutover/fresh dependency adapter/HMR proof is mandatory before G exposure.
- Internal service factory accepts server-owned directory anchor/dependency adapter, not browser paths. Verify cs-atlas package/AGENTS/canonical source markers and real root. Exact targets: subjects/<id>.json, lessons/<subject>/<initial-ID-slug>.json, and generated/lesson-content-index.ts. Subject index/read-only registries/all other TS/config/Git files are immutable.
- Guard dev AND exact AUTHORING_STUDIO_ENABLED=true independently in service, planning/preflight, execution/recovery. No current UI/API/action imports writer. Ctrl/Cmd+S remains explanatory, no Save. No shell/eval/dynamic author import, dependency, database, automatic Git or content deletion.
- Shared canonical/build validators + strict unknown-input subject/group/body parsing; D/F reuse extracted immutable existing-record policy. Process-local nontransferable ERROR-free receipt binds exact draft + fresh context; frozen issued plan revalidated/rebuilt under lock. Browser ValidationReport/preview projection cannot authorize persistence.
- SHA256 revision set of sorted relative byte resources/inventory, including manifests, bodies/absence, indexes and read-only content. No mtime/cache shortcuts; source changes conflict. Revision scanning is conservative/bounded, not bulk optimized. Future G browser contract must be narrow, not expose internal snapshot/plans.
- Stable JSON keys/UTF8/LF/final newline; preserve strings/VI/code/ordered arrays and every existing field. No-op/manual formatting avoided; only body semantic edits bump canonical version; first body version1/server-derived association. Generated index is fixed literal imports, not arbitrary TS rewriting.
- Closed domain/path/ownership/type policy, path.relative containment, nearest-existing real ancestor/all-component lstat, reject symlinks and hardlinked regular files, duplicate targets/collisions/limits. Recheck paths/hash near replacement; portable same-account TOCTOU is not completely eliminable.
- Exclusive no-steal/fail-fast repository lock (not automatic queue/retry), restrictive flushed staging/backups and durable phase journal. Prepare-all-before-mutate; atomic per-file rename/no-clobber CREATE; canonical graph/hash read-after-write. Multi-file changes are rollback-protected, NOT globally atomic.
- Preflight all rollback current hashes/backups; restore only own output, preserve intervening manual edits; verify original bytes. ROLLBACK_FAILED retains evidence/lock. Explicit stopped-owner-confirmed recovery validates paths/hashes/graph; ambiguous/corrupt/missing journals or orphan locks require manual inspection, never age-based cleanup. No process-kill/power-loss certification.

## Completed / files changed

- Read all Studio contracts, root instructions/tasks/decisions/authoring docs, actual storage/validators/guards and local Next server-only guidance. Wrote08-save-pipeline before transaction code and kept this checkpoint during implementation.
- lib/domain/learn-validation/{subject,existing}.ts: actual canonical storage parser/shared immutable policy; lib/studio/validation.server.ts uses same identity rule, remains read-only.
- lib/studio/writer/{types,paths,serialization,repository,planning,transaction,service}.server.ts: typed safe errors/limits, canonical reader/serializer, revision/receipts/plans/dry run, exact path ownership, guarded locking/staging/verification/rollback/recovery.
- tests/studio-writer-{fixtures,planning.test,security.test,transaction.test}.ts; existing studio-read-only-boundary regression narrowly admits only unexposed internal writer directory.
- docs/authoring-studio/{08-save-pipeline,01-author-workflow,02-security-boundary,03-content-file-contract,04-validation-model,06-qa,PROGRESS}; docs/learn-authoring.md/STATUS.md/atlas-v2/05-directory-structure.md; TASKS.md/DECISIONS.md and narrow transaction .gitignore rule.
- No canonical content, app/component/UI/route, landing, dependency, Practice vendor or unrelated user changes included.

## Validation passed

- npm run typecheck; npm run lint: pass, zero warnings.
- npm test:78 suites /689 tests.72 new writer tests across3 suites; final staging-collision test proves cleanup never deletes an unowned directory. A–E/shared learner/request/security regressions retained.
- Determinism/all13 subject and9 body round trips/all16 variants/VI/order/no-op; malformed/unknown references/identity/body removal; forged/stale/other-service receipts; external revisions/inventory/collision/missing targets; path/ownership/symlink/hardlink/resource bounds/environment guards.
- Staging failure, either replacement in2-file commit, verification/canonical parse failure,3-file CREATE rollback, exact before hashes, rollback failure/evidence retention, manual-edit non-overwrite, explicit PREPARED/COMMITTING/COMPLETED recovery, corrupt/path-shaped journals/backups, locks/abandoned evidence. Isolated temp repositories only.
- npm run build:739 entries, unchanged route surface. Final audit:build:106 chunks/940,021 gzip (same as E; repeated artifacts varied by5 bytes), largest148,115 and Studio12,928 unchanged; no writer/client import or package.
- Enabled-dev existing Studio/page/relationship/validation/preview and representative learner smokes pass; disabled dev flag=false and production flag=true404/no-store; computational methods405, guarded malformed request400/403/415/413. Public-entry16-route/Guest/artwork audit passes. No writer endpoint/control. Owned QA servers stopped.
- Real content23-file aggregate before/after SHA256 afed10235bac89b24518b57c9ae09957404bc903deb6ea2b386c6fe39348193e unchanged. git diff content/vendor empty; no real transaction directory. Original next-env.d.ts blob a419cbe4e3a5e8d4b481b851dbf4ac767de069e6 preserved after Next generation; never staged.
- git diff --check and scoped staged-diff review required before local commit. No push/merge.

## Open risks / known limitations

- Studio still cannot Save/create/reorder. Live JSON migration/reader/HMR/search/alias parity not done. Internal canonical JSON fixture reader is not proof of live Learn refreshing after writes. G must activate one source of truth, not an override, before UI persistence.
- No browser provider (browsers:[]; iab unavailable). Independent rendered/keyboard/console/assistive-tech/HMR QA remains manual in06; F has no new author UI.
- Conservative bounded full content revision/graph scans; no bulk writer. Existing syntax language/quality rules unchanged; no quiz/registry authoring or educational-depth certification.
- Atomicity is per file only; readers may see mixed files during commit. Process/power failure can retain a journal/lock. Early-staging/final-cleanup orphan without intact journal requires manual review. Recovery never guesses/steals/overwrites conflicting manual bytes. Portable Node is not a malicious-local-account sandbox.
- F foundation is not writer HTTP authorization certification. G must enforce explicit dev enablement, same-origin/content-type/size limits, typed domain operation and fresh exact-draft validation/revision under lock independently of UI.

EXACT NEXT ACTION: Verify this F local commit/atlas-v2/worktree; read03/08/06 and this checkpoint. For owner-authorized Milestone G only, first complete/review canonical JSON parity cutover and fresh dependency/read adapter/HMR agreement while preserving IDs/routes/aliases/Search/manual editing. Do NOT connect Save to unmigrated TS or serialize preview. Then deliberately add guarded typed existing-lesson Save with base revision, exact validation and safe conflicts/change report; repeat isolated failures and production/no-write security checks.

PREVIOUS CHECKPOINTS: M0 168f760; A b3cb336; B9633dda; C e97472f; D3b7cc33; E13b92af.

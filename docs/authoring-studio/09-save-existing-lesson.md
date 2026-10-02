# 09 — Existing lesson Save (Milestone G)

Status: G implemented from c0ce7d6; final QA recorded in06. Storage parity preceded Save integration. No Create/reorder/slug migration.

## Cutover plan (before migration)

Current Learn/Studio/build consumers share TypeScript exports from registry.ts and lesson-content.ts; F can only write canonical JSON. Materialize the 13 actual SubjectManifest objects (including nested skeleton metadata) and nine authored bodies using F's deterministic serializer. Only contentSource changes to its derived JSON path. Do not create skeleton bodies. Retire seed/body literals, keep facade exports/maps and unchanged legacy aliases. Extract existing examples/references/quizzes to read-only leaves. Generated literal import indexes feed synchronous build/Search consumers; strict parsers reject corrupt JSON, no fallback store.

Before cutover, tests capture normalized semantic hashes of every manifest/body and unchanged relationship/alias projections. A reviewed AST-based migration tool removes precisely named declaration nodes, never regex patches arbitrary TS. Migration execution is explicit, repository-local and separate from Studio. Existing files are never overwritten on collision with differing bytes. Git diff is the rollback record, no permanent backup source.

## Reader / freshness contract

Shared server canonical JSON reads supply Studio and development Learn lesson routes. Build/production use the same files via generated static imports. Selected body reads remain narrow; no permanent registry cache. Reload the learner page to observe Save; HMR is a convenience, not the correctness boundary. Search metadata consumes static JSON imports and refreshes through Next module invalidation/full reload; body text remains unindexed.

Read-only TypeScript dependency imports cannot certify freshness from filesystem bytes alone. A generated dependency seal binds source hashes AND semantic dependency hashes; writer rejects changed/stale dependencies until explicit developer regeneration and module reload agree. This is a generated verification artifact, not another content store. No author code is executed to parse content.

## Save boundary

Guarded `GET/PUT /api/studio/lesson`: GET loads/reloads one existing record and revision; PUT saves. Explicit development enablement, exact loopback same-origin, JSON PUT streamed≤1MiB,120 requests/min per local worker, no-store/noindex. Browser submits IDs/candidate/base fingerprint only. GET's browser missing-Origin case requires same-origin Fetch Metadata and validated loopback Host; PUT never waives Origin. Server loads fresh canonical revision, rejects conflicts/new identity, validates exact draft, builds F receipt/plan, executes F transaction and reads canonical output again. No client plans/paths/reports; no Git, execution, creation/reorder/slug migration.

UI freezes editing/navigation while saving; failed requests keep draft. Successful readback establishes the new baseline/revision and clears validation/preview snapshots. Conflict offers Keep draft or confirmed Reload latest. Ctrl/Cmd+S uses the same operation. No-op skips transaction. Structured failures distinguish validation/conflict/transaction/recovery; rollback failure never claims unchanged bytes.

## Verification gates / next

Migration parity first; fixture request→writer→shared reader→render tests; Unicode/objectives/order/relations, stale tabs/manual edits, request adversaries, rollback UI, full existing suite/build/audit, practical dev learner refresh. Live content test changes must be restored exactly if used. No Milestone H features. Future Save persists editor candidate, never preview projection.

## Actual cutover / maintenance

13 JSON SubjectManifests retain428 nested lesson manifests/58 sections; nine JSON bodies preserve every authored field/block/EN/VI value, version and relationship. Only nine contentSource declarations changed location. Index import ordering is deterministic; curriculum arrays and explicit navigationOrder retain their semantics. Examples/references/quizzes are unchanged read-only leaves. Pre/post semantic digests are `tests/fixtures/learn-storage-parity.json`; round trips and existing Learn/alias/navigation/build tests verify compatibility. No permanent legacy source exists.

The reviewed one-time AST migration runs only via explicit `CS_ATLAS_MIGRATE_LEARN=1 npm test -- tests/learn-storage-migration.test.ts`; normal tests do not migrate. Do not rerun it to author content. Its already-cut-over check leaves existing JSON edits alone. Semantic baseline digests are migration evidence; intentional later content changes require reviewed parity-baseline maintenance, not silent test-content resets.

After intentionally editing a read-only registry/adapter, run `CS_ATLAS_REFRESH_DEPENDENCY_SEAL=1 npm test -- tests/studio-dependency-seal.test.ts`, review the generated seal diff and reload/restart development if module invalidation has not caught up. The runtime compares BOTH semantic imported values and source byte hashes; it never executes source read from disk. Ordinary lesson JSON edits do not require seal regeneration. Finder .DS_Store is excluded from canonical inventory, not deleted.

Save uses F's conservative bounded graph/revision scan (all current canonical files, only9 existing bodies); no full site rebuild/reindex per Save. Separate fresh selected-body reads serve Learn in development; production/build consume static imports of identical JSON. Specific lesson and subject paths are revalidated, not `/`. A full page refresh was verified to display saved title without server restart. Search indexes metadata only and uses JSON module invalidation/reload; no new body-search index or write projection.

One opted-in live HTTP audit (`CS_ATLAS_LIVE_SAVE_QA=1 node scripts/audit-studio-save.mjs http://127.0.0.1:3011`) changed Python Introduction title/VI summary, verified Save/readback/normal Learn,409/422/403/415, then restored exact original two files including version via explicit developer-test cleanup. SHA256: subject9e4b23c745c232aa24920f6fafeae03de489909b14f54e77e4a63766b56baf5d; body30ab8530365ef464711c46f60af5f703a6b22047165fcdcc4652dd1b0aee2089. No test prose remains.

## Limits

No browser automation available: native keyboard/focus/visual themes remain manual (06). F per-file atomicity, conditional rollback, conservative conflicts and crash/TOCTOU limits still apply. A readback failure after commit is READBACK_FAILED, not a false no-write conflict. No-op produces no transaction. Failed/critical Save preserves draft; ambiguous recovery is operator-owned. Existing canonical corruption or stale readonly seal fails closed, requiring manual repair before Save. No cloud/multi-user auth, bulk writes, automatic merge, Git or new record operations.

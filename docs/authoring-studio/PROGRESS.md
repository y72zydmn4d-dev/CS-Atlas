# Content Authoring Studio — resumable checkpoint

STATUS: MILESTONE D — COMPLETE.
CURRENT BRANCH: atlas-v2.
CURRENT COMMIT / BASE: e97472f (Milestone C), confirmed; M0/A/B/C complete.
CURRENT MILESTONE: D only. No restart, branch switch, push or merge.
LOCAL COMPLETION COMMIT: feat(studio): add authoritative canonical draft validation (the commit containing this checkpoint; resolve with git log -1).
CANONICAL CONTENT: READ-ONLY.
FILESYSTEM MUTATION: NOT IMPLEMENTED.
NEXT: MILESTONE E — CANONICAL LESSON PREVIEW.

ARCHITECTURE DECISIONS:

- One canonical model. AuthoringLessonDraft aliases the shared canonical LessonCandidate composition, not a persisted Studio record. Existing TypeScript content stays authoritative/read-only; no storage migration.
- Pure lib/domain/learn-validation parser reconstructs unknown input into actual LessonManifest + nullable LearnLessonContent. Modular metadata,16-block, registry, curriculum and status rules are reused by validateLearnPlatform/build, not separate Studio policies.
- Owning difficulty/translation/runtime/callout constants retain identical union values. Code syntax language remains a bounded display token, not Practice execution support.
- POST /api/studio/validation is read-only computation, not a persistence mutation. Dev AND explicit AUTHORING_STUDIO_ENABLED=true; independent route/service guard, exact direct loopback Host/Origin (no forwarded-host trust), JSON/stream1MiB/120 requests per minute/no-store/noindex.
- SHA256 candidate/context fingerprints and typed counts/codes/paths; report is content eligibility, not authorization/disk revision/Save ticket. Future F/G must revalidate exact current draft against fresh context under the writer lock.
- Separate client report state binds exact submitted structural draft; any edit marks stale, reset/selection clears, cancellation/sequencing prevents old-current verdicts. Unknown relationships are reported, not silently repaired.
- Prerequisites are DAG dependencies per M0; bounded iterative DFS checks reachable cycles. Related associations remain cyclic-capable, self-links invalid.
- SKELETON/PLANNED allow absent bodies, structural/reference corruption still errors. PARTIAL thin-body warning; COMPLETE requires substantive body, summary, review date and objectives. Quality hints nonblocking; no scoring/automatic promotion.

COMPLETED:

- Verified repo/atlas-v2/e97472f and original unrelated next-env baseline. Read requested architecture/workflow/security/QA/constitution/history and local Next16 route/Server Client guidance; inspected existing schema/build validators and all editable fields/roles.
- Documented04 contract before code. Shared parser/rules, guarded authoritative service/request adapter/typed transport and stale-aware bilingual report UI implemented. No Preview or writer.
- All9 authored lessons validate without ERRORs; real Java Interfaces SKELETON accepted. Unknown/duplicate IDs retained, all16 variants validated, static Example/Reference semantics and curriculum/identity/reserved routes/prerequisite cycles checked.
- 95 added tests; final full run 69 suites/565 tests green, including the owning-constant refactor. Typecheck/lint, production build and build budgets pass.
- Enabled/disabled/production HTTP guards/computation/unsupported-method smokes and canonical no-write hashes passed. Final fresh enabled-dev and flag=true production checks pass; temporary debugging removed; owned QA servers stopped.

FILES CHANGED:

- lib/domain/learn-validation/{types,parse,metadata,blocks,relationships,curriculum,status,index}.ts; owning lib/domain/learn-platform.ts and lib/types.ts reuse rules/runtime values, no union/data change.
- lib/studio/{draft,validation,validation.server,validation-request.server,validation-client}.ts; app/api/studio/validation/route.ts.
- components/studio/lesson-validation.tsx, lesson-editor.tsx; app/studio/studio.css; paired i18n/messages/studio.ts.
- New canonical validation fixtures/rules/service/route/client/UI tests; prior Studio no-write/UI/editor assertions updated for legitimate Validate behavior; scripts/audit-studio-validation.mjs (read-only computations/hashes).
- docs04,01,02,06,PROGRESS, learn-authoring, STATUS, atlas-v2 directory ownership and TASKS. Never stage next-env.d.ts.

VALIDATION:

- npm run typecheck; npm run lint; npm test; npm run build; npm run audit:build — all pass. Focused Studio/canonical validation tests also passed before the final full run.
- Build: 738 generated entries; 103 chunks/933,916 gzip (+2,281/~0.24% vs C), largest 148,115, largest route Studio 11,545; no dependencies. Public landing entry 5,149 unchanged, modern script census 173,908 (+620/~0.36% vs C), not a timing benchmark.
- Local HTTP enabled dev validation 200 (valid/invalid), controlled 400/403/415/413, unsupported methods 405; production flag=true and disabled dev 404; source hashes unchanged. Existing Studio/learner route and 16-route public-entry/artwork audits pass.
- git diff --check passes; canonical content/vendor/landing files unchanged. Original unrelated next-env.d.ts blob a419cbe4e3a5e8d4b481b851dbf4ac767de069e6 preserved and excluded from staging. No push or merge.

OPEN RISKS / KNOWN LIMITATIONS:

- No Preview/Save/Create/curriculum persistence, writer/storage migration, bulk health scan or Git operations. E–K unimplemented.
- Typed trusted TS registry snapshots follow Next dev HMR; no custom persistent cache. Disk-revision/registry freshness under lock remains F/G. Full subject/group/quiz unknown-input schemas remain future storage gates.
- English diagnostics explicitly labeled inside EN/VI UI. Click-to-focus and validation shortcut deferred; exact field paths/block IDs supplied. Presence policy does not certify educational depth/review quality or full translated body completeness.
- Browser inventory browsers:[]; no isolated rendered/keyboard/assistive-tech/console/HMR certification. Manual matrix in06-QA. Existing beforeunload/browser-shutdown limitations remain.

EXACT NEXT ACTION: E ONLY — read this checkpoint/04-validation-model and the existing real learner renderer/evidence boundaries. Design and implement canonical unsaved lesson preview, guarded and validated through the authoritative engine, with explicit no-evidence/no-execution behavior as appropriate. Do not duplicate a Studio renderer, restart earlier milestones or introduce filesystem persistence. F remains the unimplemented safe writer foundation.

PREVIOUS CHECKPOINTS: M0 168f760; A b3cb336; B9633dda; C e97472f. Do not repeat or infer writer completion.

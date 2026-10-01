# Content Authoring Studio — resumable checkpoint

STATUS: MILESTONE E — COMPLETE.
CURRENT BRANCH: atlas-v2.
CURRENT COMMIT / BASE: 3b7cc33 (Milestone D), confirmed; M0/A/B/C/D complete.
CURRENT MILESTONE: E only. No restart, branch switch, push or merge.
LOCAL COMPLETION COMMIT: feat(studio): add canonical unsaved lesson preview (this checkpoint; resolve with git log).
CANONICAL CONTENT: READ-ONLY.
FILESYSTEM WRITES: NONE from Studio; filesystem mutation NOT IMPLEMENTED.
PREVIEW: UNSAVED DRAFT SUPPORTED.
SIDE EFFECTS: DISABLED IN AUTHOR PREVIEW.
NO-WRITE GUARANTEE: preview remains in-memory; no filesystem/temp content, database, Save/Create/Reorder or Git operations from Studio.
CURRENT VALIDATION CONTRACT: server-authoritative, exact parsed draft/context fingerprints, strict guarded bounded read-only computation; no client verdict is trusted.
PREVIEW ARCHITECTURE: shared LessonContentSurface → original LessonBlockRenderer/ExampleRunner and real CSS. Server-selected public resources, exact authoritative preparation, transient Edit/Preview surface and typed author-preview mode. Learner wrapper/state/providers never mounted in Studio.
NEXT: MILESTONE F — SECURE WRITE FOUNDATION (not implemented).

E IMPLEMENTATION CHECKPOINT:

- Document05 completed before code. Normal Learn pipeline and evidence/bookmark/sidebar/runtime/AI boundaries audited. Shared LessonContentSurface extracted from the existing article; both Learn and Studio use the same LessonBlockRenderer and selected server-projected resources.
- Author-preview mode is presentation-only: no learner workspace/provider/sidebar, completion/bookmarks/AI absent, canonical links open safely in a new tab, examples static. No temporary files, preview persistence, code execution or writer.
- Guarded POST /api/studio/preview reuses D's bounded origin/request parsing and validates the exact draft; structured response includes report, fingerprints and selected render model. Explicit safe-content-presence ERRORs may preview but cannot persist; unknown integrity errors fail closed.
- In-workspace Edit/Preview with explicit refresh, cancellation/sequencing, stale indication, retained draft, reset clearing and render error boundary implemented. Paired EN/VI chrome; shared theme/CSS and locale fallback.
- E checks: typecheck/lint/full suite75 suites617 tests/build/audit and enabled/disabled/production HTTP/no-write/learner/public-entry smokes pass; details in06-QA.52 tests added since D. No isolated browser available; manual visual matrix remains explicit.
- Expected E files: shared Learn surface/environment/resource projection/copy leaf; Studio preview service/transport/route/UI; shared renderability/request helpers; selected learner route integration; tests, audit script and docs. next-env.d.ts remains unrelated/excluded.

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

- Confirmed atlas-v2/3b7cc33, M0–D checkpoints and pre-existing next-env baseline. Read architecture/workflow/security/file/validation/QA contracts, root instructions and local Next16 server/client/route/error guides. Recorded05 before code; mapped all actual learner state boundaries.
- Extracted shared real Learn article/selected resources/copy leaf. Normal learner wrapper retains evidence/bookmarks/actions/pagers/AI and QuickJS; Studio excludes them, static examples and safe new-tab content links.
- Authoritative read-only preview route/service and guarded typed transport; exact manifest/body/order/roles/locales maintained. Shared explicit renderability allows safe presence errors but all ERRORs still forbid future persistence. Unknown/integrity errors blocked without deleting IDs or auto-fixing.
- Edit/Preview reading mode, explicit refresh/Back, retained draft, authoritative report counts, current/stale fingerprints, abort/sequence/reset clearing and render-error isolation; EN/VI chrome, normal theme/CSS.
- Pure adapter/service/request/client/rendering/UI and actual storage/Library/runtime/Search no-side-effect regressions. Real Python/DSA/code/references/Skeleton plus all16 blocks/XSS/canonical-hash cases. No temporary files or preview persistence.
- Updated05/01/02/04/06/PROGRESS, authoring/status/task/ownership docs. No dependencies, schema/content/landing changes or writer.

FILES CHANGED:

- lib/domain/learn-rendering.ts; learn-validation/renderability.ts; lib/learn/render-resources.server.ts.
- components/learn/{lesson-content-surface,learn-render-environment,lesson-block-renderer,lesson-workspace,example-runner}.tsx; copy-code-block.tsx; interactive-content.tsx compatibility re-export; selected app/learn/[subject]/[page]/page.tsx resource loader.
- lib/studio/preview{,.server,-client}.ts; validation.ts/validation.server.ts/validation-request.server.ts; app/api/studio/{preview,validation}/route.ts.
- components/studio/{lesson-preview,preview-error-boundary,validation-issues,lesson-validation,lesson-editor}.tsx; app/studio/studio.css; i18n/messages/studio.ts.
- tests/studio-preview-{fixtures,model,server,route,client,rendering,ui}; existing learn-platform/studio-editor/studio-read-only-boundary/studio-validation-server tests; scripts/audit-studio-preview.mjs.
- docs/authoring-studio/{05,01,02,04,06,PROGRESS}; docs/learn-authoring.md/STATUS.md/atlas-v2/05-directory-structure.md; TASKS.md. Never stage next-env.d.ts.

VALIDATION:

- npm run typecheck; npm run lint (zero warnings); npm test75 suites/617 tests; npm run build; npm run audit:build — all pass. Focused tests exposed and fixed sibling-key and old-link/retained-form test expectations; no weakening of safety assertions.
- Build:739 generated entries;106 chunks/940,021 gzip (+6,105/~0.65% vs D), largest148,115 unchanged, largest route Studio12,928 (+1,383); no dependencies. Public landing entry5,149 unchanged, modern initial census174,882 (+974/~0.56%), not a timing/hydration benchmark.
- Enabled-dev preview/validation200 diagnostics, controlled400/403/415/413 and methods405; production flag=true and disabled-dev flag=false404/no-store. Source hashes unchanged, canonical Java route retains original Skeleton after unsaved preview. Studio/representative learner and16-route public-entry/artwork audits pass.
- git diff --check passes; canonical content/vendor/landing files unchanged. Original unrelated next-env.d.ts blob a419cbe4e3a5e8d4b481b851dbf4ac767de069e6 preserved and excluded from staging. No push or merge.

OPEN RISKS / KNOWN LIMITATIONS:

- No Save/Create/curriculum persistence, writer/storage migration, bulk health scan or Git operations from Studio. F–K unimplemented.
- Typed trusted TS registry snapshots follow Next dev HMR; no custom persistent cache. Disk-revision/registry freshness under lock remains F/G. Full subject/group/quiz unknown-input schemas remain future storage gates.
- English diagnostics explicitly labeled inside EN/VI UI. Click-to-focus and validation shortcut deferred; exact field paths/block IDs supplied. Presence policy does not certify educational depth/review quality or full translated body completeness.
- Content surface only, not full learner sidebar/rail/pagers/AI. Explicit refresh, static examples, no device frames/live diff. Safe missing content can preview but cannot persist. Metadata links absent from the normal article are not invented as new preview widgets.
- Browser inventory browsers:[]; isolated in-app browser creation failed (iab unavailable). No rendered/keyboard/assistive-tech/console/HMR certification. Manual matrix in06-QA. Existing beforeunload/browser-shutdown limitations remain.

EXACT NEXT ACTION: On the next owner-authorized F request, verify this checkpoint and read03-content-file-contract/05-preview-architecture/PROGRESS. Implement/test isolated fixture writer roots, deterministic serializer, revision protection and transaction-like rollback before exposing any repository mutation. E never writes; future Save must persist editor draft, not preview model, and revalidate under the writer boundary.

PREVIOUS CHECKPOINTS: M0 168f760; A b3cb336; B9633dda; C e97472f; D3b7cc33. Do not repeat or infer writer completion.

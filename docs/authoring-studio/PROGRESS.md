# Content Authoring Studio — resumable checkpoint

STATUS: MILESTONE A — COMPLETE. OVERALL STUDIO — READ-ONLY; B–K NOT IMPLEMENTED.

CURRENT MILESTONE: A only, resumed from168f760 on atlas-v2. Single local implementation commit identified by feat(studio): add read-only content authoring workspace. No push/merge/branch change.

ARCHITECTURE DECISIONS:

- One canonical Learn/Concept model. A reads existing TypeScript registries; no storage migration, parallel persisted model or writer. Milestone0 architecture/file contract remains authoritative in00/03.
- /studio Server Component and every server-only loader/reader require NODE_ENV=development AND exact AUTHORING_STUDIO_ENABLED=true. No NEXT_PUBLIC flag or learner nav entry.
- Next16 root loading streams page-level notFound as soft404. Added root proxy.ts matching ONLY /studio/:path* to hard404 disabled requests before rendering, plus independent internal guards. Enabled invalid selections may remain streamed404 interrupts, never Studio content. No learner routing changes.
- URL query selects canonical subject/lesson IDs. Client islands filter only metadata. Studio links disable prefetch. Overview/subjects/curriculum never call the body reader; selected valid lesson returns one actual body or null.
- Existing body module initializes nine trusted bodies/examples/references/quizzes server-side on first selection due current monolithic storage. No startup body read/client wholesale payload. Per-body file granularity is deferred to F, not hidden behind an A migration.
- Read-only inspector shows canonical metadata and escaped structured block payloads, NOT a second Learn renderer/preview. It never mounts LessonWorkspace/ExampleRunner, records progress or executes code. Exact /studio bypasses learner/Search/persistence services and reuses root theme/locale + existing LanguageSwitcher. Learner paths/providers remain unchanged.
- Health uses declared manifest counts; validation is explicitly not-scanned. COMPLETE is not a new quality certificate. Current EN/VI copies remain unchanged and English-only status is disclosed.
- Future JSON cutover/serializer/strict Origin/path containment/lock/journal/revision/recovery/preview gates are specified in03 but NOT implemented or certified in A.

COMPLETED:

- Verified /Users/trinhgiahuy/Documents/CS-Atlas, atlas-v2, Milestone0 commit168f760; resumed rather than restarting audit. Read checkpoint00/03, AGENTS/TASKS/DECISIONS, relevant ownership/content notes and local Next16 request/Server Component/notFound/environment/proxy guidance.
- Guarded read-only /studio with dense health header, Subject Explorer, ordered expandable Curriculum Explorer and selected Lesson Inspector. Search/status/section filters, real counts, actual skeleton-body absence, canonical learner links, sticky scroll panels, responsive stacking and paired EN/VI messages.
- Real inventory:13 subjects/58 sections/428 lessons;9 COMPLETE/419 SKELETON/0 PARTIAL/0 PLANNED lessons. Subjects:2 PARTIAL/11 SKELETON. Java Interfaces already exists; no content created.
- Tests cover disabled dev/test/production flag=true before reader invocation, route guards, proxy matcher excluding all learner/assets/APIs, counts/order/ownership/path-shaped IDs, narrow body loading, filters/localization, escaping and no inspector progress mutation.
- GET-only audit-studio script and actual enabled-dev/disabled-dev/production-flag=true HTTP checks. Production/disabled requests hard404; normal Learn/landing/workspace routes preserved. Existing public-entry audit passed.
- Added01 author workflow,02 implemented-vs-future security boundary,06 scoped QA. Updated manual authoring guide, status, ownership and task checkpoint; no historical design/audit rewrite.
- Only repository-local work; no dependency, external service, AI request, generic file endpoint, filesystem mutation workflow, Server Action, autosave, Git UI operation, Save/Create/Reorder/Validate/Preview controls or learner content changes.

FILES CHANGED:

- app/studio/page.tsx,studio.css;components/studio/studio-workspace.tsx,studio-overview.tsx,subject-explorer.tsx,curriculum-explorer.tsx,lesson-inspector.tsx,studio-text.tsx,studio-utilities.tsx;components/route-shell.tsx.
- lib/studio/guard.server.ts,content-reader.server.ts,loaders.server.ts,types.ts,navigation.ts;root proxy.ts;scripts/audit-studio.mjs.
- i18n/messages/studio.ts,en.ts,vi.ts;.env.example (commented default-off flag only).
- tests/studio-loaders.test.ts,studio-route.test.tsx,studio-proxy.test.ts,studio-ui.test.tsx;tests/route-shell.test.tsx.
- docs/authoring-studio/01-author-workflow.md,02-security-boundary.md,06-qa.md,PROGRESS.md;docs/learn-authoring.md,STATUS.md,atlas-v2/05-directory-structure.md;TASKS.md.
- Unrelated next-env.d.ts excluded and exact original user blob preserved:a419cbe4e3a5e8d4b481b851dbf4ac767de069e6. Restored only the two Next-generated build import deltas to the pre-existing dev imports after final build/QA; no normalization/revert to HEAD. QA servers stopped.

VALIDATION PASSED:

- npm run typecheck; npm run lint (zero warnings); npm test:56 suites/346 tests,57 Studio-specific tests plus Studio service-shell exclusion regression.
- npm run build:737 generated pages; npm run audit:build:100 chunks/921,458 total gzip bytes, largest148,115/largest route10,446, within existing budgets.
- node scripts/audit-studio.mjs http://127.0.0.1:3011 enabled:overview/subject/selected authored/skeleton, invalid selections inaccessible, missing Studio APIs, learner routes200.
- Same script3011 disabled with dev flag=false:all four Studio variants404. Same script3012 disabled with production flag=true:all four Studio variants404. /api/studio and /api/studio/write-file absent404.
- node scripts/audit-public-entry.mjs http://127.0.0.1:3012:16 learner routes200, public/workspace boundaries/Guest/artwork/bundle audit pass; public entry chunk5,149 gzip bytes, modern initial census170,572.
- Git whitespace checks pass. First UI checks failed on label concatenation (fixed) and incorrect test order1 assumption (canonical Introduction order2; test fixed). Final suite is green. First soft404 smoke prompted request guard; final disabled HTTP smoke green.
- No browser visual verification:browser inventory had no provider; isolated iab creation returned Browser is not available: iab. Exact remaining checks in06-qa.

OPEN RISKS: B–K parser/serializer/migration/body granularity/latest-source HMR/real no-evidence preview/strict Origin/path-symlink-hardlink/TOCTOU/revisions/transaction recovery/security gates remain required before writer exposure. Enabled dev must stay loopback-only, not a shared deployment.

KNOWN LIMITATIONS: A is inspection only. Validation not scanned; no editing/preview/save/create/reorder/pickers/Save & Next. Native block JSON is structural inspection, not lesson rendering. Independent browser theme/viewport/keyboard/console QA remains manual; tests/HTTP checks do not certify it. Existing learner provider initialization is not changed on learner URLs; Studio does not mount it.

FINAL IMPORT REVIEW: Existing learner AppShell→SearchDialog→content/index imports the monolithic v2 body module even on overview. To actually preserve the narrow-load boundary, exact /studio passes through RouteShell without WorkspaceProvidersShell; root ThemeProvider/LocaleProvider are reused. Studio owns main/skip link, existing LanguageSwitcher/theme utility and Home link. Learner providers/components remain unchanged for all existing learner URLs. Shell-exclusion regression, final enabled HTTP audit, typecheck/lint/346 tests/build all pass; docs record this narrow justified boundary refinement.

EXACT NEXT ACTION: Verify Git branch/status/log and this checkpoint +00/03/01/02/06. Next implementation is B ONLY: transient canonical-field editor/objectives/16 supported block controls/add-remove-reorder-collapse/dirty-state navigation warning, WITHOUT filesystem writes, persisted parallel records or fake working Save. Reuse read-only loaders/shell. Do not migrate TypeScript storage or implement F/G yet. Preserve next-env and frozen landing. Milestone A handoff uses the single feat(studio): add read-only content authoring workspace commit; if interrupted before that commit exists, stage only the listed task files after verifying validations and commit A first.

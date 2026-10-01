# Content Authoring Studio — resumable checkpoint

STATUS: MILESTONE B — COMPLETE. CANONICAL CONTENT REMAINS READ-ONLY; C–K NOT IMPLEMENTED.

CURRENT MILESTONE: B only, resumed from confirmed b3cb336 on atlas-v2. A and Milestone0 are complete; do not repeat them. No push/merge/branch change.

MILESTONE B CHECKPOINT:

- Completed: resumed b3cb336 without repeating M0/A. Cloned canonical draft/candidate boundary, selected structural comparison, immutable array/block helpers, metadata/EN/VI/objectives/12 direct payload editors, structured table/comparison controls and common16 block operations. Four registry-backed payloads stay read-only until C. Tests/build/guard smokes pass.
- Architecture: compose canonical LessonManifest + nullable LearnLessonContent in a cloned transient DTO; identity/slug/order/ownership/source and registry relationships remain read-only. Objectives are body blocks. No persisted draft model, API/action, repository Save, localStorage or code execution.
- Implemented navigation: native Studio-only links (no prefetch) permit clean document navigation; dirty selection/subject/Overview/Home/Learn links queue an accessible Discard/Cancel modal. Dirty-only beforeunload covers refresh/document history; no App Router history hacks. No learner routing change. Reset requires confirmation; Ctrl/Cmd+S only explains repository Save is unavailable. No body is fabricated for skeletons until explicit Start transient body; new body review date is empty, not a claim of review.
- Validation: typecheck/lint,60 suites/400 tests,737-page production build and budget audit passed. GET audits passed enabled-dev, disabled-dev and production flag=true. No browser provider; see06-qa for exact manual matrix.
- Known issues/open risks: browser visual QA was unavailable in A; native beforeunload prompts are browser-controlled and require user activation. Canonical syntax language remains a string, not a new Studio enum. Full validators/pickers/preview/writes remain absent. Preserve original next-env blob a419cbe4e3a5e8d4b481b851dbf4ac767de069e6.
- Final checkpoint: owned QA servers stopped, original next-env hash verified, docs/diff/whitespace reviewed. One local B commit identified by feat(studio): add transient structured lesson editor. If interrupted before commit exists, stage only the listed B files and create that commit; implementation/validation already complete. After handoff: C ONLY, canonical relationship pickers; no writes/Save/preview/authoritative validation.

ARCHITECTURE DECISIONS:

- One canonical Learn/Concept model. Existing TS registries remain authoritative/read-only. B draft composes exact LessonManifest + nullable LearnLessonContent; no storage migration, parallel persisted model or writer. M0 contract00/03 still governs later writes.
- /studio Server Component and every server-only loader/reader require NODE_ENV=development AND exact AUTHORING_STUDIO_ENABLED=true. No NEXT_PUBLIC flag or learner nav entry.
- Next16 root loading streams page-level notFound as soft404. Added root proxy.ts matching ONLY /studio/:path* to hard404 disabled requests before rendering, plus independent internal guards. Enabled invalid selections may remain streamed404 interrupts, never Studio content. No learner routing changes.
- URL query selects canonical IDs. Overview/subjects/curriculum never call body reader; selected valid lesson returns one body or null. Only active selection receives full draft state. Native Studio links do not prefetch; other learner links/routing are untouched.
- Existing body module initializes nine trusted bodies/examples/references/quizzes server-side on first selection due current monolithic storage. No startup body read/client wholesale payload. Per-body file granularity is deferred to F, not hidden behind an A migration.
- Server workspace composes read-only identity/relations with narrow client draft/editor components. No second Learn renderer/preview, LessonWorkspace/ExampleRunner, progress writes or execution. Exact /studio still bypasses learner/Search/persistence services and reuses root theme/locale + existing LanguageSwitcher; learner paths/providers unchanged.
- Health uses declared manifest counts; validation is explicitly not-scanned. COMPLETE is not a new quality certificate. Current EN/VI copies remain unchanged and English-only status is disclosed.
- Future JSON cutover/serializer/strict Origin/path containment/lock/journal/revision/recovery/preview gates in03 are NOT implemented or certified in A/B. No API/action endpoint exists.

COMPLETED:

- Verified repo/atlas-v2, commits168f760/b3cb336 and unrelated next-env; read checkpoint00/03/06, AGENTS/TASKS/DECISIONS/content-authoring notes and local Next16 Server/Client/Link/navigation guidance. Did not restart audit or implement A again.
- B: selected transient canonical editor, editable real metadata/body fields and independent EN/VI; objective/list controls; all12 direct block payload editors and all16 common title/reorder/duplicate/remove/collapse controls. No new block/status/language/persisted domain schema. Stable unique local duplicate IDs. Skeleton starts with actual null body; Start transient body initializes no fake review date or promotion.
- Accurate reversible dirty comparison; confirmed Reset; Discard/Cancel modal for lesson/subject/Overview/Home/Learn; native dirty-only beforeunload for document history/refresh. Ctrl/Cmd+S is informational only. No dirty warning for filters/language/collapse/new-tab; no draft persistence. Studio-native navigation is documented conservative choice, not learner routing redesign.
- Real inventory:13 subjects/58 sections/428 lessons;9 COMPLETE/419 SKELETON/0 PARTIAL/0 PLANNED lessons. Subjects:2 PARTIAL/11 SKELETON. Java Interfaces already exists; no content created.
- Tests prove source/baseline/output isolation, conversion, metadata/objectives/block edits and duplicate IDs, dirty/revert/reset, navigation and unload/shortcut handling, structured tables/comparisons, safe literal text, no learning-state mutation and no Studio writer/server-action/client-I/O imports. Existing guard/loader/shell regression tests retained.
- Enabled/disabled dev and production flag=true GET smokes; public-entry16-route/Guest/artwork audit. All learner routes preserved. Docs01/02/06, manual authoring/status/ownership/task checkpoints updated; M0/historical visual design documents unchanged.
- No new dependency, content/schema migration, external service/AI, client registry loading, generic API, filesystem writer, Server Action, localStorage/IndexedDB draft, Git UI command, Save/Create/curriculum Reorder/Validate/Preview action or learner content change.

FILES CHANGED:

- app/studio/studio.css; components/studio existing workspace,subject-explorer,curriculum-explorer,lesson-inspector; new studio-draft-session,studio-link,discard-changes-dialog,lesson-editor,lesson-metadata-editor,editor-fields,learning-objectives-editor,content-block-list,content-block-editor,structured-table-editor.
- lib/studio/draft.ts,document-navigation.ts; i18n/messages/studio.ts; scripts/audit-studio.mjs. Server loaders/readers/guard, route page, proxy and learner shell unchanged.
- tests/studio-draft.test.ts,studio-editor.test.tsx,studio-blocks.test.tsx,studio-read-only-boundary.test.ts; existing studio-ui.test.tsx.
- docs/authoring-studio/01-author-workflow.md,02-security-boundary.md,06-qa.md,PROGRESS.md;docs/learn-authoring.md,STATUS.md,atlas-v2/05-directory-structure.md;TASKS.md.
- Unrelated next-env.d.ts excluded; exact original user blob verified a419cbe4e3a5e8d4b481b851dbf4ac767de069e6 after QA shutdown. No content/config/dependency/generated vendor changes. Owned QA servers stopped.

VALIDATION PASSED:

- npm run typecheck; npm run lint (zero warnings); npm test:60 suites/400 tests,111 Studio tests across8 suites plus existing service-shell exclusion.54 new B tests. Initial Locale import/jsdom modal shim/outdated A expectations corrected; final checks green.
- npm run build:737 pages; npm run audit:build:100 chunks/927,898 total gzip bytes (+6,440/~0.70% vs A); largest148,115/largest route10,446 unchanged, within budgets.
- node scripts/audit-studio.mjs http://127.0.0.1:3011 enabled:overview/subject/selected authored/skeleton, invalid selections inaccessible, missing Studio APIs, learner routes200.
- Same script3011 disabled with dev flag=false:all four Studio variants404. Same script3012 disabled with production flag=true:all four Studio variants404. /api/studio and /api/studio/write-file absent404.
- Public-entry audit3012:16 routes200, Guest/shell/artwork/budgets pass; entry chunk5,149 unchanged; modern initial census172,334 (+1,762 vs A), not a hydration benchmark.
- Git whitespace checks pass. Browser inventory still browsers:[]; no visual/console/actual keyboard/native prompt QA claimed. Remaining manual matrix and jsdom limitation in06-qa.

OPEN RISKS: C–K parser/serializer/migration/body granularity/latest-source HMR/real no-evidence preview/strict Origin/path-symlink-hardlink/TOCTOU/revisions/transaction recovery/security gates remain required before writer exposure. Enabled dev must stay loopback-only. Native beforeunload is browser-controlled, requires activation and may be suppressed on mobile/termination; no draft recovery promise.

KNOWN LIMITATIONS: B drafts are transient only. Four registry-backed payloads remain read-only/non-addable until C; all other canonical block types editable. Validation not scanned; no preview/save/create/curriculum reorder/pickers/Save & Next. Full-document selections reload filter/collapse state. Browser visual/keyboard/theme/native-modal/history QA remains manual. No disk fingerprint/stale-write guarantee yet; structural dirty token is not a revision.

FINAL IMPORT REVIEW: Preserved A's exact /studio service-shell exclusion; editor imports no content registry/server-only loader. Server composition sends selected canonical inspection only. Learner providers/paths unchanged. Existing shell exclusion/narrow loader/guard tests,400-test full suite/build and HTTP audits pass. No learner runtime/rendering services in Studio.

EXACT NEXT ACTION: NEXT C ONLY — bounded canonical Concept/Exercise/Problem/LearnReference/existing-example pickers using this transient draft; no registry mutation/writes/Save/preview/authoritative validation. First verify branch/status/log, B semantic commit and checkpoint00/03/01/02/06; preserve next-env and frozen landing. Do not migrate storage or implement F/G. If B commit is absent after interruption, commit the coherent validated B files first; do not redo implementation.

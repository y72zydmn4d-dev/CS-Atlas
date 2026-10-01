# Content Authoring Studio — resumable checkpoint

STATUS: MILESTONE C — COMPLETE. CANONICAL CONTENT REMAINS READ-ONLY; D–K NOT IMPLEMENTED.

CURRENT MILESTONE: C only, resumed from confirmed9633dda on atlas-v2. M0/A/B complete; do not repeat. No push/merge/branch change.

ARCHITECTURE DECISIONS:

- One canonical content model. Existing TS registries stay authoritative/read-only. The B draft composes cloned LessonManifest + nullable LearnLessonContent; C changes only existing ID fields. No persisted Studio model, content/schema/storage migration or registry authoring.
- Exact dev+AUTHORING_STUDIO_ENABLED=true guard remains on page/loaders/readers; /studio proxy hard404 remains. C GET resource route independently denies unavailable environments before parsing/imports; it is not covered by proxy.
- Actual roles: ordered manifest Concept IDs, prerequisite Lesson IDs, Exercise IDs, Problem IDs. First Concept drives learner rail; no invented primary/related/prerequisite Concept roles. Blocks: single Example ID, single Exercise ID, Reference item IDs with subject/category context, separate Related Lesson/Problem arrays.
- Closed six-kind GET /api/studio/relationships/[kind], version1 narrow label/description/metadata/ID projections. Literal lazy server imports only. Search≤20, query≤120chars; selected-ID lookup≤40/request/200chars per ID; client batches larger legacy selections. Fixed local-worker600requests/min, no-store/noindex, same-origin/Fetch Metadata cross-site checks. No generic file/raw-registry endpoint.
- Debounced250ms search only when open, AbortController and effect-generation guards; selected metadata resolves only active draft links. Selection lives only in draft IDs; lookup/search metadata never persists. Unknown IDs remain repairable; request failure does not imply unknown membership. Legacy duplicates are preserved; new duplicates prevented.
- All16 block types now addable/editable. Single Example/Exercise blocks require canonical picker selection before Add; replace required link via search, remove whole block to unlink. Lists may be empty transiently. No code/source execution or copied registry bodies.
- Reuse B structural comparison and guarded native navigation. Reset/discard remounts picker/add-block UI via transient reset token, cancelling pending requests/choices. Ctrl/Cmd+S remains informational only. No validation/preview/Save/Create/curriculum-order operation.
- Quiz groups belong to subjects; no lesson Quiz field/picker. Subject group/registry record authoring stays deferred. Cross-reference/cycle/COMPLETE validation belongs to D; no writer/path/transaction/stale-revision guarantees before F/G.

COMPLETED:

- Verified repo/branch/history9633dda and unrelated next-env; read checkpoint00/01/03/06, AGENTS/TASKS/DECISIONS, actual schema/registries/components and local Next16 route-handler guidance. No audit restart.
- Server read-only projections/search/resolution, guarded typed GET adapter, transport validation/client adapter and compact reusable picker; actual manifest/block role integration, Reference category search context and existing Example selection.
- Proper combobox/listbox labels, ↑/↓/Enter/Escape, active-descendant, mouse selection, clear/loading/empty/error/retry, selected-ID metadata/remove/reorder, live announcements, bounded inline panels and EN/VI UI.
- Tests cover six registries/aliases/accent matching/bounds/projection exclusions, production/disabled route and direct loader guards, unknown/path-like IDs, typed transport, cancellation/races, ID-only selection/dedup, role preservation, dirty reversal/source isolation and Reset/Discard.
- Real inventory unchanged:13 subjects/58 sections/428 lessons;9 COMPLETE/419 SKELETON. No canonical content, frozen landing, learner route/provider, dependencies or generated Practice asset changes.

FILES CHANGED:

- New lib/studio/relationships.ts,relationships.server.ts,relationship-client.ts; app/api/studio/relationships/[kind]/route.ts; components/studio/relationship-picker.tsx,lesson-relationships-editor.tsx.
- Landing/learner code unchanged. Existing Studio block/editor/session/draft/styles/i18n integrate pickers and reset token only.
- New search/route/client/picker tests plus updated Studio editor/block/UI/read-only-boundary tests. scripts/audit-studio.mjs adds six resource and selected-ID GET smokes.
- Docs01/02/06/PROGRESS, learn-authoring/STATUS/atlas-v2 directory ownership and TASKS updates. Original next-env.d.ts must remain excluded.

VALIDATION PASSED:

- npm run typecheck; npm run lint (zero warnings); npm test:64 suites/470 tests.70 new C tests. Initial outdated B assertion, unscoped native option test query, test HeadersInit type and ref-render lint rule were corrected; final full suite green.
- npm run build:737 pages and one dynamic GET-only Studio resource route. npm run audit:build:101 chunks/931,635 total gzip bytes (+3,737/~0.40% vs B), largest148,115/largest route10,446 unchanged; budgets pass. No dependencies added.
- HTTP audits passed enabled dev (six resources200≤20 results, known/unknown lookup, rejected malformed request, selected editor and normal Learn), disabled dev flag=false and production flag=true (pages and resources hard404/no-store). Unsupported mutation methods405 in dev/production; no handler/I/O. Public-entry16-route/Guest/artwork audit passed; root entry5,149gzip unchanged, modern script census173,288 (+954/~0.55% vs B), not a hydration benchmark.
- Git whitespace/import review passed; no content/schema/learner/config/dependency/vendor changes. Exact original next-env blob a419cbe4e3a5e8d4b481b851dbf4ac767de069e6 preserved after Next build generation; excluded from staging.

OPEN RISKS: D runtime parsers/authoritative graph validation, E real no-evidence preview, F canonical JSON parity migration/path/symlink/lock/revisions/transaction recovery and later persistence gates remain required. Enabled dev remains loopback-only, not admin authentication. Module reads use current trusted registry snapshots, not revisioned filesystem reads.

KNOWN LIMITATIONS: transient drafts only; no Save/preview/create/curriculum management/validation scan/Save & Next. No full Quiz or registry authoring. Single-ID link removal uses whole-block removal. Native full-document selections reset filters; beforeunload is browser-controlled and may be suppressed. Browser inventory browsers:[] again: visual/console/real keyboard/assistive technology review remains manual, no browser QA claimed.

EXACT NEXT ACTION: D ONLY — authoritative canonical validation, still no filesystem writes/Save/preview/storage migration. First verify atlas-v2/status/log and the local semantic C commit titled feat(studio): add canonical relationship pickers; read this checkpoint and00/01/02/03/06. Reuse cloned draft and guarded server registry reads to implement shared runtime parsers and canonical/cross-reference/curriculum diagnostics plus validation panel, per03. Do not restart M0/A/B/C or expose F/G operations. Manual C browser matrix is recorded in06-QA, not claimed complete.

FINAL HANDOFF: one coherent local C commit; no push/merge/branch change. Owned local QA servers stopped before handoff. If interrupted just before the commit exists, implementation/checks are complete: inspect diff, stage only listed C files (never next-env), and create that semantic commit rather than repeating implementation.

PREVIOUS CHECKPOINTS: M0 168f760; A b3cb336; B 9633dda. B validated60 suites/400 tests,737 pages,100 chunks/927,898gzip; source audit/file contract00/03 and historical QA06 remain unchanged. Do not repeat or infer writer completion.

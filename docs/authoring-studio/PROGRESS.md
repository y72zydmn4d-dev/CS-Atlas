# Content Authoring Studio — resumable checkpoint

STATUS: MILESTONE 0 — COMPLETE. OVERALL STUDIO — NOT IMPLEMENTED.

CURRENT MILESTONE: 0 complete, documentation-only. Stopped at the explicitly requested boundary; next is A (read-only Studio). No production mutation implementation.

ARCHITECTURE DECISIONS:

- One canonical Learn/Concept model; transient authoring DTO only, no persisted CMS mirror.
- Development AND explicit server-only enablement required for future page/loaders/mutations; no generic file API, automatic Git operation or code execution.
- No rewrite of hand-maintained TypeScript. Serializer/storage strategy must follow the actual audit and parity/security tests before any mutation endpoint.
- Preserve all learner routes, canonical IDs, manual editing, local data and frozen landing.
- Choose direct canonical JSON: proposed `content/learn/subjects/<id>.json` and `content/learn/lessons/<subject>/<initial-slug>.json`, deterministic explicit generated indexes and current compatibility exports. Parity migration occurs at F, not automatically at launch; remove old literals as owners instead of layering overrides.
- Allowlist only canonical JSON patterns, two exact generated index files and technical transaction resources. Read-only linking for Concepts/Exercises/Problems/LearnReferences/examples/quizzes; no route rename/delete/new subject in v1.
- Writer plan: strict local development/origin guard, shared runtime parsers, deterministic serializer, revision hashes, server-derived paths, lock/journal/staged rename/re-read verification and fail-closed recovery. Multi-file rename is not globally atomic; no silent partial success.

COMPLETED:

- Verified repository `/Users/trinhgiahuy/Documents/CS-Atlas`, branch `atlas-v2`, baseline `80018c6`; worktree has only unrelated `next-env.d.ts` modification. Do not stage or normalize it.
- Read AGENTS/TASKS/DECISIONS/README/learn-authoring, relevant domain/ownership/security/Search/progress/Learn migration docs and UI principles/frozen-landing checkpoint. Inspected actual schemas/registries, all v2 body data, route/renderer/sidebar/order, canonical links, i18n, storage/evidence, AI and request guards. Read local Next16 server-client and static-param guidance for future boundary decisions.
- Actual Learn v2 schema lives in `lib/domain/learn-platform.ts`; manifests are synthesized by `content/learn/registry.ts` from TypeScript seeds and nine hard-coded authored IDs. Bodies/examples/references/quizzes share `content/learn/lesson-content.ts`. Neither file is currently Studio-safe.
- Separate legacy `lesson:*` projections in `content/lessons.ts` derive from Topics; v2 uses `learn:<subject>:<slug>`. Preserve both existing contracts, do not synchronize or rewrite legacy Topics.
- Previous/Next and sidebar flatten array order, not numeric sort. Save/reorder must keep array positions AND one-based `order` consistent; prerequisites must not silently change during reorder.
- Real preview must reuse `LessonWorkspace`/`LessonBlockRenderer`, but `LessonWorkspace` currently emits learning events on mount. Preview needs an explicit no-evidence/no-bookmark-action mode before it is safe.
- Existing `validateLearnPlatform` accepts already-typed records, not hostile JSON; it does not establish block shape, status substance, reserved slug, path or transaction safety. Shared runtime parsers and stronger graph checks are prerequisite work.
- Existing request-origin helper accepts missing Origin. Future local writer must fail closed with stricter loopback/same-origin checks, not reuse that permissiveness blindly.
- Verified source inventory:13 subjects,58 sections,428 lessons;9 COMPLETE bodies and419 SKELETON lessons. Java Interfaces already exists (`learn:java:interfaces`), so creation tests must use a distinct isolated fixture.
- Persisted source-backed current architecture in00 and exact file/migration/write/test contract in03. Reviewed both against actual code and marked every future capability/test as not implemented.

FILES CHANGED: Only `docs/authoring-studio/00-current-content-architecture.md`, `03-content-file-contract.md`, `PROGRESS.md`. No production/content/schema/route/dependency changes. Unrelated next-env.d.ts preserved/excluded, original blob `a419cbe4e3a5e8d4b481b851dbf4ac767de069e6`.

VALIDATION PASSED: `npm run typecheck`; `npm run lint`; `npm test -- tests/learn-platform.test.tsx tests/learn-navigation.test.tsx tests/content.test.ts tests/concept-migration-parity.test.ts tests/search-documents.test.ts tests/progress-migration.test.ts tests/request-security.test.ts` —7 suites/30 tests pass. Read-only TypeScript AST seed inventory confirms58/428; focused tests confirm expanded manifests/body counts, current canonical validation and consumer invariants. Git whitespace check passes. Full suite/build/build audit/HTTP/browser/security-writer checks intentionally not run for this explicitly docs-only milestone; no implemented Studio behavior to certify. Future F/K gates remain mandatory.

OPEN RISKS: Planned migration requires record/route/Search/locale parity tests; JSON→Next HMR/new-route refresh proof; latest read-only registry snapshot verification; unknown-input parsing; default preview evidence/nav writes; path/symlink/hardlink/TOCTOU defense; crash recovery; production page+endpoint hard-disable. Decisions are documented, protections not yet implemented. Complete pre-mutation fixture gates before G.

KNOWN LIMITATIONS: Nothing at `/studio` exists from this task yet. No filesystem write workflow or production security guarantee is implemented/tested. Historical Learn architecture completion is not content completion.

LOCAL COMMIT: Milestone0 identifiable by `docs(studio): define authoring architecture and write boundary` in local history. No push/merge/branch operation.

EXACT NEXT ACTION: Resume with Git branch/status/log and read this checkpoint +00/03. Implement A only: read local Next16 route-handler/environment/not-found guidance; add server-only development AND AUTHORING_STUDIO_ENABLED guard, guarded `/studio` and narrow typed read loaders/overview/subject/curriculum/selected read-only inspector using current canonical modules. Add01-workflow/02-security documentation and tests for disabled development/production flag=true with zero I/O. Do not migrate content or add a writer during A. Continue B–K from03 only in subsequent implementation milestones; retain next-env/user data and frozen landing.

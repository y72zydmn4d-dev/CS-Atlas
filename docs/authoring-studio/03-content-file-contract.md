# 03 — Content file ownership and safe-write contract

Milestone 0 contract, baseline `80018c6`, activated by G. The13 manifests and9 authored bodies now use the exact canonical JSON layout below; old seed/body literals are retired, adapters/aliases retained. No empty skeleton bodies or parallel override store. F transaction guarantees are in08; G migration/parity/Save evidence and seal regeneration are in09/06. The historical sequence below records how this cutover was performed.

## Ownership categories

| Category | Exact source / proposed target | Studio permissions |
|---|---|---|
| A — STUDIO-SAFE, live | `content/learn/subjects/<subject-id>.json`: canonical SubjectManifest including nested Sections/LessonManifests | G updates only existing lesson editable metadata. Subject/group/identity/order fields preserved. Create/reorder remain future operations. |
| A — STUDIO-SAFE, live | `content/learn/lessons/<subject-id>/<initial-lesson-slug>.json`: canonical LearnLessonContent | Update or first body of existing lesson only. Stable ID determines file identity; no rename/delete. |
| B — GENERATED, live | `content/learn/generated/subject-index.ts`, `content/learn/generated/lesson-content-index.ts` | Fixed deterministic literal imports from canonical inventory. G may update only body index for an existing lesson's first body; subject index is read-only. |
| B — GENERATED, verification only | `content/learn/generated/authoring-dependency-seal.json` | Developer-generated read-only source/semantic hashes; never content authority or browser write target. |
| C — HAND-MAINTAINED, adapters | `content/learn/registry.ts`, `content/learn/lesson-content.ts` | Never rewritten by Studio. JSON parsing/export/lookup and legacy alias compatibility only; no legacy body fallback. |
| C — HAND-MAINTAINED, existing | `lib/domain/learn-platform.ts`, all schema/validator/serializer/service/renderer/route source, `content/index.ts`, i18n, docs, configs | Engineering changes only, never write-plan targets. |
| D — READ-ONLY REGISTRY | `content/concepts/*`, Topics/Algorithms/Techniques/Domains, `content/lessons.ts`, `content/exercises.ts`, `content/problems.ts`, `content/practice/*`, `content/sources.ts`, Resources/translation registries | Link/search IDs only. No new Concepts, Exercises, Problems, legacy Lessons, sources or relations through v1. Never return server-only solutions/credentials. |
| D — READ-ONLY REGISTRY | LearnExample, LearnReference, LearnQuizQuestion arrays in `content/learn/examples.ts`, `references.ts`, `quizzes.ts`, extracted without data changes in G | Pick/inspect existing records only. Hand-maintained records; no authoring endpoint owns these paths. |
| Operational, transient | `content/learn/.authoring-transactions/` (proposed) | Server-owned lock/journal/recovery staging only. Not canonical content, draft autosave or browser API. Not imported/bundled; exclude from Git with an explicit narrow rule at F. |

Allowed writes are **not** all of `content/learn/`. Only A JSON patterns, the two exact B filenames, and server-created transaction resources. `content/exercises/`/`content/references/` are not authorized roots merely because the product vision mentions them.

Original `next-env.d.ts` user blob: `a419cbe4e3a5e8d4b481b851dbf4ac767de069e6`. Studio/migration/commits must never target it, `.env*`, package/config/source files, public assets, browser data or `.git`.

## Canonical bytes, not a second persistence model

- Subject JSON is the actual `SubjectManifest`; body JSON is the actual `LearnLessonContent`. No StudioLesson/CmsSubject, override layer, database, duplicated persisted DTO or synchronization task.
- Transient draft DTO may compose canonical field types plus revision token/editor selection; persist only normalized canonical payloads. UI collapse/dirty/selection is not authored content.
- JSON strings remain strings; no `eval`, imports from author content, TS string interpolation, shell, generated function or arbitrary HTML. Manual edits remain ordinary UTF-8 Git-friendly files and pass the same runtime validators.
- Serializer: explicit key order by owning canonical record/block type; two-space indent, LF, one trailing newline. Preserve code/prose bytes within strings (no global trim/reformat); omit absent optional keys, reject unsupported values/unknown keys. Arrays retain semantic order; no alphabetizing curriculum/objectives/blocks. Test same normalized input→same bytes and parse→validate→serialize round-trip.
- Authored body `version`: server increments on semantic save; no-op does not bump. Do not let an old draft lower/reset it. `reviewedAt` is author-supplied review metadata, not fabricated proof of review.
- JSON has no extra persisted CMS/schema envelope. Parser contract version is owned in domain code; future schema changes require an explicit migration and tests, not silent coercion of bad records.

## Smallest migration / parity gate

Perform this as an engineering-owned, reviewable substep before filesystem mutations, not automatically on first Studio launch.

1. Snapshot current **expanded** records from the canonical modules:13 subjects,58 sections,428 lessons,9 bodies, all values/order/IDs/slugs/links/statuses. Use trusted current module loading in a test/migration script; never execute uploaded author code. No regex/string slicing of TypeScript.
2. Materialize those canonical JSON files deterministically. Preserve copied VI values, existing declared status, prerequisite edges and body versions; do not use migration to translate/promote/renumber educational identities.
3. Replace `registry.ts` seeds/helper/authored-ID Set with the canonical JSON-backed adapter. Preserve exported Map/array names, navigation ordering and legacy alias table; do not retain old seeds as a second editable fallback.
4. Move unchanged examples/references/questions into hand-maintained leaf modules. `lesson-content.ts` becomes a compatibility facade over them and the generated JSON body index. Client renderer uses narrow example/reference leaves, not all body payloads. Studio client imports only DTO/UI contracts, not aggregate registries.
5. Generated indexes contain a generated marker and deterministic explicit static JSON imports. Input inventory supplies paths only after strict ID→filename mapping. All code structure is fixed; author prose stays in JSON. A hand-edited/mismatching generated artifact is a conflict, not permission to overwrite arbitrary source.
6. Compare old/new normalized records and consumer outputs before deleting old literals: routes/static params/aliases, Search metadata, Previous/Next, concepts/exercises/problems/examples/references/quizzes, statuses/body summaries/blocks/versions, EN/VI. Verify malformed JSON blocks startup/validation instead of falling back silently.
7. Existing synchronous compatibility exports may continue for existing consumers. Studio loaders must not use `content/index.ts`/aggregate body imports; overview reads manifests/catalog metadata, selected lesson reads only its body. Measure client imports/bundle and prevent Studio from loading all bodies/examples/problems at startup. Broad legacy Search barrel coupling is existing debt, not a reason to build a duplicate index.
8. Verify manual edit→Studio reload; Save→normal Learn route and Search refresh in one running `next dev` process, including a newly indexed body/route. Static explicit JSON imports are intended to trigger HMR; do not claim this until smoke-tested. Revalidation alone cannot refresh stale module-level Maps.

Rollback is a reviewed code/content migration rollback using retained Git history/parity evidence, performed outside Studio. The Studio never invokes Git. Removing Studio leaves JSON + adapters/generation/learner usable independently.

## Domain-specific operations

Every operation uses canonical IDs; server derives paths. Page/loader/API guard and shared service guard all enforce enablement. No `write-file(path,contents)` endpoint.

| Operation | Canonical effect / write plan |
|---|---|
| load overview/subjects/curriculum/lesson, search relationships | Read-only, narrow DTOs; no body on overview and no private/solution payloads. |
| validate / unsaved preview | Parse/normalize proposed canonical values, substitute into in-memory graph, return issues/canonical preview. **Zero disk writes.** |
| save lesson | Selected manifest fields in one subject JSON + selected body JSON if changed; generated body index only if creating first body. Report relative changed files, refreshed revision, validation counts and canonical route. |
| create lesson | Validate existing subject/section, new slug, canonical ID and target absence; append exactly once, normalize order. Default SKELETON, explicit prerequisites (empty by default), existing Concept selection required. Body optional until edited; no fake authored content. |
| create section | Stable `learn-section:<subject>:<initial-section-slug>` from title/manual adjustment before create; reject collision, empty lessons allowed, append/normalize section order. Only subject JSON changes. |
| move lesson / section | Up/down, same parent; update canonical arrays and contiguous order only. Different-section move is a separate explicit ownership operation with graph validation. Never regenerate prerequisites, IDs, slugs or body filenames. |
| Save & Next | Await normal safe save, then load next item from refreshed canonical array. Conflict/error keeps current dirty draft; no hidden autosave. |

Existing IDs/slugs and body paths are immutable in v1. Show route identity/warning and explain that rename needs a later dependency/migration workflow. Subject creation, permanent removal/archive (no current archive field), duplicate lesson, bulk import, quiz/example/reference authoring and AI are deferred; do not add pretend controls/statuses.

Subject status remains the canonical declared value in v1; do not automatically promote the whole subject. COMPLETE subject validation must reject incompletely authored promised lessons. Existing subject metadata/group arrays preserved by lesson saves. Learning objectives editor edits an objectives block, never a duplicated metadata field.

## Guard and request boundary (implemented for G existing-lesson Save)

- Availability: `NODE_ENV === "development"` **AND** `AUTHORING_STUDIO_ENABLED === "true"`; server-only flag, no NEXT_PUBLIC, default off. Test production even when flag=true. When unavailable, `/studio` returns notFound and every read/validate/preview/mutation endpoint returns404 before reading/parsing/planning any filesystem action. No learner nav entry.
- Node runtime, `server-only` I/O module. Domain parsers are pure and reusable by tests/build/Studio; services own I/O. Do not ship fs/path/repository absolute paths to client modules/results.
- Local-development tool, not admin auth: run on loopback, not a shared development/LAN deployment. Writer requires loopback request host/origin (`localhost`, `127.0.0.1`, `[::1]`) with exact scheme/host/port match, explicit non-null Origin, JSON content type, bounded body and same-origin fetch posture. Do not trust forwarded host headers. Reject missing/null/foreign Origin before touching disk; GET page navigation is handled separately from mutation requirements.
- Add stricter Studio request helper; existing permissive `isSameOriginRequest` stays unchanged for unrelated APIs. Test DNS-rebinding-shaped Host/origin and unsupported methods/operations.
- Initial request aggregate≤1MiB, code≤20,000 chars, max200 blocks, bounded strings/collections/JSON depth. Return413 before excessive allocation; exact field bounds shared in parser, not only HTML attributes. Do not log full content or absolute target paths. Use stable validation/conflict/security/write/recovery/internal error codes; no raw fs errors in responses.

## ID / path resolution

1. Canonical subject must exist in current allowlisted catalog. Validate subject/slug ASCII kebab-case (max80 chars); parse `learn:<subject>:<slug>` and `learn-section:<subject>:<slug>` with exact grammar/ownership. Lookup existing ID, do not treat all colon-qualified strings as filesystem segments.
2. New title may suggest normalized slug; author can adjust before create. Reject empty/reserved surface slugs/duplicate route/duplicate ID. Refuse percent-encoded, dot, slash, backslash, absolute, tilde, URL, control character or nested traversal strings rather than decoding into a path. Canonical picker IDs are resolved in the owning registry, not slugified as filenames.
3. Resolve fixed repository/content roots on server; derive A/B paths from validated known identity only. `path.relative` containment check must reject `..` and absolute results with separator-aware logic, not prefix comparison.
4. `lstat` every relevant root/ancestor/target; reject symlink roots/parents/files, non-regular existing targets and multiply-linked files. `realpath` nearest existing parent and verify containment. For create, check the immutable parent under the allowlist and use exclusive staging; no recursive mkdir based on browser strings.
5. Recheck path/target identity and revision under the writer lock just before replacement. Never follow a target symlink or rollback into an externally replaced symlink. Only output relative changed-file names; browser never submits/receives absolute file targets.

Threat scope: Node cannot fully defeat a malicious same-OS-user process continuously swapping directory entries; that principal already controls repository files. Document residual TOCTOU and fail closed on detected swaps. Do not present lexical checking alone as symlink protection.

## Revision and WritePlan

- Load returns opaque SHA-256 revision of selected subject bytes + body bytes/absence. This intentionally conflicts on concurrent curriculum/manual edits; not just mtime. Creation also fingerprints catalog/target absence; generated artifacts are read and fingerprinted server-side. Picker registries are revalidated from latest canonical sources before writing.
- Read-only TypeScript registries remain trusted code modules, not text parsed/executed from HTTP payloads. Their dev-HMR snapshot must agree with its source revision; if a manual registry edit has not refreshed the loader snapshot, reject with reload-required rather than saving against old membership. Include registry-edit→reload→validation in dev smoke coverage.
- Client sends IDs/draft/baseRevision, not target paths or a trusted WritePlan. Existing lesson ID/slug/ownership/contentSource/order are derived from latest record, editable field allowlist only. Draft cannot overwrite hidden subject/group/legacy metadata.
- Server plan has operation, validated entity IDs, creates/updates with expected prior byte hash and normalized canonical after-values, dependent generated artifacts, validation results. No deletes in v1. Path/bytes are internal; public result is relative changed-file list, not an executable plan.
- Whole resulting canonical graph validated before first write. Error→zero mutation; warnings generally non-blocking. Canonical serializer output reparsed/validated before staging. A body/contentSource association is computed, never a path supplied by author.

## Transaction-like write semantics

Multi-file rename is **not** filesystem-wide atomic. Promise: no success on partial save, recoverable failure, no silently half-committed canonical state—not instantaneous multi-file snapshots across HMR readers.

1. Acquire exclusive repository-local writer lock shared by in-process/cross-worker executions. F explicitly chooses fail-fast instead of a queue/automatic retries of potentially stale plans. Existing lock or unrecoverable journal blocks writes; never auto-steal by elapsed time.
2. Re-read revisions, verify all target/parent paths, validate merged graph, prepare every canonical/generated output. Stage same-filesystem temp files exclusively; flush output and durable recovery journal containing validated relative targets, before-bytes/hashes and intended after-hashes. No file rewrite while typing or previewing.
3. Recheck expected targets; atomically rename each staged file, create bodies before publishing generated imports, generated index last. Never overwrite an unexpected new target/manual change; track each completed replacement.
4. Re-read/parse/validate persisted bytes and affected graph; confirm hashes. Only now return Saved + relative file report + fresh revision; client refreshes canonical loaders. Next module/HMR propagation is separately verified by integration tests.
5. Ordinary injected failure→restore prior bytes atomically/remove only own newly-created targets while checking current after-hashes; verify rollback. Do not overwrite intervening manual edits during recovery. If rollback cannot complete, retain journal, surface `recovery-required`, stop all new writes; never report success.
6. Crash/restart→detect unfinished journal before reads used for mutation/preview and before any new write; recovery must be explicit, hash/path checked, and tested. Normal learner readers can briefly observe successive replacements; journal/recovery protects durable integrity. If reader-consistent snapshots become required, stop and design that separately, not a hidden CMS generation store.

Transaction folder contains temporary technical recovery data only and is never a persisted editor model. Cleanup affects exclusively validated, operation-owned journal/temp targets, not broad directories; authority starts after exclusive creation succeeds. Implemented guarantees/platform limits are in [08-save-pipeline](08-save-pipeline.md) and06-QA.

## Preview boundary

- Authoritative validate/preview returns canonical normalized lesson/content + current subject; render existing `LessonWorkspace` and `LessonBlockRenderer`, not a new renderer. No save before preview.
- Introduce explicit preview/no-evidence mode in shared workspace: suppress start/completion, bookmarks and personal navigation persistence; no automatic provider/upload. Preserve presentation/locale/theme and safe existing example renderer. Test storage unchanged before/after preview.
- ID-backed links use read-only registries; no raw HTML or arbitrary URL rendering. Draft content/version never becomes official Concept metadata/Atlas AI context. Switching preview→edit keeps transient draft and dirty state.

## Pre-mutation test gates

| Gate | Required evidence before exposing G/H/I |
|---|---|
| Canonical cutover | Baseline record/route/Search/order/body/locale parity, no old/new precedence store; manual JSON edits reload. |
| Parsers / serializer | Every16 block variants round-trip; malformed/unknown/oversized values reject; COMPLETE substantive checks, valid cross-links, deterministic bytes. |
| Dev / production guard | Disabled dev and production flag=true page/API denied; spies prove zero I/O; HTTP production smoke verifies direct mutation denial. |
| Paths | `../../etc/passwd`, `../package.json`, absolute/tilde/file URLs, `%2e%2e/`, backslash/nested traversal, forged ID ownership/unknown entities, out-of-allowlist plan, symlink parent/file and hard-link targets reject. |
| Conflicts / failure | Stale revision, manual edit, concurrent saves, generated-artifact change, target collision, failure at each rename and rollback, crash journal recovery; unrelated fixture files unchanged. |
| Curriculum / safety | Duplicate slug/ID, reserved surface slug, missing section/Concept/Exercise/Problem/reference/example, invalid quiz/reference ownership, prerequisite cycles, reorder/pager parity; `<script>`/unsafe strings escaped or rejected as appropriate. |
| End-to-end | Temporary repository fixture: create missing Java lesson (not existing Interfaces), objectives+paragraph+Java code+existing Concept, validate, actual renderer preview, safe save/reload, normal Learn resolver/static params resolves. Real dev route refresh requires an isolated controlled fixture workflow, not persistent sample content in production. |

Use isolated temporary fixtures matching canonical folder layout; inject repository root only into test-owned adapter construction, never request parameters. No create/delete test against real curriculum. Test spies ensure Studio never invokes Git/child_process/eval or browser storage writes.

## Exact milestone sequence

| Milestone | Deliverable / prerequisite |
|---|---|
| 0 (this turn) | Source audit, this contract, continuous PROGRESS; docs-only commit. No claimed implemented writer/security. |
| A | Guarded `/studio`, typed server summaries/curriculum/selected inspector, real health counts; no writes. Add01-workflow/02-security drafts. |
| B | Transient canonical-field editor,16 block controls/objectives, dirty Save/Discard/Cancel flow; no filesystem autosave. |
| C | Bounded canonical Concept/Exercise/Problem/LearnReference and existing-example pickers; no registry mutations. |
| D | Shared pure unknown-input parsers + authoritative validation panel, COMPLETE/curriculum checks;04-validation-model. |
| E | Unsaved real-renderer preview, explicit no-learning-side-effects tests; no persistence. |
| F | Deterministic canonical JSON/indexes + locked/path-safe/revisioned plans/transaction/recovery tests in isolated fixtures;08-save-pipeline. Real content unchanged; no live Save. |
| G | Expose manual safe save/shortcut, changed-file/conflict UI; dev learner/Search HMR proof. |
| H / I | Create lessons; create/reorder sections/lessons, preserve IDs/dependencies; isolated creation workflow. |
| J | Status/section filters, ordered Needs Authoring queue, Save & Next; no gamified score. |
| K | Full tests/typecheck/lint/build/build budget, production direct-page/mutation guard and route smokes;06-QA,07-future-roadmap; manual+Studio authoring guide. |

No dependencies required by the contract. Read repository-local Next16 route/guard/server-client guidance before each framework implementation milestone. Full Studio completion is contingent on these gates, not on Milestone0 documentation.

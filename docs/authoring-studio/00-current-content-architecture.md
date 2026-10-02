# 00 — Current content architecture / Studio v1 audit

Historical audit preserved. G has now cut over live manifests/bodies to canonical JSON; see03 for current ownership and09 for parity/Save/fresh-reader evidence. Do not treat the baseline TS locations below as current authoring targets.

Audit baseline: `80018c6`, `atlas-v2`, 2026-10-01. **Milestone 0 only: no Studio route, migration or writer implemented.** Decisions below govern subsequent milestones; proposed paths are not present yet.

## Canonical ownership today

| Concern | Actual source / behavior |
|---|---|
| Learn v2 contracts | `lib/domain/learn-platform.ts`: `SubjectManifest`, nested `CurriculumSection`/`LessonManifest`, `LearnLessonContent`, 16 block variants, examples, references, quizzes and aliases. |
| Subjects / sections / lesson metadata | `content/learn/registry.ts`: hand-maintained executable TypeScript. `subject()`/`buildSections()` expand string/tuple seeds into records. Sections and lessons are nested; no standalone persisted manifest files. |
| Authored lesson bodies | `content/learn/lesson-content.ts`: nine `LearnLessonContent` records with version, review date, localized summary and ordered blocks. Also owns seven examples, eight Learn references and five quiz questions. |
| Derived lookups | Module-load arrays/Maps (`learnSubjectsForNavigation`, `learnLessons`, subject/lesson/content/example/reference/quiz lookups). Generated **in memory**, not by a file-generation pipeline. |
| Older topic-backed Learn | `content/topics.ts`, `content/translations/vi.ts`; `content/lessons.ts` derives `lesson:*`, Courses, block/provenance/reference/example/playground projections. `lib/domain/learn.ts` owns these compatibility types. Not the v2 manifest/body model; do not rewrite or merge identities. |
| Knowledge | `content/concepts/registry.ts` derives canonical `topic:*`, `algorithm:*`, `technique:*` Concepts and relations from Topics/Algorithms/Techniques. `ConceptId` is currently a string alias; registry membership, not TypeScript, establishes validity. |
| Exercises | `content/exercises.ts`: adapted topic exercises plus native records. IDs can have multiple colon segments. Some `lessonId` values are legacy `lesson:*`; linking from v2 does not change the Exercise's owner. |
| Problems | `content/problems.ts` projects public `content/practice/problems.ts`; references stay in `content/practice/references.server.ts`. Current Problems are Python/JavaScript, public-test-only; Studio must not import reference solutions. |
| References / citations | `LearnReference` is structured internal lookup data, not `Source` or `LessonReference`. `content/sources.ts` owns four external citation sources for the legacy block model. V2 references block stores Learn reference IDs; it has no citation-source field. |
| Quizzes | Questions in `lesson-content.ts`, groups in SubjectManifest; `SubjectSurface` records existing local `quiz-completed` evidence. V1 Studio may inspect links, not author a second question model. |

## Verified inventory

Source AST inventory counts seed sections/lessons without executing authored source; existing canonical tests verify the expanded lesson totals/statuses.

| Subject | Sections | Lessons | COMPLETE / bodies | Subject status |
|---|---:|---:|---:|---|
| Python | 15 | 152 | 5 | PARTIAL |
| DSA | 17 | 110 | 4 | PARTIAL |
| C | 2 | 14 | 0 | SKELETON |
| C++ | 2 | 12 | 0 | SKELETON |
| Java | 2 | 12 | 0 | SKELETON |
| JavaScript | 3 | 20 | 0 | SKELETON |
| HTML | 2 | 16 | 0 | SKELETON |
| CSS | 3 | 18 | 0 | SKELETON |
| SQL | 2 | 13 | 0 | SKELETON |
| NumPy | 2 | 11 | 0 | SKELETON |
| Pandas | 2 | 13 | 0 | SKELETON |
| Machine Learning | 4 | 28 | 0 | SKELETON |
| PyTorch | 2 | 9 | 0 | SKELETON |
| **Total** | **58** | **428** | **9** | **2 PARTIAL / 11 SKELETON** |

Lesson statuses: 419 SKELETON, 9 COMPLETE, zero PARTIAL/PLANNED. Java **Interfaces already exists** as `learn:java:interfaces`, in `learn-section:java:object-model`; no new production duplicate or invented OOP section for the demonstration. TypeScript is not a subject manifest today.

## Current learner pipeline

```text
TypeScript seeds → SubjectManifest / nested LessonManifest → registry Maps
typed authored bodies → learnContentByLessonId
                         ↓
app/learn/[subject]/[page]/page.tsx
                         ↓
LessonWorkspace(subject, lesson, content)
  ├─ LearnSubjectWorkspace / SubjectCurriculumSidebar
  ├─ metadata, pager, local evidence, bookmarks, Concept/AI rail
  └─ LessonBlockRenderer → existing CopyCodeBlock / ExampleRunner
```

- `app/learn/[subject]/page.tsx`: known subject wins, otherwise deterministic legacy alias redirect, otherwise legacy Topic renderer. `/learn/python`, `/learn/numpy`, `/learn/pandas` are subject homes, not old topic bodies.
- `[subject]/[page]`: `tutorial` → SubjectHome; `exercises`, `examples`, `quiz`, `reference` → SubjectSurface; other segments resolve a lesson. These five slugs are reserved even though current validation does not reject lesson collisions with them.
- `[subject]/reference/[reference]`: internal reference detail from registry, not an editable lesson body.
- `generateStaticParams()` enumerates metadata-derived routes. Server route passes one selected body to the client learner workspace. The client block renderer currently imports the monolithic content module for examples/references; avoid pulling every future body into Studio startup through that barrel.
- Subject home, catalog and subject bar consume the same manifests; the shared `/learn` layout derives navigation order from `navigationOrder`, not a UI list.

### IDs, slugs, order and aliases

- Current builders assign subject `id === slug`; lesson IDs `learn:<subject>:<initial-slug>`; section IDs `learn-section:<subject>:<initial-section-slug>`.
- Seed slugifier lowercases, maps C++/C#, replaces non-ASCII-alphanumeric runs with `-`, trims ends. Python `__init__` resolves to `init`, `*args` to `args`; do not recompute IDs from mutable titles.
- `validateLearnPlatform` enforces slug pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$` and unique subject slugs/lesson routes. It does **not** validate ID grammar, section-ID uniqueness, reserved surface slugs or a complete unknown-input schema.
- `flattenSubjectLessons()` concatenates section and lesson **array order**. It does not sort by numeric `order`; sidebar/pager use the arrays too. `order` is one-based authored metadata. Reorder must update both consistently.
- Seed builder currently infers prerequisites from the preceding seed in each section. After migration these become explicit persisted links: reordering must **not** regenerate dependencies or change identities.
- Aliases derive from a hand-maintained destination table and legacy Lessons. Keep them and `content/concepts/legacy-map.ts` untouched; freeze existing lesson/subject slugs in v1. A future rename requires inbound dependency/redirect/evidence analysis, not a text edit.

## Status, localization and metadata

- Status vocabulary is PLANNED/SKELETON/PARTIAL/COMPLETE, separate from learner completion and legacy editorial maturity (Foundation/Developing/Detailed/Reference-quality).
- Nine hard-coded `authoredLessonIds` in `registry.ts` determine current COMPLETE status, minutes and `contentSource`. Subject status is manually selected. Body presence itself does not compute either status. Learner authored counts currently count COMPLETE manifests, not body validation results.
- Studio health must show declared statuses plus actual body presence/validation separately. Save must validate COMPLETE claims; never infer editorial review from choosing a radio button, block count or learner progress.
- Overview starts with manifest-derived counts/ordered Needs Authoring queue; validation totals are "not scanned" until a bounded server validation scan finishes, never a fabricated zero. Bodies are loaded on lesson selection or explicit scan, not sent wholesale on startup. Filter by subject/section/status without storing a second curriculum order.
- Lesson metadata fields: title, description, slug, section/subject ownership, order, Concept IDs, prerequisite Lesson IDs, minutes, `Difficulty` (Foundational/Intermediate/Advanced), status, translation status, contentSource, Exercise IDs, Problem IDs. Summary/version/review date belong to the **body**. Objectives are an **objectives block**, not a second top-level metadata array. Reference/related links are blocks, not imaginary manifest fields.
- V2 localized prose already uses `{en,vi}`. Helpers currently copy English into `vi`; all manifests declare `english-only`. UI locale infrastructure is `i18n/config.ts`, LocaleProvider and paired message maps. Legacy topic translations use a different overlay and must remain unchanged.
- V1 editor may expose EN/VI independently. No auto-translation or copy-as-translation. Empty VI needs a shared renderer fallback with an honest translation-status notice; existing copied values must be preserved during parity migration. Language-neutral code/table cells/definition term are not separate localized fields.

## Real supported block contract

| Type | Editable canonical payload / reuse |
|---|---|
| paragraph | localized body, optional localized title; plain text, no Markdown parser |
| objectives / list | ordered localized items; list has optional `ordered` |
| heading | level2/3 and localized text; no H1 |
| definition | plain term + localized body |
| syntax / code | string syntax language + code; code optionally localized caption |
| example | existing LearnExample ID; do not clone source into a new block model |
| output | literal output string; no execution implied |
| callout | note/tip/important/warning/common-mistake + localized body |
| table | localized columns + string rows; consistent cell counts |
| comparison | localized columns + localized row labels/values; counts must match |
| complexity | time/space strings + localized explanation |
| exercise | canonical Exercise ID |
| references | existing LearnReference IDs |
| related | v2 Lesson IDs + public Problem IDs |

Every block has a stable local ID and optional localized title. No quote, raw HTML, inline arbitrary URL, Concept-link block or standalone runnable-code block exists. Concept selection belongs to lesson metadata. V1 edits these 16 variants, not the legacy `ContentBlock` union.

- Syntax languages in Learn are currently unrestricted strings; only Practice has a typed runtime language registry (Python/JavaScript). A code-language input may suggest known display languages but must never imply execution from its label.
- ExampleRunner permits Run only for `browser-quickjs` AND `javascript`, via existing browser Worker. Python/Java/static code remain display/edit/copy. No server execution, new runtime, remote Judge or arbitrary dynamic import.
- Renderer uses React-escaped text and ID-derived links; no raw HTML injection. Unknown block shapes must be rejected **before** rendering, not cast to the union. Malicious `<script>` remains visible text; invalid IDs must not become paths/URLs.

## Consumers and preservation requirements

| Consumer | Current mechanism / Studio consequence |
|---|---|
| Search | `content/index.ts` projects Subject/Section/Lesson/Reference metadata; v2 body text is **not** indexed. `lib/search/documents.ts` wraps visibility/schema versions; static sourceVersion remains `content-registry:v1`. No search file to write. Rebuild/HMR must refresh projections after save; do not invent body search or a persistent Studio index. |
| Progress | `LessonWorkspace` emits lesson-started on mount and completion on explicit click via AtlasProvider/storage, using stable lesson ID and body version. Preview must disable these writes, not render a normal workspace and pollute evidence. |
| Bookmarks / curriculum preferences | Existing browser adapters store IDs/hrefs, section collapse and scroll. Do not reset/migrate them for Studio. Preview disables bookmark mutations; stable IDs/slug freeze preserve real bookmarks. |
| Atlas AI | Lesson rail links the first Concept to bounded public assistant context. `lib/domain/ai.ts` marks lesson context unavailable; `lib/ai/context.ts` retrieves Concepts/legacy public content, not current draft bodies. No draft upload/provider generation. |
| Roadmaps / Problems / Exercises | Many inbound lesson references are legacy `lesson:*` or Topic IDs. Preserve namespace distinctions. Studio may link existing canonical records, not alter their owning metadata or infer a reverse relationship. |
| Shell | RouteShell treats every non-root URL as workspace. `/studio` can initially reuse existing theme/locale/workspace providers without learner-nav entry; dense Studio workspace belongs inside its own feature boundary. No landing/routing rebuild. |

## Validation strengths and gaps

Current `validateLearnPlatform` is an already-typed graph validator called by `validateContent()` and tests. It checks duplicate lessons/routes/body IDs, Concept membership, ownership, existing prerequisites/Exercise/Problem/example/reference/group/alias links, unique order values, COMPLETE contentSource presence and QuickJS language compatibility.

Before JSON/network authoring, shared pure domain validation must additionally cover:

- Runtime parse of unknown input, allowed keys/enums, lengths/depth, finite positive numbers, localized text, all 16 discriminants/required fields, block IDs and valid dates/version; no unchecked casts.
- Raw duplicate example/reference/quiz IDs **before** Set deduplication (current checks accidentally deduplicate first); unique section/group IDs and reference routes; reference category/subject ownership; quiz options/correct answer/Concept validity.
- Contiguous positive ordering and array/order agreement, reserved slugs, stable ID grammar, self/cyclic prerequisites, alias destination identity, exact body/contentSource matching.
- COMPLETE requires real body, nonempty objectives and substantive prose/definition/code/example, valid links/version/review date; warnings for missing examples/exercises/references. No arbitrary educational score or forced automatic status promotion.
- Writer-specific allowlist, realpath/symlink checks, stale revision and failure recovery. Existing same-origin helper in `lib/http/request-security.ts` accepts missing Origin; a writer must use stricter checks.

## Smallest safe storage decision

**Choose direct canonical JSON, not regex/AST editing, overrides or a parallel CMS.** See [03](03-content-file-contract.md) for the exact proposed paths and gates.

1. A–E remain read-only/transient; no storage change required to inspect/edit/validate/preview existing records.
2. Before F/G, one parity-tested migration materializes the 13 expanded SubjectManifest records and nine body records into machine-owned JSON. Replace seed/body literals as the source of those records; do not keep precedence-based copies.
3. Preserve current export/lookup contracts through hand-maintained adapters. Isolate examples/references/quizzes in their read-only leaves; deterministic generated explicit body imports make new JSON discoverable by Next without directory-based browser imports.
4. Studio server loaders read current canonical JSON by validated ID, not cached imported snapshots. UI starts with summary/curriculum metadata, one body on selection. Draft DTO composes existing types and is never persisted separately.
5. A successful save must pass a live `next dev` normal-route/Search refresh test before claiming immediacy. Production remains static/read-only and requires a normal rebuild/deploy; Studio never edits production artifacts or Git.

## Milestone 0 exit / later gates

- Audit/file contract persisted; existing content/schema/navigation/migration/Search/evidence tests must pass before the documentation commit.
- **No new security or writer tests implemented at M0.** Parser/serializer/path/transaction fixture tests must pass before exposing mutations in F/G.
- Implementation acceptance includes real learner preview without evidence, disabled production page AND endpoints even with enablement=true, deterministic serializer, crash/failure recovery, stale-edit rejection and create→normal-route fixture flow.
- Future docs01/02/04/05/06/07 are authored alongside their relevant milestones; they are not evidence of implemented capabilities yet.

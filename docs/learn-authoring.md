# Learn authoring guide

CS-Atlas Learn is a projection over canonical Concepts, shared Exercises and Problems, and local learning evidence. A lesson must reference those records; it must not redefine their authoritative metadata.

## Studio drafts / manual authoring

Milestones A/B/C/D/E add local `/studio` health/explorers and a **transient structured editor** for the selected canonical lesson. Run `AUTHORING_STUDIO_ENABLED=true npm run dev -- --hostname 127.0.0.1`; production remains unavailable. EN/VI metadata, objectives, all16 block types and canonical Concept/Exercise/Problem/LearnReference/Example/Lesson relationship pickers are editable. Only IDs enter the draft; bounded GET searches never mutate registries. Validate checks the selected unsaved draft server-side and reports codes/severity/field paths; edits stale the report. Preview revalidates and renders the exact unsaved draft using the shared Learn article, with no learner-state writes or execution. Edits mark Preview outdated; refresh explicitly. Drafts/validation/preview never alter repository content. See [Studio workflow](authoring-studio/01-author-workflow.md), [security boundary](authoring-studio/02-security-boundary.md) and [preview architecture](authoring-studio/05-preview-architecture.md).

Milestone G enables **Save existing lesson** and Ctrl/Cmd+S. Save revalidates the exact draft, checks its loaded byte revision, uses the hardened transaction writer, then reloads canonical JSON to establish a clean baseline. Validation failure/conflict preserves the draft; conflict offers Keep draft or confirmed Reload latest. Changed files are repository-relative; Git remains manual. No autosave, new lesson/section, reorder or slug migration. See [Save and storage](authoring-studio/09-save-existing-lesson.md). COMPLETE counts remain declarations, not a full content-quality scan.

Manual and Studio authoring now share `content/learn/subjects/*.json` and `content/learn/lessons/<subject>/*.json`, storing actual canonical types, not a Studio model. Compatibility TypeScript modules parse generated static imports of these same files; development selected-lesson reads are fresh from disk. Refresh the normal Learn lesson after Save; no dev-server restart is required. Production content changes require a normal rebuild/deploy. Do not edit generated indexes by hand or run the retired one-time migration over an initialized checkout. The [file contract](authoring-studio/03-content-file-contract.md) governs ownership.

After intentional hand-maintained registry/dependency changes, review and regenerate the readonly dependency seal with `CS_ATLAS_REFRESH_DEPENDENCY_SEAL=1 npm test -- tests/studio-dependency-seal.test.ts`, and verify HMR/imports agree. Studio fails closed while disk sources and loaded dependency semantics disagree. Ordinary subject/body JSON edits do not require seal regeneration. The initial migration parity snapshot is an audit baseline; intended content changes need a reviewed snapshot update, not an unexplained test bypass.

## Add a subject

1. Manually add a canonical `SubjectManifest` JSON in `content/learn/subjects/` with a stable kebab-case `id`/`slug`, unique positive `navigationOrder`, category, honest content status, localization status, and canonical Concept IDs. Regenerate the deterministic static subject index using the existing serializer in a reviewed developer change. The Learn subject bar derives from manifests, not a separate UI list. Studio cannot create subjects.
2. Add ordered sections and lesson manifests. IDs use `learn:<subject>:<lesson-slug>` and section IDs use `learn-section:<subject>:<section-slug>`.
3. Add reference, exercise, quiz, roadmap, and problem relationships only when the target records exist.
4. Keep an un-authored curriculum item at `SKELETON`. Use `PARTIAL` for a subject with some real content and `COMPLETE` only after every promised surface is reviewed.

## Add a section or lesson

Sections and lessons are ordered from one within their parent. Lesson slugs must be unique within a subject. Provide canonical Concept IDs, prerequisite lesson IDs, estimated minutes, difficulty, translation status, Exercise IDs, and Problem IDs.

For an authored lesson:

1. Add a canonical `LearnLessonContent` JSON in `content/learn/lessons/<subject>/<lesson-id-suffix>.json` and its deterministic literal import in the generated lesson index. New curriculum entries are still manual authoring; Studio G only saves existing lesson identities.
2. Set a version, review date, localized summary, and unique block IDs.
3. Set the manifest lesson's `contentSource` to its canonical JSON path. Use an honest status; `COMPLETE` requires substantive content and a review date under shared validation.
4. Keep all claims, prose, examples, exercises, and quiz questions independently authored and source-attributed when needed.

The renderer supports objectives, paragraphs, headings, lists, definitions, syntax, code, examples, output, restrained callouts, tables, comparisons, complexity notes, exercises, references, and related content. Use only the blocks the lesson needs. Preserve a semantic heading order.

## Add an example

Create one reusable `LearnExample` in hand-maintained `content/learn/examples.ts` and reference it from a lesson block by ID. Set the syntax language independently from the runtime:

- `browser-quickjs` is allowed only for JavaScript supported by the existing constrained QuickJS worker.
- `remote-judge` is reserved for an approved isolated Judge adapter.
- `none` means display/edit/copy/reset are available but Run is honestly disabled.

Never execute native or untrusted source in a Next.js route. Do not duplicate an intentionally shared example in several lesson files.

## Connect exercises, problems, references, and quizzes

- Exercises must use canonical IDs from `content/exercises.ts`; lesson checkpoints link to those records and their existing evidence flow.
- Problems must use public IDs from `content/problems.ts` and remain separate from lesson prose.
- References are typed `LearnReference` records in `content/learn/references.ts`. Add their IDs to the subject reference category and link related lessons and Concepts.
- Quiz questions are original `LearnQuizQuestion` records in `content/learn/quizzes.ts`. Add their IDs to a subject quiz group. Quiz completion records shared `quiz-completed` learning evidence; it does not create another score store.

## Routes and legacy compatibility

Subject, lesson, surface, and reference routes are derived from manifests. When replacing an old one-segment Learn URL, add a deterministic `LearnRouteAlias` in `content/learn/registry.ts`. Do not remove the legacy fallback until bookmarks, Roadmaps, Mind Maps, Search, Profile history, and evidence have migrated.

## Validate

Run:

```sh
npm test -- tests/learn-platform.test.tsx
npm run typecheck
npm run lint
npm test
npm run build
```

The shared canonical parser/per-lesson rules used by both Studio and `validateLearnPlatform` reject malformed16 block variants, status/body policy violations, prerequisite cycles and invalid references. `validateLearnPlatform` additionally rejects duplicate IDs/routes/order, invalid slugs, missing Concepts, prerequisites, Exercises, Problems, References, quiz questions, content links, unsafe runtime declarations, and false `COMPLETE` claims. Add focused tests whenever a new block or runtime contract is introduced.

# Learn authoring guide

CS-Atlas Learn is a projection over canonical Concepts, shared Exercises and Problems, and local learning evidence. A lesson must reference those records; it must not redefine their authoritative metadata.

## Studio drafts / manual authoring

Milestones A/B/C add local `/studio` health/explorers and a **transient structured editor** for the selected canonical lesson. Run `AUTHORING_STUDIO_ENABLED=true npm run dev -- --hostname 127.0.0.1`; production remains unavailable. EN/VI metadata, objectives, all16 block types and canonical Concept/Exercise/Problem/LearnReference/Example/Lesson relationship pickers are editable. Only IDs enter the draft; bounded GET searches never mutate registries. Drafts never alter repository content. See [Studio workflow](authoring-studio/01-author-workflow.md) and [security boundary](authoring-studio/02-security-boundary.md).

Studio cannot save/create/reorder canonical curriculum yet. Reset and dirty-navigation warnings protect transient edits; there is no autosave/draft persistence. Manual authoring below remains the only write workflow; current TypeScript sources have not migrated or gained a parallel model. COMPLETE counts remain declarations and Studio validation is not scanned. Future safe persistence follows the [file contract](authoring-studio/03-content-file-contract.md), never regex rewriting of source.

## Add a subject

1. Add a `SubjectManifest` in `content/learn/registry.ts` with a stable kebab-case `id`/`slug`, unique positive `navigationOrder`, category, honest content status, localization status, and canonical Concept IDs. The Learn subject bar is derived from these manifests; do not maintain a second subject list in UI code.
2. Add ordered sections and lesson manifests. IDs use `learn:<subject>:<lesson-slug>` and section IDs use `learn-section:<subject>:<section-slug>`.
3. Add reference, exercise, quiz, roadmap, and problem relationships only when the target records exist.
4. Keep an un-authored curriculum item at `SKELETON`. Use `PARTIAL` for a subject with some real content and `COMPLETE` only after every promised surface is reviewed.

## Add a section or lesson

Sections and lessons are ordered from one within their parent. Lesson slugs must be unique within a subject. Provide canonical Concept IDs, prerequisite lesson IDs, estimated minutes, difficulty, translation status, Exercise IDs, and Problem IDs.

For an authored lesson:

1. Add a `LearnLessonContent` record in `content/learn/lesson-content.ts`.
2. Set a version, review date, localized summary, and unique block IDs.
3. Set the manifest lesson to `COMPLETE` and provide its `contentSource`.
4. Keep all claims, prose, examples, exercises, and quiz questions independently authored and source-attributed when needed.

The renderer supports objectives, paragraphs, headings, lists, definitions, syntax, code, examples, output, restrained callouts, tables, comparisons, complexity notes, exercises, references, and related content. Use only the blocks the lesson needs. Preserve a semantic heading order.

## Add an example

Create one reusable `LearnExample` and reference it from a lesson block by ID. Set the syntax language independently from the runtime:

- `browser-quickjs` is allowed only for JavaScript supported by the existing constrained QuickJS worker.
- `remote-judge` is reserved for an approved isolated Judge adapter.
- `none` means display/edit/copy/reset are available but Run is honestly disabled.

Never execute native or untrusted source in a Next.js route. Do not duplicate an intentionally shared example in several lesson files.

## Connect exercises, problems, references, and quizzes

- Exercises must use canonical IDs from `content/exercises.ts`; lesson checkpoints link to those records and their existing evidence flow.
- Problems must use public IDs from `content/problems.ts` and remain separate from lesson prose.
- References are typed `LearnReference` records. Add them to the subject reference category and link related lessons and Concepts.
- Quiz questions are original `LearnQuizQuestion` records. Add their IDs to a subject quiz group. Quiz completion records shared `quiz-completed` learning evidence; it does not create another score store.

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

`validateLearnPlatform` rejects duplicate IDs/routes/order, invalid slugs, missing Concepts, prerequisites, Exercises, Problems, References, quiz questions, content links, unsafe runtime declarations, and false `COMPLETE` claims. Add focused tests whenever a new block or runtime contract is introduced.

# Learn overhaul implementation report

## Completion statement

**Architecture complete for the implemented v2 slice. Content is not complete.** The platform now has the catalog, manifests, routes, tutorial workspace, typed renderer, examples, exercises, quizzes, references, search, progress, bookmarks, AI links, validation, and migration boundary needed for incremental authoring. Only 9 lessons contain reviewed full block content; 419 manifest lessons are honestly marked as skeletons.

## Research

The research package at `docs/research/w3schools-learn-audit/` records the crawl scope, route inventory, page archetypes, navigation, taxonomy, lesson anatomy, editor, exercises, references, responsive behavior, measurements, gap analysis, findings, and comparison matrix.

- Subjects examined: all catalog groupings available to the research tools, with complete linked-curriculum inventories for the 12 Tier 1 subjects and representative Tier 2/Tier 3 routes.
- Archetypes: catalog, subject home, lesson/sub-lesson, exercise hub/item, examples, quiz, reference index/table/item, syllabus, study plan, editor, and special interactive pages.
- Network limitation: direct conservative requests to W3Schools returned HTTP 403 and no restriction was bypassed. Findings use public search-index metadata and accessible research results; no page bodies, bundles, CSS, exercises, quizzes, or proprietary assets were saved.

## Implemented architecture

- One typed `SubjectManifest` / `CurriculumSection` / `LessonManifest` registry over canonical Concept IDs.
- A discriminated lesson block model and reusable renderer.
- Subject-scoped curriculum navigation, active/completed state, filtering, collapsible groups, independent sticky scrolling, preserved local scroll/collapse state, keyboard Escape/focus restoration, and a mobile drawer.
- A manifest-ordered, horizontally scrollable Learn subject bar shared by the Learn catalog, subject homes, lessons, exercises, examples, quizzes, and references. Direct routes keep the active subject visible and highlighted.
- One subject workspace shell now composes the persistent curriculum, bounded main reader, optional right rail, and responsive drawer across subject home and lesson/surface routes, avoiding layout jumps between overview and lesson pages.
- Readable center column plus optional desktop rail for headings, Concepts, Problems, and bounded Atlas AI entry.
- Separate subject home, tutorial, examples, exercises, quiz, reference index, and reference detail surfaces.
- Atlas-native editor cycle with edit, reset, copy, output, and Playground actions. Existing QuickJS is reused for supported JavaScript only; unsupported runtimes are labeled unavailable.
- Shared learning evidence adds `lesson-started`, `lesson-completed`, and `quiz-completed`; no second progress database was created.
- Lesson and reference bookmarks use the existing storage/provider boundary.
- Unified Search now indexes Subject, Section, Lesson, and Reference projections alongside Concepts, Problems, Roadmaps, and other existing records.
- Deterministic legacy aliases and a legacy resolver preserve useful one-segment Learn routes.

## Content inventory

| Subject | Manifest lessons | Fully authored | Status |
|---|---:|---:|---|
| Python | 152 | 5 | PARTIAL |
| Data Structures & Algorithms | 110 | 4 | PARTIAL |
| C | 14 | 0 | SKELETON |
| C++ | 12 | 0 | SKELETON |
| Java | 12 | 0 | SKELETON |
| JavaScript | 20 | 0 | SKELETON |
| HTML | 16 | 0 | SKELETON |
| CSS | 18 | 0 | SKELETON |
| SQL | 13 | 0 | SKELETON |
| NumPy | 11 | 0 | SKELETON |
| Pandas | 13 | 0 | SKELETON |
| Machine Learning | 28 | 0 | SKELETON |
| PyTorch | 9 | 0 | SKELETON |
| **Total** | **428** | **9** | **2 partial / 11 skeleton** |

The authored batch contains 7 reusable examples (2 QuickJS-runnable JavaScript examples and 5 display/edit Python examples), 1 canonical Exercise integration, 2 related public Problem integrations, 8 structured Reference records, and 5 original quiz questions.

## Route and UX changes

`/learn` now leads with a compact horizontal subject bar, followed by search, Continue Learning, a reduced grouped catalog, and the preserved Guided Learning mode. Subject pages disclose total versus authored curriculum and expose every learning surface without duplicating the complete lesson list in the center. The persistent left curriculum is visible immediately on subject homes and remains in place through lessons and other subject surfaces. The migration table is documented in `docs/atlas-v2/learn-route-migration.md`.

Wide layouts use a 264px curriculum, bounded reader, and 224px rail rather than stretching prose. The subject bar and curriculum use coordinated sticky offsets below the Atlas header. The rail collapses at laptop widths; the curriculum becomes a focus-managed drawer below 900px; the subject bar remains horizontally scrollable; and article/example controls become full-width on mobile. Styling uses existing semantic tokens, restrained dividers, dense rows/tables, and Atlas typography rather than W3Schools branding.

## Validation and tests

Automated coverage validates IDs, slugs, order, Concepts, prerequisites, Exercises, Problems, References, content sources, route aliases, runtime contracts, search projections, sequence navigation, active sidebar state, default and persisted collapse state, lesson evidence, completion, and mobile drawer keyboard behavior. Existing suites continue to cover shared Search, progress migrations, QuickJS execution, AI context, routes, accessibility primitives, and responsive shell behavior.

- Learn validation: 7 focused tests passed.
- Full suite: 44 test files and 226 tests passed.
- ESLint: passed.
- TypeScript strict check: passed.
- Next.js 16 production build: passed; 735 static pages generated and all Learn manifest routes were included.
- Browser smoke: `/learn`, Python Lists, DSA Graph Traversal, and Python Reference were inspected in the production server at wide desktop, 820px tablet, and 400px mobile widths. Light/dark themes and English/Vietnamese UI were exercised. The curriculum drawer, adjacent navigation, tables, disabled Python runtime, and QuickJS example were checked; the JavaScript traversal example returned `[0,1,2,3]`. DevTools showed zero console messages.
- Route smoke: the build generated subject homes, 493 subject surface/lesson paths, and 8 reference details. The focused route tests cover deterministic aliases; legacy fallback behavior remains in the route resolver.

## Known gaps and recommended batches

- Author the remaining Python foundations/collections/control-flow lessons, then DSA searching/sorting/graph lessons, keeping examples and checkpoints high quality.
- Add more canonical Exercise records before populating exercise hubs; skeleton curriculum entries deliberately do not imply exercises exist.
- Python cannot safely execute in-browser with the current JavaScript-only QuickJS runner. Add Python only through an independently reviewed browser sandbox or isolated Judge service.
- Section-level quiz reporting is evidence-based but intentionally lightweight; adaptive assessment remains future work.
- Expand Vietnamese lesson bodies deliberately; manifests currently report English-only rather than implying translation parity.
- Add generic visualization records/renderers before authoring sorting, tree, and graph animations; avoid one-off lesson components.
- Validate bundle budgets again as editors and visualizations are added, keeping interactive code lazy and server-rendering static content.

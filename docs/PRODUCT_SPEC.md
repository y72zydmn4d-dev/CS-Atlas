# Product specification

## Product intent

CS Atlas helps technical learners navigate computer science and AI as a connected body of knowledge. The primary action is exploration: start from a domain, follow prerequisites, inspect conceptual neighbors, and record learning state.

## Core journeys

The current entry point is a learning workspace, not a marketing hero. It shows active learning or honest starting suggestions, recent saved bookmarks, a small navigable field map and compact domain cards. A persistent sidebar can collapse to an icon rail without losing navigation names. Search, language and theme controls remain accessible from the command bar.

The dedicated `/atlas` explorer supports a cross-field overview, field-specific topics, bilingual accent-insensitive search that focuses the matching node, pan/zoom/fit, map/list switching, and an inspector. Field membership uses dashed edges; prerequisites use directional edges. The inspector connects to full pages, progress, bookmarks and personal Library resources. Atlas, syllabus, roadmap and mind map serve different purposes and remain separate views.

Library now offers persisted list/grid selection and a smaller import surface. Topic reading surfaces have clearer line length, contrast and table-of-contents placement. Practice keeps its execution contract and language limitations; its editor, action area and result surfaces use the shared visual system. Reduced-motion mode removes decorative transitions without hiding information.

1. Select a domain from the home atlas or domain catalog.
2. Choose a syllabus for structure, a roadmap for learning order, or a mind map for conceptual context.
3. Open a topic, algorithm, or technique and follow its prerequisite and related links.
4. Study definitions, derivations, worked examples, and code; attempt exercises with progressive hints and inspect solutions when needed.
5. Mark topic and exercise status and bookmark material for later.
6. Return through Progress, Bookmarks, or command search.
7. Switch between English and Vietnamese without changing routes or losing progress.
8. Select eligible English explanatory text and request a contextual Vietnamese translation without leaving the page.
9. Add local documents or learning links, connect them to atlas entities, and find them again from Library or global search.
10. Open a connected topic and see the user's related Library resources without mixing personal material into canonical content.
11. Optionally ask Gemini about an Atlas concept, inspect linked Atlas pages, and keep private Library material out of the AI request.
12. Follow a knowledge page into Practice, filter bilingual exercises, write JavaScript, run deterministic public cases, inspect expected versus actual output, and revisit prerequisites. Public-test completion is separate from reading progress.
13. Fit/evaluate a small ML regression model with deterministic numerical checks; separately complete a self-assessment rubric for leakage, baselines, and evaluation choices. This is not notebook execution or AI grading.

### Practice boundaries

Seven initial problems use 35 public tests. Accepted certifies only these visible tests; it does not prove asymptotic complexity or correctness for every input. Hidden Submit is explicitly unavailable pending reviewed isolated infrastructure. The browser-only runner needs no API key; optional Gemini hints require an explicit request and never decide the verdict. Latest 40 run records, drafts, rubric notes, and versioned completion records are local to the browser.

## Interaction principles

- Graphs reveal relationships; lists provide scannable alternatives.
- Progress is informational rather than gamified.
- Each detail page retains hierarchy and adjacent navigation.
- Search always shows result type and parent context.
- Content maturity is explicit: Foundation indicates coverage, Developing indicates growing depth, and Reference-quality indicates a reviewed teaching sequence with examples, exercises, and sources.
- Citations are attached to claims or blocks rather than displayed as an ornamental bibliography.
- The application remains useful with no account, network service, or API key.
- Translation completeness is visible: fully translated reference topics are distinguished from metadata-only Vietnamese pages.
- Formulas and source code are preserved verbatim across locales.
- Imported files remain in the current browser unless the user explicitly downloads or exports data.
- Personal documents are reference material, never silently promoted into official atlas content.

## Document Library

Library supports local PDF, DOCX, Markdown, and TXT imports plus HTTP/HTTPS links. Other files may be retained as attachment-only items with an honest preview/extraction limitation. Users can edit metadata, notes, tags, language, and multi-entity relationships; search and filters cover both metadata and bounded extracted text.

The document detail page is a reading workspace rather than a narrow preview card. PDF uses the browser's local renderer inside a tall, wide viewer; Focus mode, open-original, download, and a collapsible detail rail remain available. TXT and DOCX display safe extracted text; Markdown preserves basic heading, paragraph, list, and fenced-code structure without executing source HTML. Text modes have reading-width and font-size controls. Browser-native PDF zoom and pagination are labeled as such rather than represented by nonfunctional Atlas controls.

Links show a rich preview when a real thumbnail or Open Graph image is available, with honest fallback when it is not. Saving or explicitly refreshing a link can request public HTML metadata through a bounded, SSRF-protected Next.js route; the UI discloses that this contacts the linked website. The response is cached with the Library item in IndexedDB. YouTube videos can derive official thumbnails without an API key; playlists do not receive invented images. GitHub repository labels are recognized, and social images display only if fetched. Users can edit text and image URL manually. External pages are never framed. Metadata export is available as JSON; local image uploads, binary backup/restore, and automatic content ingestion remain future work.

## Initial content coverage

The release includes ten domains, 79 topics, ten core algorithms, twenty techniques, and eleven applied projects. DSA, Mathematics for AI, and Machine Learning have the deepest syllabus and relationship coverage.

Three topics establish the reference-quality teaching standard:

- Complexity Analysis: cost models, asymptotic bounds, loop and recurrence analysis, aggregate cost, and proof exercises
- Gradient Descent: objective functions, derivation, hand calculations, batch variants, implementation, scaling, and convergence mistakes
- Linear Regression: least squares, a hand-worked fit, normal equations, stable implementation, solver comparison, evaluation, and leakage prevention

The remaining topics intentionally retain Foundation coverage until they receive the same depth. The interface exposes this difference instead of presenting concise summaries as finished curriculum.

All ten domain records and all 79 topic metadata records are available in English and Vietnamese. Complexity Analysis, Gradient Descent, and Linear Regression include complete Vietnamese structured content. The remaining long-form material continues to display in English with a visible partial-translation label until it receives an editorially reviewed translation.

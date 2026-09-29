# Implementation plan

## Completed release sequence

1. Established Next.js, TypeScript, Tailwind, linting, and test foundations.
2. Defined reusable content entities and validated relationship registries.
3. Built the responsive application shell, themes, navigation, breadcrumbs, and search command.
4. Implemented home, domain exploration, topic documentation, syllabi, roadmaps, and mind maps.
5. Added algorithm and technique catalogs, detail pages, and three frame-driven visualizers.
6. Added local progress, bookmarks, project catalog, search, and graceful not-found handling.
7. Added content/search/progress tests and project documentation.
8. Replaced generic topic sections with a discriminated `ContentBlock` model and one shared renderer.
9. Added source/citation, glossary, learning-objective, revision, and exercise entities.
10. Built reference-quality vertical slices for Complexity Analysis, Gradient Descent, and Linear Regression.
11. Added persistent exercise status, progressive hints and solutions, richer search, and stricter graph/content validation.
12. Reworked DSA, Mathematics for AI, and Machine Learning roadmaps into branching dependency graphs.
13. Added a typed English/Vietnamese message system, persistent locale switching, and localized application navigation.
14. Translated metadata for all ten domains and 79 topics, plus complete structured Vietnamese content for the three reference topics.
15. Added bilingual, accent-insensitive search and a safe selection-to-Vietnamese translation pipeline with deterministic local fallbacks.
16. Added localization, persistence, translation-provider, text-selection, and formula/code preservation tests.
17. Added a versioned IndexedDB Library repository with separate metadata/blob stores, validation, duplicate detection, and corrupt-record recovery.
18. Added file/link import, lazy PDF/DOCX/text extraction, Library listing/search/filtering, detail viewer, editing, notes, tags, download, deletion, and metadata export.
19. Added searchable relationships to all atlas entity families and Library resource islands on domain, topic, algorithm, and technique pages.
20. Integrated Library items into bilingual global search and added repository, extraction, security, search-ranking, UI, and object-URL lifecycle tests.
21. Added optional Gemini Q&A over public Atlas excerpts, with a server-only key, bilingual UI, linked Atlas context, bounded requests, and no Library document egress.
22. Added Practice schema, seven bilingual problems with verified reference solutions, strict/numeric comparators, and isolated QuickJS WASM public-test execution in a disposable Worker.
23. Added catalog filters/search, keyboard-accessible editing, per-case feedback, hints, local drafts/history/versioned completion, ML rubric, optional Gemini hints, and bidirectional knowledge-page links.
24. Verified production-browser wrong-answer → corrected solution → Accepted → reload persistence and runaway-code interruption. Fixed production minification of the vendor WASM loader by serving its pinned upstream ESM locally and unchanged.

## Logical next increments

- Completed workspace overhaul: semantic light/dark tokens; compact sidebar and command bar; real learning continuation and saved items; data-derived home map; `/atlas` map/list/search/inspector; next-topic domain actions and anchored module sequence; Library view preference; reading/Practice visual integration; interaction/model regression tests.
- Future refinements: richer graph layout for very large field clusters, optional URL-persisted Atlas selection, and a dedicated syntax-aware Practice editor. These are not claimed as implemented.
- Deepen the next vertical slice: Arrays and Hash Tables, Vectors and Matrices, Probability Foundations, and Model Evaluation.
- Extend editorially reviewed Vietnamese long-form content to the next reference-quality topic slices, followed by algorithms, techniques, and projects.
- Add more reviewed Practice problems and richer editor tooling. Hidden Submit needs authenticated queueing and hardened, independently reviewed execution isolation before activation.
- Define a `ContentProposal` schema and build a review-first document import pipeline with source provenance and diffs.
- Add graph layout generation for larger, cross-domain maps.
- Add optional account sync while retaining the local storage adapter.
- Add Playwright smoke tests when browser binaries are part of the development environment.
- Add encrypted binary backup/restore and an opt-in sync repository without changing the Library UI contract.
- Add a review-first `IngestionSuggestion` workflow only after provenance, diff, and explicit approval UX are defined.

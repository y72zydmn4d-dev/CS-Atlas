# CS-Atlas 2.0 Implementation Report

**Date:** 2026-09-30  
**Scope:** Initial additive v2 migration slice on `atlas-v2`.

## 1. Executive summary

CS-Atlas now has a connected, local-first v2 slice. Canonical Concepts and typed relations link existing authored curriculum, embedded exercises, public-test problems, Atlas exploration, Library links, local learning evidence, public AI context, and deterministic search. The slice preserves existing routes, authored content, browser state, QuickJS execution, and IndexedDB Library data.

## 2. Final product architecture

The product is organized around capability-level Learn, Practice, Explore, Personal Learning, and Atlas AI views over structured content and canonical domain records. Authored content remains in `content/`; presentation components remain under `components/`; routes compose those capabilities; browser persistence stays behind `lib/storage.ts` and the Library repository.

## 3. Final UI architecture

The global shell presents Home, Learn, Practice, Explore, Library, Progress, Atlas AI, Profile, and Settings. New Learn, Concept, Exercise, Problem, Explore, and Profile pages use the responsive workspace token layer, compact lists/tables, semantic headings, and existing light/dark and English/Vietnamese infrastructure. Original route URLs remain available.

## 4. Design-system changes

`app/workspace.css` adds scoped workspace surfaces for the new learning, concept, exercise, problem, explore, and profile views. It uses existing semantic color variables, compact spacing, visible focus treatment, and responsive layouts rather than an alternate theme system.

## 5. Milestones completed

This is not a declaration that M1-M14 are complete. The implemented and tested portions are M1 capability navigation, M2 canonical identity and relation validation, M3 Atlas projection, M4 lesson navigation, M5 exercise records, M6 Judge contracts/unavailable adapter, M7 problem library, M8 graph-view mapping, M9 Library relation compatibility, M10 local evidence/profile projection, M12 public Concept AI context, and M13 static search expansion. Remaining acceptance items stay unchecked in `TASKS.md`.

## 6. Existing systems preserved

The App Router, existing topic content renderer, route URLs, bilingual overlays, theme provider, command palette, React Flow graphs/list alternatives, QuickJS browser Worker, localStorage records, IndexedDB Library repository, and optional server-only Gemini adapter are preserved.

## 7. Major refactors

`lib/domain/` separates canonical domain contracts from presentation records. `content/concepts/registry.ts` adapts existing Topics, Algorithms, and Techniques into validated Concepts without bulk content rewrite. `lib/concepts/service.ts` owns bounded graph reads, and feature adapters expose lessons, exercises, problems, graph views, Library links, and local evidence through canonical IDs.

## 8. Domain model

Canonical IDs are type-qualified: `topic:<legacy-id>`, `algorithm:<legacy-id>`, and `technique:<legacy-id>`. This prevents legacy collisions such as separate Algorithm and Technique records named `two-pointers`. Relations use validated typed vocabulary, and authored content records refer to Concept IDs rather than duplicating Concept metadata.

The checked `content/concepts/legacy-map.ts` artifact records every source ID/slug, preserved route, canonical destination, and raw-ID collision. Migration parity tests cover registry counts, routes, citations, graph references, Exercises, Problems, and compatibility resolution.

## 9. Knowledge Graph

The in-memory, content-backed graph service supports bounded Concept and relation queries. `/atlas` projects canonical topic concepts and prerequisite relations. Roadmaps and Mind Maps retain separate authored nodes, layouts, and edge semantics while resolving Concept references through `lib/concepts/views.ts`.

## 10. Learn system

`/learn` indexes existing typed topic content as lessons. `/learn/[lesson]` preserves the block renderer, citations, localization, bookmarks, related Practice links, Library islands, and ordered previous/next traversal. Lessons are content-driven and route files remain thin.

## 11. Exercise system

Embedded topic exercise blocks are adapted to versioned Exercise records and listed at `/exercises`. Exercise activity can append bounded local learning evidence against a Concept. This remains distinct from a programming Problem and does not imply remote assessment.

## 12. Judge status

Judge contracts define language, submission state, and AC/WA/TLE/MLE/RE/CE vocabulary. `UnavailableJudgeClient` never evaluates source and keeps Submit unavailable. A separately operated, independently reviewed isolated execution service, authenticated API, hidden-test storage, durable quotas, monitoring, and kill switch are required before remote judging can be enabled.

## 13. Problem Library

`/problems` exposes current Practice definitions as public-only Problem records with search, difficulty, topic, and local public-case status. `/problems/[problem]` links each record back to Concepts and the existing Practice workflow. Browser QuickJS runs are local evidence only, never Judge certification.

## 14. Roadmap / Mind Map status

Current roadmaps and mind maps render through an adapter that resolves topic links to canonical Concepts without changing structural nodes, layouts, or their separate sequence/association semantics. Existing graph routes remain intact, progress overlays are preserved, unresolved mappings are reported, and both views provide a deterministic keyboard-accessible list alternative. Roadmap prerequisite order is validated independently; mind-map association edges are not reinterpreted as prerequisites.

## 15. Library status

Library remains browser-local and private. `lib/library/concept-relations.ts` resolves existing Library relations to Concepts without rewriting IndexedDB records. Original files, extraction, and metadata never enter Atlas AI context.

## 16. Progress / Profile status

Local exercise and Practice events can create bounded, validated Concept evidence under a new additive localStorage key. The Profile route presents local learning activity without claiming an account or a public profile. Existing progress and bookmark data are unchanged.

## 17. Atlas AI status

Atlas AI supports explicit public Concept context through the existing server-only provider boundary. Library files, extracted text, progress, bookmarks, hidden tests, reference solutions, and ambient user code are excluded. Live Gemini remains optional and needs a server-only key.

## 18. Search status

The deterministic static index now includes Concepts, Exercises, and Problems alongside existing public content. The command palette and search page retain local Library metadata integration. There is no remote, semantic, or cross-user search service.

## 19. Security

No untrusted code executes in Next.js. Browser practice remains constrained to its existing QuickJS Worker and visible public tests. The Judge adapter cannot run source. Canonical validation narrows authored relations, Library remains excluded from AI, and existing API/provider boundaries remain server-only. Authentication, durable rate limits, and remote ownership checks are intentionally not claimed because no remote user data is enabled.

## 20. Test/build results

On 2026-09-30, `npm run typecheck` passed, `npm run lint` passed, `npm test` passed with 154 tests in 26 files, and `npm run build` passed with 223 generated routes. Local development smoke requests returned HTTP 200 for `/learn`, `/concepts/topic-arrays`, `/problems`, `/explore`, and `/profile`.

## 21. External configuration required

Core local-first functionality requires no credentials. Optional Atlas AI requires `GEMINI_API_KEY` in ignored `.env.local`; public deployment also needs authentication, shared rate limits, and provider spending controls. Enabling remote Submit requires an operated isolated Judge service and the M6/M14 security gates.

## 22. Known limitations

There are no accounts, remote sync, public profiles, hidden tests, remote Judge execution, durable server-side submissions, goals/study plans, advanced mastery modeling, RAG, semantic search, or authorization-backed remote search. `TASKS.md` records the remaining acceptance criteria and migration work.

## 23. Recommended next work

Complete M1 route metadata/loading/error coverage and responsive acceptance tests; finish M2 source-aware legacy mapping and content parity fixtures; then implement the typed Exercise flow, Judge lifecycle UI against the unavailable contract, Library export/migration, transparent progress policy, and the corresponding privacy/security gates in milestone order.

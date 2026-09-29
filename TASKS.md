# CS-Atlas 2.0 Implementation Backlog

All M1-M14 work below is planned, not complete. Tasks become complete only after implementation, review, tests, migration evidence, and documentation are present. Preserve incremental release slices and existing user data.

## Dependency overview

`M0 -> M1 -> M2 -> M3 -> {M4, M5}`. `M6` depends on M2 and M5; `M7` depends on M2, M3, and M6; `M8` depends on M2 and M3; `M9` depends on M1 and M2; `M10` depends on M2, M4, M5, M8, and M9; `M11` depends on M1 and M9; `M12` depends on M2, M4, M5, M9, and M10; `M13` depends on M2, M3, M4, M5, M8, and M9; `M14` runs continuously and gates release after all user-facing milestones. M6 isolation design and threat review must precede any remote execution implementation.

## M0 - Repository audit and architecture

- [x] Audit existing routes, data, UX, APIs, browser storage, tests, deployment assumptions, risks, and security boundaries.
- [x] Record current state, target boundaries, migration sequence, domain model, API/persistence proposals, risks, ADRs, and milestone dependencies in `docs/atlas-v2/` and root engineering documents.
- [x] Human review and approval of the architecture package before M1 implementation (owner-authorized implementation request, 2026-09-29).

## M1 - Atlas Core / app shell / navigation

Depends on M0 review.

- [x] Define the canonical top-level navigation taxonomy and route ownership for Learn, Practice, Explore, Personal Learning, and Atlas AI while preserving existing route aliases.
- [ ] Extract shared route metadata, breadcrumbs, page titles, not-found/loading/error behavior, and navigation configuration without changing feature semantics.
- [ ] Consolidate app-shell theme, locale, and navigation preference ownership behind existing providers/storage contracts; add account-aware preference adapter only after identity is selected.
- [ ] Implement responsive shell navigation with keyboard, screen-reader, reduced-motion, light/dark, and narrow viewport acceptance tests.
- [x] Create capability/feature registry for navigation and search; hide unavailable future features without dead routes.
- [x] Document route redirect and browser-state compatibility before any route rename.

## M2 - Unified domain model

Depends on M1 route ownership decisions; must precede new Learn, Judge, and user-data persistence schemas.

- [x] Specify stable `Concept` IDs, slugs/aliases, localized names/descriptions, scope/status, provenance, and lifecycle rules.
- [x] Define typed relation vocabulary and direction/cardinality semantics, including `PREREQUISITE_OF`, `RELATED_TO`, `PART_OF`, `USES`, `BUILDS_ON`, and `NEXT_TOPIC`.
- [ ] Define separate records and links for `Lesson`, `Reference`, `Exercise`, `Problem`, `Roadmap`, `MindMap`, `Resource`, and `UserMastery`; use concept IDs as cross-feature anchors.
- [x] Add runtime validation for IDs, relation endpoints, relation semantics, locale payloads, and cycles where the relation requires a DAG.
- [x] Create a source-qualified old-ID to Concept-ID mapping for concept-backed topics/algorithms/techniques, retain domain/project/practice identities in their owning records, and document collisions/aliases.
- [x] Add compatibility adapters so current `content/` types, Library relations, and current routes resolve through canonical IDs without breaking published content.
- [x] Add content parity tests for entity count, IDs, citations, route destinations, graph references, Exercise links, and Problem/Practice relation integrity.

## M3 - Knowledge Graph foundation

Depends on M2.

- [x] Define graph read/query contracts over canonical records and typed relations; do not add a graph database absent measured query need.
- [x] Implement in-memory/content-backed graph adapter for concepts and existing prerequisite relationships.
- [x] Convert `/atlas` to a projection over canonical entities while retaining its filters, bilingual search, inspector, progress context, and keyboard list.
- [x] Establish relation validation, stable layout input IDs, bounded graph reads, and safe unresolved/deprecated Concept handling.
- [x] Add graph fixture tests for cross-domain prerequisites, deduplicated edges, relation direction, and deterministic graph/list inputs.

## M4 - Learn platform

Depends on M2 and M3.

- [ ] Define lesson/course/reference/example/playground metadata and typed lesson block schema with localization and provenance.
- [x] Port current typed topic blocks through a compatibility renderer; preserve existing deep lessons and legacy topic URLs.
- [x] Build course/lesson navigation and previous/next traversal from authored ordering plus concept prerequisites.
- [ ] Introduce language/runtime capability metadata separately from syntax highlighting; never imply execution when runtime is unavailable.
- [ ] Add authored starter vertical slices for programming foundations and one CS/AI curriculum; validate content and citations.
- [ ] Define authoring/validation workflow and content review maturity so large datasets remain out of page components.

## M5 - Exercise platform

Depends on M2; shares concepts with M4 and can proceed after its contract is stable.

- [x] Define `Exercise` separately from online-judge `Problem`, with answer modes, hints, feedback, attempts, rubric, and concept relations.
- [x] Migrate embedded topic exercises using stable IDs, explicit version rules, and a compatibility adapter.
- [x] Add non-code exercise renderers and local completion state with accessible input and honest persistence labels.
- [x] Define common exercise list/filter/topic views and link them from Learn without copying lesson text.
- [x] Add tests for hint progression, attempt state, version changes, locale fallbacks, and concept links.

## M6 - Online Judge

Depends on M2 and M5; security threat model and isolated-service interface must be approved before code execution service work.

- [x] Define Problem, language, submission, public/hidden test-suite reference, verdict, resource-usage, and Judge-event contracts.
- [ ] Define authenticated submission API, idempotency, queue state, cancellation, polling/webhook contract, quotas, and retention policy.
- [ ] Specify isolated execution service boundary and independently review threat model, sandbox lifecycle, kernel/microVM controls, no-network policy, secrets isolation, output caps, CPU/memory/process limits, and audit policy.
- [x] Build an unavailable Judge adapter, validated lifecycle state machine, and status UI without executing user code in Next.js or its application worker pool.
- [ ] Build a separately operated sandbox service only after M14 security review and operational ownership are in place.
- [x] Implement verdict UX for AC/WA/TLE/MLE/RE/CE plus queued/running/failed/cancelled/unavailable and optional service measurements.
- [ ] Add adversarial tests, service contract tests, isolation tests, abuse limits, operational alerts, and a kill switch before enabling Submit.

## M7 - Problem Library

Depends on M2, M3, and M6 problem contracts.

- [x] Expand authored Problem metadata, topic/tag/rating/difficulty filters, public examples, constraints, and source/provenance validation.
- [x] Add public progressive hints and complexity guidance plus explicit server-only reference-solution and unavailable-discussion publication policies.
- [x] Relate Problems to canonical Concepts, Lessons, Exercises, Roadmaps, and prerequisite Concepts using stable IDs.
- [x] Add Problem search facets and tests for locale, tags, canonical links, visibility, and public-runtime/editor-only language combinations.

## M8 - Roadmap + Mind Map integration

Depends on M2 and M3.

- [x] Define roadmap and mind-map authored view schemas over canonical concept IDs, with distinct semantics and separate layout/edge data.
- [x] Map current `Domain.roadmap` and `Domain.mindMap` node topic links to concepts, retaining structural nodes and domain overview meaning.
- [x] Preserve existing graph routes and add deterministic list alternatives, progress overlays, and unresolved-node reporting.
- [x] Add graph validation that checks roadmap prerequisite ordering independently from mind-map relation semantics.
- [ ] Remove duplicated concept labels/URLs gradually only after parity tests and authoring workflow are in place.

## M9 - Personal Library

Depends on M1 and M2; account sync is not a prerequisite for preserving local-only use.

- [ ] Define user-owned Library item, file object, note, collection, resource link, and canonical concept relation contracts.
- [ ] Preserve browser IndexedDB repository behind its interface; add export/import and explicit schema migration before introducing remote sync.
- [ ] Decide identity, encryption, file-size/quota, deletion, export, sync conflict, retention, and privacy semantics before remote storage implementation.
- [ ] Add repository adapters and ownership checks if cloud sync is approved; preserve offline/local mode with observable sync states.
- [ ] Keep extraction separate from metadata/binary storage; define future background ingestion job interface without embeddings or RAG coupling.
- [ ] Test invalid files/URLs, duplicate handling, migration, quota failure, export privacy, ownership, and deletion across metadata and blobs.

## M10 - Progress / Mastery / Study Plans

Depends on M2, M4, M5, M8, and M9.

- [x] Define event and current-state models for lesson progress, exercise attempts, public problem evidence, mastery evidence, study goals, and plans.
- [x] Separate mastery estimates from completion flags; document evidence, confidence, recency, decay, and future user correction behavior without exposing an opaque score.
- [x] Derive current local progress dashboard and graph overlays from canonical Concept IDs through an adapter, preserving existing local state during migration.
- [x] Define local study-plan scheduling, timezone-aware recurring goals, due dates, and activity aggregation with user-owned privacy boundaries.
- [x] Add idempotent migrations from topic status/exercise status/public Practice completion to explicitly marked evidence records with parity and rollback fixtures.

## M11 - Profile

Depends on M1 and M9 identity decision.

- [ ] Select and document authentication provider or defer accounts; define session, account lifecycle, recovery, and privacy policy.
- [ ] Define profile fields, visibility defaults, deletion/export behavior, locale/theme preferences, and public/private boundaries.
- [ ] Add server-side authorization tests for every user-owned resource and prohibit client-asserted owner identity.
- [ ] Preserve anonymous local use and provide explicit migration/linking for existing browser data if accounts are introduced.

## M12 - Atlas AI

Depends on M2, M4, M5, M9, and M10 context contracts; RAG is a separate later capability.

- [x] Define context-source interfaces and sensitivity policies for page, Concept, Lesson, Problem, selected code, Roadmap, progress/mastery, and explicitly authorized Library retrieval.
- [x] Define consent, per-source availability and size controls, retention/logging, provider selection, cost limits, prompt-injection defenses, and deletion behavior; keep private sources disabled.
- [x] Preserve the server-only Gemini adapter as the first provider implementation and its public Atlas-only active context path.
- [x] Build tutor/explanation/hint/debug/review/quiz/generation workflows as typed, provenance-linked tasks that cannot apply generated changes.
- [x] Design optional Library ingestion, chunk, embedding, and deletion-job records linked to source/version while keeping canonical files and metadata independent of RAG.
- [x] Add AI evaluation fixtures for grounding, private-source exclusion, malicious instructions, server-issued provenance, output limits, and malformed provider responses.

## M13 - Global Search

Depends on M2, M3, M4, M5, M8, and M9; implement after IDs and visibility rules settle.

- [x] Define a versioned searchable document projection with entity type, canonical ID, locale fields, visibility, URL, hierarchy, ownership scope, and source version.
- [x] Preserve current accent-insensitive deterministic local search as a compatibility/fallback adapter.
- [x] Index Learn, Concepts, Exercises, Problems, Roadmap/Mind Map links, resources, and authorized local Library metadata with visibility filtering before ranking.
- [x] Define command-palette ranking, keyboard navigation, empty/loading states, private-result labels, and deep links.
- [x] Evaluate full-text database search before adding a dedicated service; retain the measured-small in-memory corpus and require separate semantic-search privacy/cost review.
- [x] Add parity, localization, authorization-filter, stale-index, destination, and existing keyboard/accessibility tests.

## M14 - Security / Performance / Integration / Release Audit

Runs continuously; final release gate depends on M1-M13 scope included in the release.

- [ ] Maintain threat models for auth, Library, AI/provider boundaries, search, and judge service; close or explicitly accept each high risk.
- [ ] Run dependency/license review, secret scanning, API abuse review, privacy/log audit, and security-header/configuration review.
- [ ] Measure route JS, content loading, graph sizes, search latency, document extraction memory, and Core Web Vitals against agreed budgets.
- [ ] Test supported browser/device matrix, keyboard/screen-reader paths, reduced motion, both themes/locales, and mobile layouts.
- [ ] Rehearse content/data migrations, export/import, backups/restore where applicable, rollback, and incident/kill-switch operation.
- [ ] Run lint, strict typecheck, unit/integration/e2e suite, and production build; publish a release checklist and residual-risk record.

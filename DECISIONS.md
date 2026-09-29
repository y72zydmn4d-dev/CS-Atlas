# Architecture Decision Records

This file records decisions that constrain CS-Atlas architecture. New decisions are appended as ADRs. Superseded decisions remain for history and link to the replacing ADR. A proposal is not an implementation claim.

## ADR-0001: Migrate incrementally from the current application

- **Status:** Accepted for planning; M1 requires human review of this architecture package.
- **Context:** The repository already contains mature learning content, App Router views, local persistence, graph interactions, a Library, bilingual UX, and tested Practice execution. A rewrite would strand routes and user-local records.
- **Decision:** Evolve in milestone-sized slices, retaining working boundaries and adapting old models through compatibility layers until parity is proven.
- **Rationale:** It preserves learner value and allows verification after each migration. Current data is mostly authored code and browser-owned data, so both need deliberate transition strategies.
- **Alternatives considered:** Replace the application wholesale; freeze the current product and build a separate app; migrate every subsystem at once.
- **Consequences:** Temporary adapters and old/new models may coexist. Each milestone needs ownership, parity, rollback, and deprecation criteria.

## ADR-0002: Use canonical concepts and typed relations before selecting graph storage

- **Status:** Proposed.
- **Context:** Concepts are currently represented by domains/topics and related algorithm/technique/project IDs; roadmaps, mind maps, and `/atlas` have different graph contracts.
- **Decision:** Establish stable canonical Concept IDs and a validated relation vocabulary. Begin with the existing content registry and simple relational/in-memory projections; do not require a graph database.
- **Rationale:** The important missing capability is shared identity and relation semantics, not graph persistence technology.
- **Alternatives considered:** Keep feature-local IDs indefinitely; flatten all entities into one untyped graph; introduce a graph database immediately.
- **Consequences:** Existing IDs need a mapping/alias plan. Query needs should be measured before a storage-engine change. Presentation graph records remain separate from domain relations.

## ADR-0003: Preserve the App Router and prefer server-rendered composition

- **Status:** Accepted for planning.
- **Context:** The application already uses Next.js 16 App Router, route-level server components, dynamic detail routes, and narrow client islands.
- **Decision:** Keep App Router as the framework during incremental migration; default new route composition to Server Components and isolate browser-only interaction in client components.
- **Rationale:** This matches the current implementation and avoids an unnecessary framework migration.
- **Alternatives considered:** Replace Next.js; convert all routes to client rendering; introduce a separate frontend application.
- **Consequences:** New framework code must follow repository-local Next.js 16 guidance. API/server code and client modules need explicit import boundaries.

## ADR-0004: Keep client persistence behind repositories/adapters and defer remote database choice

- **Status:** Proposed.
- **Context:** `lib/storage.ts` owns localStorage records and `lib/library/repository.ts` owns IndexedDB metadata/blobs. There is no backend database, account system, or sync contract.
- **Decision:** Preserve these adapters. Define future repository interfaces and user-data semantics before selecting a hosted database, ORM, or authentication provider.
- **Rationale:** Account ownership, sync, conflict, export/delete, encryption, and offline requirements are unresolved; choosing technology first would encode unreviewed product behavior.
- **Alternatives considered:** Move all state immediately to a SQL database; add a hosted backend now; retain only local data forever.
- **Consequences:** Local use remains supported. Remote persistence work depends on product decisions, migration/export design, and authorization tests.

## ADR-0005: Keep roadmap, mind map, and Atlas as distinct projections

- **Status:** Accepted for planning.
- **Context:** Domain roadmap edges communicate ordered prerequisites, mind-map edges organize conceptual branches, and `/atlas` derives cross-domain membership and prerequisite exploration.
- **Decision:** Share canonical concept IDs and relation data, but retain separate roadmap/mind-map authored view models and a derived Atlas projection.
- **Rationale:** Shared identity reduces duplication without erasing different user intent or interaction semantics.
- **Alternatives considered:** Use one graph dataset and mode flag for every experience; preserve fully isolated topic copies in each graph.
- **Consequences:** Validation remains graph-specific. View nodes can carry layout/presentation fields but cannot redefine concept metadata.

## ADR-0006: Require an isolated remote judge service for untrusted code

- **Status:** Accepted as a mandatory constraint; service technology is undecided.
- **Context:** Current Practice runs JavaScript public cases in a QuickJS WASM interpreter inside a disposable browser Worker. It is not a hidden-test judge and Submit is disabled.
- **Decision:** Never execute submitted code in a Next.js route or main application server process. Remote execution, if approved, uses a separately operated isolation service behind an authenticated asynchronous judge contract.
- **Rationale:** Application credentials, user data, and server availability must not share a trust boundary with arbitrary code. Hidden tests must remain server-side.
- **Alternatives considered:** Run code in a route, ordinary shared worker, default Docker container, or expose browser tests as a certified online judge.
- **Consequences:** M6 requires independent threat review, sandbox/VM controls, operations ownership, quotas, cancellation, and kill switch before Submit is enabled. Container choice is not predetermined.

## ADR-0007: Keep Library source storage independent from AI ingestion and RAG

- **Status:** Accepted for planning.
- **Context:** Library currently stores browser-local metadata and blobs, extracts bounded text for local preview/search, and never sends files to Gemini. Future AI may use selected Library material.
- **Decision:** Keep original resource, metadata, relations, notes, extraction, and any future derived chunks/embeddings as separate records. Retrieval is optional and requires explicit authorization for data leaving the browser.
- **Rationale:** A Library must remain useful without an AI provider; derived indexes need rebuild/version/privacy policy and must not become the source of truth.
- **Alternatives considered:** Make RAG the Library storage model; automatically upload and embed all user documents; prohibit future AI use entirely.
- **Consequences:** Ingestion has a separate job/status/version boundary. User consent, source selection, deletion propagation, provider retention, and audit policy are prerequisites.

## ADR-0008: Keep authored educational content structured and provenance-aware

- **Status:** Accepted for planning.
- **Context:** `content/` uses typed registries, content blocks, citations, revision metadata, bilingual overlays, and runtime relationship validation.
- **Decision:** Preserve data-driven authored content; extend contracts through validation and migration rather than hard-coding new large content datasets in components or replacing the block system without evidence.
- **Rationale:** Current content is portable, testable, and already supports deep educational slices and locale overlays.
- **Alternatives considered:** Store new content inline in React; switch to arbitrary HTML/MDX without validation; import a third-party curriculum schema wholesale.
- **Consequences:** More entity types require careful schema evolution and authoring tooling. Content completeness/provenance need explicit quality gates.

## ADR-0009: Continue npm and existing quality tooling

- **Status:** Accepted for planning.
- **Context:** `package-lock.json` and npm scripts define the reproducible workflow; TypeScript, ESLint, Vitest, Testing Library, and Next production build are present.
- **Decision:** Continue with this toolchain and avoid dependencies unless a milestone demonstrates a capability gap and maintenance/security value.
- **Rationale:** No build/test constraint currently requires replacement.
- **Alternatives considered:** Change package manager; add a new test or state framework by default; introduce an ORM before database selection.
- **Consequences:** Keep lockfile consistent and run the established checks. New runtime/deployment services still require separate operational evaluation.

## ADR-0010: Preserve bilingual UI and current visual identity during migration

- **Status:** Accepted for planning.
- **Context:** The app has English/Vietnamese message maps, localized content overlays, light/dark themes, a responsive workspace shell, graph/list alternatives, and accessible interaction patterns.
- **Decision:** Treat these as product capabilities and retain them in the target shell and feature migrations unless a reviewed design milestone intentionally changes a specific behavior.
- **Rationale:** The product vision expands information architecture but does not call for discarding recognizable UX or accessibility investment.
- **Alternatives considered:** Redesign every surface before domain migration; defer localization and accessibility until after launch.
- **Consequences:** New route, entity, and state flows need paired messages and theme/responsive/accessibility verification.

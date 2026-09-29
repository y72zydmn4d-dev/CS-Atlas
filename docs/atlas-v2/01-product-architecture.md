# Product Architecture

## Product shape

CS-Atlas is a learning workspace organized around canonical computer-science and AI knowledge. The long-term product has six user-facing capability families: Learn, Practice, Explore, Personal Learning, Atlas AI, and Search. The current app already implements slices of each, but capabilities are not yet backed by a unified Concept identity, user account, remote persistence, or global service layer.

The architecture should make the knowledge path visible across features:

```text
Concept -> lesson/reference -> exercise/problem -> learner evidence
    |             |                |                 |
    +------ roadmap/mind-map/resource projections ---+--> mastery/search/AI context
```

The diagram represents shared references and projections, not a single table or universal graph node. Authored educational records, user evidence, presentation graphs, and Library resources retain distinct lifecycle and ownership.

## Capability boundaries

| Capability | Responsibility | Owns | Must not own |
|---|---|---|---|
| Learn | Structured tutorials, courses, references, examples, and explicitly supported playgrounds | Lessons, ordered course membership, authored blocks, runtime capability declarations | Canonical concept definitions duplicated in every lesson; untrusted execution in app server |
| Practice | Topic exercises and learner feedback workflows | Exercise prompts, hints, rubric, attempts, exercise completion | Online judge infrastructure or secret-test claims unless linked to M6 service |
| Online Judge | Evaluate submissions against private tests in a remote isolated service | Problem versions, submissions, queue state, verdict evidence, judge execution records | Execution in Next.js process; browser-trusted scores |
| Explore | Browse relationships and learning structure | Roadmap views, mind-map views, derived Atlas projection, learning resources | Separate copies of Concept metadata |
| Personal Learning | Keep user-owned resources, notes, collections, goals, study plans, and evidence | Owner-scoped records and local/remote repository adapter | Official authored content or implicit AI training/retrieval permission |
| Atlas AI | Provide bounded, user-requested instructional assistance | Task request, selected context references, provider call, answer/provenance | Implicit Library access, authority over verdict/progress, unreviewed generated content mutation |
| Search | Find visible entities through one query experience | Search document projection and ranking adapters | Bypass visibility/ownership filters or become the canonical entity store |

## Cross-cutting services

- **Identity and authorization:** not present today. Future account work must decide anonymous/local mode, identity provider, record ownership, deletion/export, and server-side authorization. Every remote user-owned read/write is authorized from the session, not a supplied owner ID.
- **Canonical domain:** resolves Concept IDs and typed relations across content and user records.
- **Content delivery:** loads authored, validated public records; future database-backed publishing is a separate decision.
- **Repository adapters:** isolate localStorage/IndexedDB and any later remote store. A feature can support more than one adapter without branching UI rules on storage technology.
- **Background work:** future extraction/index/judge work uses explicit job interfaces and status records. It does not run arbitrary user code inside the Next server.
- **Localization/design system:** English and Vietnamese interface strings remain paired; content locale coverage remains explicit. Shared shell owns theme and navigation behavior.
- **Observability:** future telemetry must minimize personal data and never capture file content, source code, credentials, or prompts by default.

## Data ownership and authority

1. Authored public curriculum, problems, resources, and graph views are maintained by CS-Atlas and have provenance/version review.
2. User Library items, notes, progress, drafts, goals, and study events belong to a learner. Current records reside in that browser and are not a remote score or backup.
3. Judge verdicts become authoritative only when emitted by the isolated Judge service with a verifiable submission/problem/test version. Existing browser Practice is explicitly public-test-only.
4. AI responses are suggestions, not canonical facts, official content, judge results, or mastery evidence unless the learner explicitly takes a separately modeled action.
5. Search indexes and AI chunks/embeddings are rebuildable projections. They cannot silently change authoritative content or user records.

## Interaction principles to preserve

- Keep the current command palette and full search as distinct entry points to the same search service.
- Keep map interaction paired with an accessible list/inspector path.
- Keep Learn content readable and server rendered, with client code limited to interactions.
- Keep Practice language capability honest: an editor/starter is not an execution backend.
- Keep Library privacy explicit at import, preview, and any future AI request boundary.
- Preserve locale/theme persistence, reduced-motion support, visible focus, route continuity, and existing mobile behavior as capabilities migrate.

## Proposed state and migration path

**Current state:** capability modules share content imports and local browser state, with small Next API integrations for Gemini and safe link previews. There is no identity, authorization, persistent server store, job queue, or deployment-level service topology.

**Proposed state:** modular Next application consuming canonical domain/content contracts through services and repositories, plus optional separately operated Judge and provider services. Keep local-first storage available for anonymous and offline workflows. Do not force all capabilities into one service/database where ownership and security differ.

**Migration path:** M1 stabilizes app shell/navigation; M2 creates the domain contract and ID map; M3 adapts graph/search-facing knowledge; M4/M5 migrate Learn and exercise semantics; later milestones introduce service-specific persistence only after ownership and authorization decisions. Existing pages remain compatibility views during transition.

## Cross-capability workflow contracts

- A Concept detail can link to lessons, exercises, problems, resources, graph views, and mastery evidence by canonical IDs.
- A lesson may link to one or more Concepts; lesson ordering is authored course structure and need not equal prerequisite order.
- An Exercise and a judge-backed Problem are distinct task contracts. A coding exercise may refer to a Problem, but does not inherit hidden tests by implication.
- Roadmap membership is a view relation; prerequisite truth is domain relation data. A roadmap may expose only a selected path.
- Mind-map edges are typed conceptual relations and may be non-directional for presentation even if the underlying relation has direction.
- A personal Library item references Concepts without becoming a public Resource. A user may authorize a specific item for an AI request later.
- Search results use the user's visibility scope and point back to canonical records/routes. AI context uses the same authorization and visibility rules as the source feature.

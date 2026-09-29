# Incremental Migration Plan

## Migration goals

Move from current CS-Atlas to the expanded platform while preserving routes, content, browser data, accessibility, and trust boundaries. Migrate semantic identity before storage technology. Establish observable parity and rollback at every user-data or route cutover.

## Current state / proposed state / migration path

| Area | Current state | Proposed state | Migration path |
|---|---|---|---|
| Knowledge identity | Domain/Topic/Algorithm/Technique IDs and cross-links | Canonical Concept IDs plus typed relations | Build mapping/aliases; preserve current registries/routes; switch readers through adapter. |
| Content | Typed topic blocks and static registries | Concepts connected to Lesson/Course/Reference/Exercise | Keep renderer; split identity from lesson payload gradually; parity-test representative slices. |
| Graphs | Domain embeds roadmap/mind-map; Atlas derives another model | Separate authored views over canonical concepts and typed relations | Map references first; classify semantics; migrate one domain/view at a time. |
| Practice | Embedded exercises plus versioned local public-test problems | Separate Exercise and Problem contracts; optional remote Judge | Preserve Worker and local attempts; add problem revisions; design remote service separately. |
| User state | localStorage/IndexedDB, no account | Owner-aware local/remote repositories and evidence | Export/version mappings first; account/sync only after product decision; keep local mode. |
| AI | Public Atlas excerpts to Gemini | Typed, source-authorized task/context orchestration | Preserve public path; add source classes one by one with consent and evaluation. |
| Search | Static in-memory index plus local Library | Canonical searchable projection with scope filtering | Build adapters after IDs settle; compare legacy result parity before cutover. |
| Visual/app shell | Responsive bilingual workspace | Expanded information architecture on familiar shell | M1 changes navigation with route aliases and interaction parity. |

## Migration controls

- Write a mapping artifact for every old ID and route before changing the primary resolver.
- Retain compatibility exports/adapters for at least one complete migration slice and until `rg` import/use audit confirms no consumers.
- For browser data, provide export/recovery; perform idempotent schema migration; never make an irreversible cleanup the first step.
- For authored data, compare entity counts, slugs, relationships, citations, translated fields, content block IDs, and route destinations.
- For graph data, keep view IDs/layout and map only validated knowledge references. Preserve separate roadmap/mind-map intent.
- For APIs, support old client payloads during transition or version them explicitly.
- For remote storage/auth, shadow-read or staged rollout where feasible; test ownership isolation before moving personal data.
- For capability removals, provide deprecation notice, route redirect, state export, and evidence of no remaining usage.

## Sequencing and gates

1. **M0 review:** architecture docs/ADRs accepted; no application changes in M0.
2. **M1 shell:** navigation and route ownership fixed without changing domain IDs.
3. **M2 domain:** concepts/relation vocabulary and ID map validated against all existing data; aliases and compatibility adapters available.
4. **M3 graph:** `/atlas` derives from canonical model with map/list parity; no graph database assumption.
5. **M4/M5 vertical slices:** migrate representative lesson and exercise flows, including Vietnamese, citations, search, progress, and links. Validate before broad conversion.
6. **M6/M7 security gate:** mock contracts and Problem Library may proceed; real remote execution remains gated by threat model, infrastructure ownership, independent review, tests, and kill switch.
7. **M8/M9/M10/M11 data gate:** graph view migration, Library export/relations, progress projection, and identity/sync semantics each include backfill/rollback/owner checks.
8. **M12/M13:** add AI/search sources only after canonical IDs, visibility, consent, and deletion rules exist.
9. **M14 release:** integration, security, performance, accessibility, migration/restore, and operational review for the release scope.

## Rollback strategy

Each migration should have a known source version, destination version, reversible mapping or export, and cutover flag. Rollback must not delete writes made after cutover; where both representations receive writes, define reconciliation before enabling dual-write. Feature flags can disable remote sync, AI source access, search backend, and judge Submit independently. If judge isolation degrades, stop queue admission and mark pending jobs with a service error; never fall back to executing in the web app.

## Deprecation and completion criteria

A legacy path is removable only when canonical mapping coverage is complete, route/data parity tests pass, user data is migrated/exportable, telemetry or static use audit shows no remaining callers, rollback window closes, docs update, and an owner approves. M0 marks future work as planned; later Codex agents must update `TASKS.md` with evidence rather than infer completion from documentation.

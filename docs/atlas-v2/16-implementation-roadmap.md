# Implementation Roadmap

This roadmap is a sequencing guide. `TASKS.md` is the actionable backlog. No M1-M14 implementation is complete as a result of M0 planning.

## Milestone sequence

| Milestone | Outcome | Dependencies | Exit evidence |
|---|---|---|---|
| M0 Repository audit and architecture | Repository facts, architecture contracts, risks, ADRs, dependency plan | Existing repository | Documents reviewed; doc-only diff; no implementation. |
| M1 Atlas Core / app shell / navigation | Coherent capability navigation with preserved current routes | M0 human review | Route map, responsive/accessibility tests, no dead destinations, legacy URL checks. |
| M2 Unified domain model | Canonical Concepts and typed relation vocabulary plus mappings | M1 decisions | Validators, full old-ID mapping, alias/route parity, source/provenance policy. |
| M3 Knowledge Graph foundation | Queries/projections from canonical records | M2 | `/atlas` map/list parity, graph tests, no DB dependency. |
| M4 Learn platform | Course/lesson/reference contracts and migrated learning vertical slice | M2, M3 | Existing deep topics remain readable; new lesson slice linked to Concepts and localized/searchable. |
| M5 Exercise platform | Reusable topic-based exercise workflow distinct from online judge | M2; aligned with M4 | Migrated exercise IDs, hints/status/version tests, no false judge semantics. |
| M6 Online Judge | Secure isolated submission pipeline and supported runtime | M2, M5 plus independent security design/review | Service contract, adversarial isolation evidence, limits/ops/kill switch, submission lifecycle. |
| M7 Problem Library | Searchable, tagged/versioned authored problem collection | M2, M3, M6 contracts | Visibility-safe statements/editorials, concepts links, rating/tags/search tests. |
| M8 Roadmap + Mind Map integration | Both views resolve canonical concepts without semantic conflation | M2, M3 | Separate schemas/validators, old graph parity and route/layout preservation. |
| M9 Personal Library | Durable personal resource boundary and optional sync | M1, M2 | Export/import, schema migration, canonical relation repair, privacy/delete and storage decision. |
| M10 Progress / Mastery / Study Plans | Evidence model and transparent personal planning | M2, M4, M5, M8, M9 | Local migration parity; explicit evidence; mastery policy; plan/goal workflows. |
| M11 Profile | User identity/profile with owner-scoped data | M1, M9 plus identity provider/product decision | Account lifecycle, authorization matrix, export/delete, anonymous migration path. |
| M12 Atlas AI | Typed context-aware tutoring workflows | M2, M4, M5, M9, M10 | Source-level consent/auth, provider controls, evaluation and provenance. |
| M13 Global Search | Unified global search across visible capabilities | M2, M3, M4, M5, M8, M9 | Result parity, filters, owner isolation, multilingual/accessibility and stale-index behavior. |
| M14 Security / Performance / Integration / Release Audit | Evidence-based release readiness | Continuous; final scope includes completed feature milestones | Threat review, performance/accessibility budget, migration/restore rehearsal, full quality checks. |

## Suggested delivery slices

1. **Shell slice (M1):** adjust navigation taxonomy, but retain `/domains`, `/atlas`, `/practice`, `/library`, etc. as reachable routes. Keep current locale/theme providers and command search.
2. **Concept slice (M2):** begin with existing Topics as candidate Concepts. Map every prerequisite/related link and external algorithm/technique reference. Implement compatibility lookup before moving data.
3. **Atlas slice (M3):** adapt `/atlas` to query Concepts/relations. Verify all currently visible nodes/edges and list interactions. Do not rewrite roadmap/mind-map content in the same change.
4. **Learn + Exercise slice (M4/M5):** migrate one representative deep topic and its exercises, preserving citations, block rendering, locale labels, keyboard behavior, progress IDs and search destination.
5. **Judge design slice (M6):** contract and mock submission lifecycle first. Keep Submit disabled until separately operated isolation and review are real.
6. **Personal data slice (M9/M10/M11):** settle account/sync choice after export and ownership design; if sync is not ready, local-first functionality remains complete and explicit.
7. **AI/Search slices (M12/M13):** add context and indexed entity types incrementally after IDs, privacy scope and deletion/version behavior are stable.

## Cross-milestone sequencing notes

- M6 and M7 can agree on the Problem schema before a real Judge service exists; M7 must not claim that a browser runner is online judging.
- M8 depends on canonical concepts and relation semantics. It preserves graph layouts and separate intent, not one universal graph.
- M11 is intentionally downstream of Library data ownership; account work without migration/export semantics risks stranding current browser data.
- M12 may reuse the current Gemini adapter before RAG. Library context stays separately authorized.
- M13 comes after visibility and IDs, but the existing palette and local search remain useful during migration.
- M14 work is continuous, though the release audit is last for each release scope.

## Release discipline

Each milestone should have one or more vertical slices, documented acceptance criteria, migrations/redirects, tests, a rollback switch where applicable, and an update to `docs/STATUS.md` when product capability materially changes. Avoid a single launch branch that accumulates multiple unfinished data migrations.

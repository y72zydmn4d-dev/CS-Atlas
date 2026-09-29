# Domain Model

## Modeling rules

- A **Concept** is the canonical knowledge unit, such as Binary Search, Relational Model, or Gradient Descent. It is not a React Flow node, page, lesson, or user progress record.
- Every cross-feature relationship uses a stable entity type and ID. Labels, URLs, locale strings, and layout coordinates are presentation data and can change.
- Authored content, user-generated content, derived indexes, and execution evidence have separate ownership and version lifecycles.
- A relation record expresses one typed semantic fact. It must not be inferred from visual adjacency unless a defined migration explicitly maps that adjacency to the relation.

## Proposed core entities

| Entity | Key fields (conceptual) | Owner / lifecycle |
|---|---|---|
| `Concept` | `id`, `slug`, aliases, localized labels/descriptions, kind/scope, status, provenance, schema/content version | Atlas-authored; stable identity, reviewed content revisions |
| `ConceptRelation` | `id`, `sourceConceptId`, `targetConceptId`, `type`, direction, optional context/provenance/weight | Atlas-authored or reviewed import; validated endpoints and semantics |
| `Lesson` | `id`, title/summary by locale, objectives, block payload/version, source/citations, concept links, maturity | Authored curriculum |
| `Course` / `CourseItem` | course identity/metadata; ordered typed membership (lesson/reference/assessment), optional track | Authored learning sequence |
| `Reference` | `id`, kind, metadata/locales, body or external location, citations, concept links | Public authored reference |
| `Exercise` | `id`, version, mode, prompt, hints, answer/feedback contract, rubric, concept/lesson links | Authored practice, no hidden judge semantics by default |
| `Problem` | `id`, version, statement/constraints, tags, rating/difficulty, languages, public/hidden test suite references, editorial/solution visibility, concept links | Judge/problem authoring; immutable version per contract |
| `Resource` | public resource metadata, URL/source/citation, concept links | Authored/shared public resource |
| `Roadmap` / `RoadmapNode` | roadmap identity/scope; node ID, concept reference or structural node, coordinates/order/metadata; typed view edges | Authored learning view; does not define canonical prerequisite truth |
| `MindMap` / `MindMapNode` | view identity; concept or structural node reference, layout/label overrides; typed display edges | Authored conceptual view |
| `LibraryItem` | stable item ID, owner ID if synced, local metadata, original file reference or URL, extraction state/version, tags/notes | User-owned private record |
| `LibraryRelation` | item ID, canonical entity type/ID, relation purpose | User-owned association; unresolved IDs may be retained and repaired |
| `LearningEvent` | owner, event type, entity reference, event time, source/version, safe metadata | User evidence, append-only where useful |
| `UserMastery` | owner + concept, estimate/state, evidence window, confidence/model version, user override | Derived/user-correctable, never authored truth |
| `StudyPlan` / `Goal` | owner, selected concepts/content, schedule/timezone, target, status | User-owned |
| `SearchDocument` | canonical target, locale text, hierarchy, visibility, source version | Derived/rebuildable index projection |
| `AIContextReference` | source type/ID/version, selected excerpt policy, user consent/action reference | Ephemeral or retention-limited; no implicit Library content |

## Existing-to-target mapping

| Existing record | Proposed treatment |
|---|---|
| `Domain` | Keep as a navigable subject/collection during transition; link it to a domain/field concept or scope. Do not force it to mean one lesson or one graph. |
| `Topic` | Primary source for initial Concept IDs and authored topic lesson payload. Separate canonical concept metadata from lesson delivery over time. Preserve topic slug as alias/route. |
| `Algorithm` | Map to a Concept where it is a knowledge entity; retain algorithm-specific implementation/complexity fields in a specialized reference/algorithm record. |
| `Technique` | Map to Concept plus a reusable pattern/reference payload as appropriate. |
| `Project` | Map to project/activity record linked to concepts; do not automatically treat it as a Concept. |
| `Resource` | Promote to a public Resource record with source/provenance and Concept links; distinct from user's Library item. |
| `GraphNode/GraphEdge` | Convert concept-linked nodes to view-node references. Preserve structural nodes and layout. Do not convert every edge to a ConceptRelation without semantic classification. |
| `ExerciseBlock` | Migrate to versioned Exercise after resolving embedded solution/hint visibility and status IDs. |
| `PracticeProblem` | Keep as Problem-like judge contract; preserve ID/version/public cases and language availability. Map knowledge links to canonical concepts. |
| local progress keys | Preserve local data and map current topic IDs to concept IDs. Keep a reversible migration/export fixture. |
| Library relation | Preserve item and relation; map entity IDs and retain an unresolved/legacy reference if no canonical match. |

## IDs, aliases, and versions

Use opaque stable IDs or existing stable slug IDs while compatibility is needed. Prefer a clear prefix/namespacing policy only if it helps prevent collisions across entity types; do not change current IDs casually. Slugs are routes and aliases, not primary identity. Maintain an alias table for former IDs, slugs, and localized names. Public route redirects should be generated from canonical mappings.

Distinguish schema version (shape/migration) from authored content version (meaning/contract changed). Practice's existing `version` must increase when tests/contracts change. Lesson/resource revisions should record source and review state. Derived search/embedding records carry source version and can be rebuilt.

## Relation vocabulary and semantics

At minimum, define direction and validation for:

| Type | Directional meaning | Validation |
|---|---|---|
| `PREREQUISITE_OF` | source knowledge is a prerequisite for target | concept endpoints; acyclic within intended prerequisite scope; inverse queries may be derived |
| `RELATED_TO` | concepts are related without a required order | symmetric by rule or normalized pair; no self-link |
| `PART_OF` | source is contained by target (choose one direction consistently) | hierarchy rules; cycles forbidden |
| `USES` | source concept/process uses target concept/tool | directed; cycles allowed only if domain semantics allow |
| `BUILDS_ON` | source extends target; document whether direction is “builds-on -> base” | directed; may overlap prerequisite but is not identical |
| `NEXT_TOPIC` | source is a suggested next step after target (direction contract must be explicit) | guidance relation, not proof of prerequisite |

Add `relationVersion`, provenance, author/reviewer, confidence, and context only where they support content governance. Avoid one free-form `relatedIds` array as the target contract.

## Validation and deletion

Validate endpoints and entity types at every import/write boundary. Distinguish hard invalid references from historical user references that should remain visible and repairable. Canonical Concept deletion should generally transition to deprecated/merged with alias/redirect rather than cascade-delete lessons, graph nodes, Library links, or user evidence. Merge requires an explicit source-to-target mapping and conflict policy.

## Migration approach

**Current state:** `Topic` carries both knowledge identity and lesson-like payload; `Domain` embeds view graphs; other entity IDs coexist and links are heterogeneous.

**Proposed state:** canonical Concept and relation records are referenced by separate curriculum, practice, graph-view, resource, and user-owned records.

**Migration path:** seed concepts from topics first; map adjacent algorithms/techniques intentionally; produce a checked mapping file and aliases; read old records through adapters; compare counts/links/routes/progress; migrate one domain slice at a time. Do not write the target store as the only source until rollback/export tests pass.

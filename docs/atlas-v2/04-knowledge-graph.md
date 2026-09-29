# Knowledge Graph Architecture

## Purpose

The knowledge graph is a domain relation model and query capability over canonical Concepts. It is not a commitment to a graph database, a graph UI, or one universal graph dataset. It connects concepts to authored records and learner-facing projections through stable IDs.

## Relation layer

Start with typed `ConceptRelation` records with stable endpoints, direction, type, and provenance. Initial required types are `PREREQUISITE_OF`, `RELATED_TO`, `PART_OF`, `USES`, `BUILDS_ON`, and `NEXT_TOPIC`. Each relation type has documented direction, symmetry, cycle, and lifecycle semantics. Use ordinary relational rows, typed content records, or in-memory registries initially; derive adjacency maps for reads.

Do not conflate:

- canonical semantic relationships between concepts;
- authored learning order within a course/roadmap;
- visual graph layout edges;
- graph selection/highlighting state;
- progress/mastery overlay state.

## Views over the model

- **`/atlas`:** derived exploration projection. It can show Concept membership, prerequisite relations, and related links across scope. Keep current filters/search/inspector/map-list pattern. It should not create or persist canonical relations from user interaction.
- **Roadmap:** authored sequence/path with learning intent. Nodes may include structural group/assessment nodes. Concept relations can validate ordering, but roadmap order remains a curated view and can select a subset of the full graph.
- **Mind map:** authored conceptual grouping and association view. It may include non-concept structural nodes; edges are not automatically prerequisites.
- **Search/navigation:** query and link to canonical concepts and their related authored/user records rather than embedding graph copies in results.

Each view record owns layout coordinates, labels/overrides, grouping, ordering, visibility, and presentation metadata. A view node stores a reference to a concept ID when applicable. Concept changes resolve through canonical data; no independent duplicate title/URL becomes authoritative.

## Query interface

Keep the first service small and bounded:

```ts
interface KnowledgeGraphService {
  getConcept(id: ConceptId): Promise<Concept | null>;
  listRelations(input: { conceptId: ConceptId; types?: RelationType[]; direction?: "in" | "out" | "both"; limit?: number }): Promise<ConceptRelation[]>;
  getNeighborhood(input: { conceptId: ConceptId; types?: RelationType[]; depth: 1 | 2; limit: number }): Promise<GraphProjection>;
  validateRelations(relations: ConceptRelation[]): Promise<ValidationIssue[]>;
}
```

The implementation may be synchronous/in-memory for authored content. The boundary is useful for consistency and a later repository adapter, not a reason to create an elaborate query language. Default depth/limits must prevent unbounded traversal. Apply visibility and authorization before returning user-owned related data.

## Validation

- Every endpoint resolves to a current concept or an explicitly retained deprecated/alias record.
- IDs and relation record IDs are unique; self-relations are rejected unless a future relation type explicitly allows them.
- `PREREQUISITE_OF` and `PART_OF` obey declared acyclic rules; do not impose acyclicity on all relation types.
- Duplicate relation policy is defined by type and context/provenance, rather than silently collapsing potentially meaningful records.
- Localization is stored on concepts/content, not relation endpoints.
- Relations created from imported data carry provenance and review status; they are not trusted as curated edges automatically.
- Existing roadmap validation remains a view-order check; it must not be reinterpreted as a complete graph validation.

## Storage choice

The repository has no database today. The first implementation should keep graph data in existing authored registries and simple indexes/maps. If remote persistence is later needed, relational edge rows with endpoint foreign keys and indexes are a reasonable initial candidate; evaluate actual neighborhood depth, write patterns, scale, and operational cost before selecting storage. A graph database is not required by the product vision.

## Migration

**Current state:** topics expose `prerequisiteIds` and `relatedTopicIds`; domains embed separate roadmap and mind-map data; `/atlas` derives membership/prerequisite links with namespaced IDs; graph layout is authored and deterministic.

**Proposed state:** prerequisite and related relations are canonical typed records; roadmaps/mind maps remain independent view models; `/atlas` becomes a projection over Concepts and relations.

**Migration path:** create a relation mapping table from current prerequisites first; classify `relatedTopicIds` and graph edges individually; map view nodes to concept IDs while retaining structural IDs/coordinates; run old/new graph parity and navigation tests; switch `/atlas` adapter; then migrate one roadmap/mind-map domain slice at a time.

## Risks

The main risks are incorrectly interpreting display edges as semantics, cycles introduced by merges, unstable IDs, cross-domain duplicate topics, exploding neighborhood queries, exposing private Library/progress relations in public views, and a premature graph-store migration. M2 relation definitions and M3 projection tests are release gates for graph-backed features.

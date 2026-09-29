# Search Architecture

## Current behavior

`content/index.ts` builds a static in-memory `SearchResult[]` containing domains, topics, embedded topic exercises, practice problems, algorithms, techniques, projects, and sources. It joins hierarchy and bilingual metadata, with some serialized topic block text. `lib/search.ts` normalizes lower-case text, Vietnamese diacritics/đ, requires all query terms, and ranks title exact/prefix/substring matches. The shell command palette and `/search` page share the same search function. Both append Library metadata/extracted text results loaded from local IndexedDB. Atlas also has a focused node search implemented in `lib/atlas-model.ts`.

There is no remote index, account-aware filter, semantic/vector search, command registry beyond content entities, or formal search analytics. Indexing all serialized lesson blocks can grow static bundle/memory and expose content that may not need to ship to each interactive client.

## Target search document

Use a derived record with:

- canonical target `entityType`, `entityId`, route/href, and source revision;
- localized title, aliases, summary, keywords and hierarchy;
- visibility (`public`, owner-scoped private, or other explicit policy);
- optional facets (domain/concept, difficulty, language, tags, content kind);
- snippets/provenance references, not duplicated authoritative content;
- indexing timestamp/schema version for rebuild and stale detection.

Sources include Concept, Lesson, Reference/Resource, Exercise, Problem, Roadmap/MindMap view, and owner-authorized Library metadata. Avoid indexing full Library body into a public/global index. User access filtering happens before results/snippets are returned.

## Service boundary

```ts
interface SearchService {
  search(input: { query: string; locale: Locale; scope: SearchScope; filters?: SearchFilters; limit: number }, principal: Principal): Promise<SearchPage>;
  suggest(input: { prefix: string; locale: Locale; limit: number }, principal: Principal): Promise<SearchResult[]>;
}
```

The current local registry matcher is a valid adapter for small public content. Keep accent normalization and deterministic ranking in the compatibility phase. The service owns matching/ranking and visibility; the palette owns keyboard selection/navigation; `/search` owns browse-oriented result presentation.

## Ranking and interaction

Rank exact canonical title/alias, title prefix, localized title, concept match, summary/keyword, hierarchy, and recency/popularity only if the signal is transparent and privacy-reviewed. Provide filters for entity type, domain/concept, difficulty, language, and problem tags as data grows. Do not use opaque personalization before user permission/model explanation.

Command palette requirements: keyboard open/close, focus restore, arrow navigation, Enter navigation, screen-reader result count/selection, loading/empty/error state, locale-aware labels, mobile-sized dialog. Search page supports a bounded larger result list and stable link semantics. Library results must be visually/private-scope identifiable without leaking data across accounts.

## Search engine choice

No external search engine is installed or required. Begin with current in-memory static search and user-local Library search. Measure corpus size, update frequency, latency, facets and multilingual quality. Evaluate database full-text capabilities before adding a dedicated service. Semantic search requires a separate embedding/index privacy, cost, deletion, and consent decision; it is not a default consequence of global search.

## Migration path

**Current state:** static registry index plus browser Library results; matching is synchronous and in-memory.

**Proposed state:** one query contract over canonical public and authorized personal entities; rebuildable projections with filters and optional future semantic adapter.

**Migration path:** M2 stabilizes IDs; M3 provides graph/Concept relations; M4/M5/M8/M9 expose document adapters; replace monolithic index construction with projection builders; compare legacy and new result sets for every entity type/locale; add auth filters before any remote/private index. Retain legacy command paths and aliases through cutover.

## Implemented local projection

`lib/search/documents.ts` now wraps public registry and browser-local Library results in schema-versioned documents containing canonical identity, entity type, visibility, source version, hierarchy, locale fields, destination, and an explicit local-browser owner scope for private metadata. Both the command palette and `/search` filter visibility before invoking the existing accent-insensitive deterministic matcher. Tests compare public ranking with the legacy adapter and reject stale versions, duplicate records, unsafe destinations, and invalid private ownership. The corpus remains small and rebuildable, so a database full-text or dedicated search service would add operational cost without a measured query need; semantic search remains separately gated on privacy, deletion, consent, and cost.

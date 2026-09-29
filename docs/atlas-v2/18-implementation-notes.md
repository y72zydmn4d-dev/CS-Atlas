# Initial Implementation Notes

**Scope:** initial CS-Atlas 2.0 migration slice on `atlas-v2`.

## Route and browser-state compatibility

All original URLs remain active. New additive entry points are `/learn`, `/learn/[lesson]`, `/concepts/[concept]`, `/exercises`, `/problems`, `/problems/[problem]`, `/explore`, and `/profile`. Existing `/topics`, `/algorithms`, `/techniques`, `/practice`, `/atlas`, `/roadmaps`, `/mind-maps`, `/library`, `/progress`, `/bookmarks`, `/settings`, and `/assistant` routes are retained without redirect or removal.

Existing localStorage and IndexedDB records remain unchanged. `cs-atlas.learning-events.v1` is a new, additive localStorage record containing at most 500 validated local evidence events. It does not migrate, delete, or reinterpret existing progress, Practice, Library, theme, locale, or sidebar data.

## Canonical identity mapping

- Topics use `topic:<legacy-id>`.
- Algorithms use `algorithm:<legacy-id>`.
- Techniques use `technique:<legacy-id>`.

Canonical URLs use type-qualified slugs, for example `/concepts/topic-arrays` and `/concepts/algorithm-binary-search`. This deliberately keeps the Algorithm and Technique records named `two-pointers` distinct. Old ambiguous IDs are resolved only by source-aware compatibility adapters and are never canonical identity.

`content/concepts/legacy-map.ts` is the checked migration artifact for every Topic, Algorithm, and Technique ID/slug. It records preserved legacy routes, canonical destinations, and raw-ID collisions. Parity tests require complete one-to-one source coverage and validate authored citations, graph references, Exercise links, Problem links, and both route forms.

Topics seed Lesson records, embedded blocks seed version-one Exercise records, and current Practice definitions seed public-only Problem records. The roadmap and mind-map adapter adds concept references without changing its authored layout or edge semantics.

## Security and availability boundary

QuickJS remains a browser-only public-test runner. `UnavailableJudgeClient` records an unavailable mock lifecycle and never evaluates code. No remote Judge API, hidden tests, authentication, remote persistence, or sandbox service is enabled.

Atlas AI accepts an explicit selected public Concept. Library files, extracted text, progress, bookmarks, hidden tests, and reference solutions remain excluded from AI context.

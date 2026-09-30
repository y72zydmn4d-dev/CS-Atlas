# Target Directory Structure

## Guideline

This is a target ownership map, not an instruction to move files during M0. Keep the current top-level layout while introducing the canonical domain and feature boundaries incrementally. Avoid empty directory creation and broad rename churn. M2 must settle names and entity ownership before large movement.

```text
app/
  (workspace)/...              route groups only if they improve shared layout ownership
  api/<capability>/<action>/   thin, validated HTTP adapters
components/
  shell/                       app shell and navigation (current app-shell may migrate here)
  learn/                       lesson/course/reference views
  practice/                    exercise and problem UI (current practice/ preserved)
  explore/                      Atlas, roadmap, and mind-map views
  library/                      user Library UI
  search/                       command palette and result views
  ai/                           assistant/task surfaces
  shared/                       truly cross-feature presentation primitives
content/
  concepts/                     authored canonical concept registry or generated data
  learn/                        subject manifests, structured lessons, examples, references and quizzes
  lessons/                      structured lesson/course payloads
  problems/                     authored public problem metadata and server-only references
  resources/                    public resource registry/provenance
  roadmaps/                     authored roadmap views referencing concept IDs
  mind-maps/                    authored mind-map views referencing concept IDs
  translations/                 localized authored content overlays
domain/
  concepts/                     Concept, relation types, validators, ID/alias rules
  learn/                         lesson/course domain contracts and rules
  practice/                      exercise/problem domain contracts
  library/                       user resource metadata contracts (no storage SDK)
  learning/                      progress, evidence, goals, and mastery contracts
  search/                        search projection/query contracts
services/
  concepts/                       graph/query use cases
  learn/                          lesson/curriculum use cases
  practice/                       exercise and submission orchestration
  library/                        import/search/export use cases
  ai/                             context assembly and provider orchestration
  search/                         indexing/query use cases
repositories/
  browser/                        adapters for localStorage and IndexedDB
  remote/                         only after account/database decision
  providers/                      Gemini/search/judge HTTP adapters
lib/
  current compatibility modules during migration; promote by ownership gradually
i18n/
tests/
  unit/ integration/ fixtures/ (only split if current tests volume warrants it)
docs/
  atlas-v2/                       architecture, migration and subsystem contracts
```

## Current-to-target ownership

| Current path | Target ownership | Migration rule |
|---|---|---|
| `lib/types.ts` | focused domain contracts and compatibility exports | Split only as types migrate; keep current imports compiling during a slice. |
| `content/index.ts` | registry exports, validators, and search projection as separate concerns | Avoid moving all registries at once; tests define public contract. |
| `content/domains.ts`, `content/topics.ts` | concepts plus lessons/course views, with aliases | Map stable IDs first; preserve route and progress identifiers. |
| `lib/atlas-model.ts`, `lib/graph.ts` | graph projection/query and view-specific helpers | Keep roadmaps/mind maps/Atlas separate in ownership and validation. |
| `components/atlas`, `components/graph-explorer.tsx` | `components/explore/` subfeatures | Relocation is optional; preserve accessible list behavior. |
| `lib/storage.ts`, `lib/library/repository.ts` | explicit browser repository adapters | They remain the only direct localStorage/IndexedDB owners. |
| `lib/practice/*`, `content/practice/*` | exercise contract vs judge/problem adapter | Keep `references.server.ts` server-only and Worker execution path intact. |
| `lib/ai/*`, `/api/ai/ask` | AI context/use case/provider boundary | Do not broaden context sources without consent/auth policy. |
| `lib/search.ts`, `content/index.ts` | search service and document projection | Search is a projection, not canonical content ownership. |

## Naming and dependency rules

- Feature directories use nouns matching product capabilities. Domain rules do not import React/Next/vendor SDKs.
- UI imports feature use cases/contracts; UI does not import persistence internals. Route handlers import application services, not repositories directly except through a use case boundary.
- Server-only modules use explicit marker/import boundary. Client components must not depend on server-only references or secret configuration.
- Keep static authored registries colocated by content type; do not make one giant `index.ts` the source of every behavior.
- Keep test fixtures representative and sanitized. Never check in real private documents, credentials, or learner submissions.

## Migration path

**Current state:** `lib/` contains domain logic and adapters together; components are mostly feature-prefixed at the root; registries are grouped in `content/`.

**Proposed state:** ownership by domain/use case/adapter becomes clearer while preserving Next route conventions and current feature styles.

**Migration path:** add M2 contracts without moving current modules; introduce compatibility exports; move a module only when its callers and tests can update atomically; remove compatibility files only after `rg` import audit, full checks, and a documented deprecation window.

## Initial implemented ownership

The first v2 slice introduces `lib/domain/` for pure canonical contracts, `lib/concepts/` for graph reads, `lib/judge/` for the non-executing Judge adapter, `content/concepts/` plus lesson/exercise/problem adapters, and focused feature components/routes under `components/` and `app/`. Existing root-level feature modules remain in place during compatibility migration. No persistence repository or generated Practice artifact moved.

The Learn v2 slice adds `lib/domain/learn-platform.ts` for manifest/content contracts, `content/learn/` for authored Learn records, `components/learn/` for catalog/subject/workspace renderers, and manifest-derived routes below `app/learn/[subject]/`. These records reference canonical Concepts and shared Exercise/Problem registries; they are not a parallel knowledge graph.

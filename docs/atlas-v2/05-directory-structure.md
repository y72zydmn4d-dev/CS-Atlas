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

Studio Milestone A adds `app/studio/` (guarded read-only Server Component and scoped CSS), `components/studio/` (inspection shell + filtering/localization islands), `lib/studio/` (server-only guarded readers/loaders and canonical-derived DTOs), paired `i18n/messages/studio.ts`, `tests/studio-*` and GET-only `scripts/audit-studio.mjs`. Root `proxy.ts` matches only `/studio/:path*` to hard404 disabled requests before the shared loading boundary; route/readers enforce the guard independently. RouteShell passes exact /studio through without eager learner/Search services; Studio reuses root theme/locale and existing LanguageSwitcher. Existing learner paths/providers remain unchanged. No Studio capability/nav entry, API, action, content migration, new persistence or writer. See `docs/authoring-studio/02-security-boundary.md`.

Studio B extends this same boundary: pure `lib/studio/draft.ts` canonical-record cloning/candidate conversion/comparison/block helpers; Studio-only document-navigation adapter; narrow client draft session, metadata/objectives/block/table editors and native discard modal. Server workspace still composes canonical read-only details and selected server payload; no client registry/I/O imports. Guarded native Studio links preserve dirty document-navigation warnings without learner-router changes. No content/schema/storage/route-guard migration or mutation implementation.

Studio C adds `lib/studio/relationships.ts` (projection/transport contract), `relationships.server.ts` (guarded literal registry reads), `relationship-client.ts` (typed GET-only adapter), `app/api/studio/relationships/[kind]/route.ts` (independent dev+flag guard, bounded closed resource union), and compact client relationship pickers. Selections remain canonical IDs in existing transient draft fields; projected display metadata is never persisted. No registry mutation, body-loading change, content migration or writer.

The first v2 slice introduces `lib/domain/` for pure canonical contracts, `lib/concepts/` for graph reads, `lib/judge/` for the non-executing Judge adapter, `content/concepts/` plus lesson/exercise/problem adapters, and focused feature components/routes under `components/` and `app/`. Existing root-level feature modules remain in place during compatibility migration. No persistence repository or generated Practice artifact moved.

The Learn v2 slice adds `lib/domain/learn-platform.ts` for manifest/content contracts, `content/learn/` for authored Learn records, `components/learn/` for catalog/subject/workspace renderers, and manifest-derived routes below `app/learn/[subject]/`. These records reference canonical Concepts and shared Exercise/Problem registries; they are not a parallel knowledge graph.

The public-entry slice adds `components/landing/` for public presentation, `content/landing/knowledge-preview.ts` for editorial coordinates/canonical relation selectors only, and `lib/concepts/landing-projection.ts` for the bounded pure projection. `components/route-shell.tsx` separates public `/` from SSR-capable workspace provider composition; `app/home/page.tsx` mounts the one extracted `components/home/workspace-home-page.tsx`. No other routes moved. `lib/storage/preferences.ts` is a lightweight leaf of the existing browser storage adapter, re-composed into `lib/storage.ts`; it preserves the theme/locale keys and keeps full learning migrations out of public providers. `scripts/audit-public-entry.mjs` performs local-only GET/asset smoke checks; it is not browser automation.

Studio D adds pure `lib/domain/learn-validation/` (strict canonical candidate parser, metadata/blocks/relationships/curriculum/status rules and diagnostic contracts) shared by the existing Learn build validator. Owning `lib/types.ts` exposes runtime values for existing difficulty/translation enums without changing the types. `lib/studio/validation*.ts` owns server-only context/Origin/bounded body adapters, typed transport and the independently guarded computational POST `/api/studio/validation`; `LessonValidation` owns client report/staleness only. No schema/storage migration, writer or Preview. Active-draft validation does not scan all lesson bodies.

Studio E adds shared `components/learn/lesson-content-surface.tsx` and `learn-render-environment.tsx`, the existing block/Example renderer and copy-only leaf reused by learner routes and author preview. `lib/domain/learn-rendering.ts` owns canonical presentation projections; `lib/learn/render-resources.server.ts` selects public resources for normal Learn routes. `learn-validation/renderability.ts` is the shared fail-closed preview eligibility policy (all ERRORs still block persistence). `lib/studio/preview{,.server,-client}.ts` and `/api/studio/preview` prepare exact validated transient models with no writes; D/E share guarded request parsing. Studio preview chrome/error boundary owns only mode/request/fingerprint state; learner evidence/bookmark/runtime services remain outside the preview graph. No content/schema/storage migration or dependency; see Studio05.

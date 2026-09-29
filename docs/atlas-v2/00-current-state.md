# Current State Audit

**Audit scope:** the tracked application, tests, configuration, scripts, and current planning docs on branch `atlas-v2`. This document describes what the repository implements, not the future product. No dependency installation or application source changes are part of M0.

## Repository and toolchain

- Package manager: npm, evidenced by `package-lock.json` and npm scripts. The repository also has local `node_modules`; it was not installed or modified for this audit.
- Application framework: Next.js App Router, declared `^16.3.6`; React and React DOM `^19.3.0`; TypeScript `^5.9.3`, strict mode.
- Styling/build: Tailwind CSS 4 through PostCSS plus substantial hand-authored CSS in `app/globals.css`, `app/workspace.css`, and `app/practice.css`. Next builds with Webpack explicitly. Scripts prepare the locally served QuickJS loader and isolate local production output from development output.
- Quality tools: ESLint 9 with Next core-web-vitals and TypeScript config; Vitest 4, jsdom, Testing Library, and fake-indexeddb. Scripts provide lint, strict typecheck, tests, and production build.
- Significant runtime dependencies: React Flow, idb, Mammoth, PDF.js, QuickJS WASM. Lucide provides icons. `server-only` marks server-only modules.
- TypeScript uses `@/*` mapped to the repository root, `strict: true`, `noEmit`, bundler module resolution, and Next plugin. ESLint ignores generated build output and the copied Practice runtime.

## Important directory map

```text
app/                         App Router routes, root layout, API handlers, feature CSS
  api/ai/ask/                Gemini public Atlas Q&A endpoint
  api/library/link-preview/  bounded public URL metadata fetch endpoint
  api/practice/feedback/     optional Gemini feedback endpoint
  atlas/, domains/, topics/  exploration, authored curricula, and topic reading routes
  practice/, library/        local exercise runner and local document library routes
components/                  shell, content views, graph canvases, Practice, Library, AI, search
  atlas/, practice/, library/, home/ feature-specific client/server UI modules
content/                     domain/topic/algorithm/technique/project/source registries and translations
  practice/                  versioned problems and server-only reference solutions
hooks/                       browser interaction and repository hooks
i18n/                        locale configuration, typed message maps, content overlays
lib/                          search, progress, storage, graph models, AI, Practice, Library services
public/                       favicon, author image, retained background images, runtime assets
scripts/                      Practice runtime preparation and build preparation
tests/                        unit/component/integration tests and fixtures
docs/                         product, architecture, status, and M0 architecture plan
types/                         browser module declarations
```

Important current files include `lib/types.ts`, `content/index.ts`, `content/domains.ts`, `content/topics.ts`, `lib/atlas-model.ts`, `lib/graph.ts`, `lib/storage.ts`, `lib/library/repository.ts`, `lib/practice/runner.ts`, and the server API routes. `.next/` and `.next-production/` are generated and are not source. `.env.local` exists locally and is ignored; its contents are intentionally outside this audit. `.env.example` documents the server-only Gemini key and optional model setting.

## Routes and rendering

The root `app/layout.tsx` installs the global CSS, theme/locale/Atlas providers, ambient background, and application shell. The main route inventory is:

| Route | Current responsibility |
|---|---|
| `/` | Workspace home, deterministic next-topic recommendation, local progress/bookmarks |
| `/domains`, `/domains/[domain]` | Domain catalog and overview |
| `/domains/[domain]/syllabus` | Authored module ordering |
| `/domains/[domain]/roadmap` | Authored prerequisite/learning sequence graph |
| `/domains/[domain]/mindmap` | Authored conceptual-organization graph |
| `/atlas` | Derived cross-domain membership/prerequisite exploration with map/list |
| `/topics/[topic]` | Typed block-based educational material |
| `/algorithms`, `/algorithms/[algorithm]` | Algorithm encyclopedia and visualizers |
| `/techniques`, `/techniques/[technique]`, `/projects` | Reusable patterns and project catalog |
| `/practice`, `/practice/[problem]` | Bilingual problem catalog/editor and local public-case execution |
| `/progress`, `/bookmarks`, `/settings` | Browser-local learning state and preferences |
| `/library`, `/library/import`, `/library/[item]` | Browser-local documents/links, import, reading, metadata |
| `/assistant` | Optional public-content Gemini Q&A |
| `/search` | Search page; global palette is in the shell |
| `/api/ai/ask` | Server-side Gemini question answering over public Atlas excerpts |
| `/api/practice/feedback` | Explicitly requested Gemini hint over learner-submitted code/context |
| `/api/library/link-preview` | Bounded server-side public-URL HTML metadata fetch |

Most page modules are Server Components that resolve registry data and compose views. Client islands handle graph canvases, selection, browser state, editors, Library repository interaction, search palette, and locale/theme controls. Dynamic detail routes resolve by slug and use `notFound()` where implemented; authored static params exist for domain and algorithm detail routes. The pages are not organized under route groups or a separate backend service.

## Components, visual identity, responsive behavior

Reusable components cover the AppShell/sidebar/mobile drawer, page headers/breadcrumbs/domain tabs, typed content blocks, catalog/card patterns, graph explorers, Atlas canvas/inspector/list, Practice catalog/workspace/progress, Library list/import/detail/reader/entity picker, assistant, search, progress, visualizers, theme/locale providers, and translation selection.

The product identity is a restrained technical learning workspace: compact navigation and command search; light and dark surfaces; indigo/violet accent in foundational styles, with semantic tokens in the newer workspace layer; restrained grid/topology atmosphere; monospace for code/metadata; Lucide icons; compact cards and content panels. The home includes a local author portrait/footer. Older dark topology AVIF/WebP assets are retained but the current ambient component uses CSS grid/masks rather than loading them. Do not treat the retained image assets as proof that they are live visual dependencies.

`app/workspace.css` is the newer semantic product-surface layer; `globals.css` remains a broad legacy/feature stylesheet and still contains feature-specific Library/assistant/graph styling. `practice.css` owns Practice workspace rules. This layered CSS history is useful to preserve but creates token/style duplication that future visual work should inventory before consolidating. Responsive breakpoints include roughly 1200/1050/900/650px, with mobile navigation, graph details in normal flow, list fallback, Library single-column reading metadata, and 44px Practice controls. Reduced-motion rules exist in CSS and graph camera behavior. English/Vietnamese and light/dark modes are supported.

## State and data ownership

- Authored public content: typed registries in `content/` plus Vietnamese overlays and typed message maps under `i18n/`.
- User progress/preferences: `lib/storage.ts` wraps versioned localStorage keys for progress, bookmarks, exercise status, Practice attempts/drafts/completions, locale/theme, and shell preferences. `AtlasProvider` exposes progress/bookmark/exercise actions. This is device/browser-local and editable by the user.
- Library: `lib/library/repository.ts` is the only IndexedDB owner. It stores versioned metadata in an `items` store and binary `Blob`s in `files`; `lib/library/types.ts` defines the repository contract. Browser components consume it through hooks/repository calls. Extraction and preview are separate modules.
- Graph view state: React component state and React Flow, with authored coordinates. `/atlas` derives nodes and edges in `lib/atlas-model.ts` from domain membership/topic prerequisite data.
- Search: `content/index.ts` builds an in-memory flattened index from static registries. `lib/search.ts` normalizes diacritics and ranks term matches. Library items are loaded from IndexedDB and appended locally at runtime.
- AI: `lib/ai/context.ts` builds public Atlas excerpts; `lib/ai/gemini.ts` is server-only and calls Google Generative Language API using server environment variables.
- There is no account/authentication/authorization system, backend application database, remote user persistence, server-side user profile, submission database, or cloud sync.

## Content and model observations

`lib/types.ts` defines Domain, Topic, Algorithm, Technique, Project, Source, Resource, GraphNode/Edge, typed lesson blocks, and some user-state/search types. `content/domains.ts` authors ten domains and each Domain embeds topic membership, prerequisites, syllabus modules, roadmap view nodes/edges, mind-map view nodes/edges, associated entity IDs, and resources. Topics are separate registry records, but graph nodes duplicate labels/layout and point to topic IDs where applicable. Domain graph builders synthesize some layout/content; relation semantics live partly in topic prerequisite IDs and partly in authored graph edges.

Topics use a discriminated `ContentBlock` union for educational content. `content/deep-topic-content.ts` supplies deeper profiles, and `content/translations/vi.ts` overlays translated metadata/content. Content has IDs, citations, revision/source metadata, learning objectives, glossary, prerequisites, related IDs, and validation in `content/index.ts`. `content/index.ts` also mixes registry exports/lookups, search-index construction, and cross-registry validation. This is a useful data-driven foundation, but one module now owns several concerns and the model has no first-class Concept/Resource relationship entity.

Practice has a separate bilingual `PracticeProblem` contract in `lib/practice/types.ts` and `content/practice/problems.ts`, with version, JSON public tests, Python and JavaScript starter strings, hints, constraints, comparator, and links to current domain/topic/algorithm/technique IDs. `content/practice/references.server.ts` keeps trusted reference solutions server-only. Practice problems and topic-embedded `ExerciseBlock`s are overlapping but distinct models. Current language selector offers Python and JavaScript; Python is starter/draft-only and explicitly does not execute. JavaScript runs public cases only in QuickJS WASM inside a disposable browser Worker. No hidden judge or online submission service exists.

## API, integrations, deployment assumptions

The API surface is limited to three Next.js route handlers. AI routes validate bounded JSON and call Gemini server-side, but rate limits are process-local and there is no user auth or durable quota. Link preview validates HTTP(S), checks/resolves public IPv4 targets, pins requests to the checked address, revalidates redirects, and caps response/time; public deployment still needs an edge/proxy trust policy and shared limits. No ORM or database driver is installed.

Deployment can run as a Next.js Node server; docs describe production build/start and Vercel-compatible `.next` output, while `next.config.ts` uses a local `.next-production` directory for isolated non-Vercel production builds. `scripts/prepare-practice.mjs` copies a pinned local QuickJS browser loader into generated `public/practice-engine/`; deployment must include that public artifact. Static hosting cannot provide Gemini or server link-preview APIs. No Docker, CI workflow, deployment manifest, or migration runner is present in the inventoried source list.

## Tests and apparent technical debt

Coverage is unusually strong for the current product: content contracts, search, progress, Practice validation/real WASM cases/negative isolation behavior, AI context and API behavior, Library IndexedDB migrations/import/extraction/link-preview security, localization, accessibility-relevant UI interactions, graph interactions, and responsive workflows. Tests use jsdom and fake-indexeddb; there is no browser E2E framework declared in `package.json`. `docs/STATUS.md` records manual production-browser QA from prior changes, but that is not the same as repeatable CI E2E.

Observed debt/risks include: static registries and search index are bundled/imported broadly; `content/index.ts` is a central aggregation point; Domain combines curriculum and graph view data; content translation coverage is uneven; embedded ExerciseBlock and PracticeProblem contracts overlap; user state is local and lacks accounts/sync/export for all keys; API rate limits are per process and unauthenticated; no remote judge/auth/database exists; CSS has legacy and workspace layers; some route files and catalogs are densely/minimally formatted; and currently retained assets/docs may describe past iterations. The audit did not establish a confirmed dead source module. Treat unused code as a profiling/usage question and verify import references before removing anything.

## Preserve / refactor / migrate / replace / deprecate

| Treatment | Existing areas | Reason / condition |
|---|---|---|
| Preserve | Typed topic blocks and provenance; App Router; server-first routes; bilingual messages and content overlays; theme and AppShell interactions; React Flow graph/list alternatives; `lib/storage.ts`; Library repository/extraction; Practice WASM worker and disabled Submit; link-preview URL/IP defenses; existing route URLs | These embody tested product value or important trust boundaries. |
| Refactor | `lib/types.ts` and `content/index.ts`; Domain graph/content ownership; query/index construction; local user-state adapter; duplicate exercise/problem vocabulary; layered CSS ownership | Add canonical contracts incrementally and retain old adapters until parity. |
| Migrate | Domain/topic and related IDs to canonical Concepts; roadmap/mind-map topic links to Concept IDs; progress/bookmarks/exercise/Practice completion to user-scoped records if accounts are approved; Library relations to canonical entities; search to a projected index | Requires mapping, export/rollback, and parity tests. |
| Replace later | In-memory-only public search projection if scale/product requirements demand indexed search; process-local rate limits for public hosting; local-only personal state if sync is explicitly approved | No technology choice should precede requirements and operations ownership. |
| Deprecate cautiously | Legacy topic/domain aliases, duplicate graph labels and copied relation semantics, one-off derived indexes | Only after stable-ID redirects, content parity, telemetry, and migration/rollback evidence. |

## Highest migration risks

1. Breaking stable IDs/routes or dropping locally saved progress, drafts, or Library blobs.
2. Treating browser Practice public-test success as a secure/hidden online verdict.
3. Accidentally importing reference solutions/secrets into client bundles.
4. Turning Library metadata/extracted text into automatic AI uploads or RAG inputs.
5. Confusing roadmap sequence, mind-map association, and generic concept relations.
6. Cross-feature authorization leaks if accounts/remote search are added.
7. Large content/static imports growing client bundles or build time.
8. Inconsistent bilingual coverage during new canonical entity introduction.
9. Running migrations without a rollback/export path.
10. Regressing accessibility or responsive behaviors while changing the shell/graphs.

## Audit boundaries

This M0 review inspected tracked file inventory and relevant implementation/configuration/tests/docs. It did not inspect ignored `.env.local` secrets, install packages, execute code from learner documents, or claim an independent sandbox audit. No production source was edited during the audit.

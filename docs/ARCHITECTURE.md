# Architecture

## Technical Atlas Workspace (2026-09-29)

`app/workspace.css` is the shared product-surface layer, imported after foundational and Practice styles in the root layout. Semantic light/dark tokens cover text, muted text, surfaces, borders, accent, spacing, radii, shadow, motion and stacking. Existing feature styles remain available; the home hero was replaced rather than layered underneath a second hero. The ambient component now renders only a decorative edge-weighted grid and restrained radial color. No background images or continuous canvas loop are loaded.

`AppShell` owns navigation, the sticky command bar, the 240px/72px desktop sidebar and the mobile modal drawer. The drawer makes the underlying workspace inert, contains focus, restores the trigger on Escape/backdrop close, locks scrolling, and closes when the viewport becomes desktop. Native link titles and accessible labels remain available in compact mode. All preferences go through `lib/storage.ts`: sidebar and Library view each have an independently versioned key. Storage restrictions fall back to in-memory interaction; they do not change document records.

The home route remains a Server Component composing small localized/persistent islands. `lib/learning-path.ts` resumes an in-progress topic first, then chooses an unfinished topic with satisfied prerequisites in registry order, falling back to the first unfinished topic. This is deterministic navigation guidance, not AI personalization or a guarantee that prerequisites are satisfied. Bookmarks are real stored records; there is no synthetic recent activity, time estimate beyond authored topic estimates, or gamification.

### Atlas is a third graph model

`lib/atlas-model.ts` derives an atlas from canonical domain membership and topic prerequisite IDs. It does not overwrite either authored roadmap or mind-map models. The overview aggregates cross-domain prerequisite edges; field detail includes its topics and immediate external prerequisites. IDs are namespaced by entity type, destinations use canonical slugs, duplicate edges collapse and invalid domain filters fall back to overview. Search normalizes English and Vietnamese metadata, including diacritics and đ.

`components/atlas/atlas-workspace.tsx` owns scope, query, selection and map/list state. Only the map canvas dynamically imports React Flow with browser-only rendering. List mode exposes the same inspectable entities without a canvas. `atlas-canvas.tsx` owns stable coordinates, camera controls and selected-edge emphasis; camera movement respects reduced-motion preferences. Nodes are native buttons and the inspector receives keyboard focus. On small screens details appear in normal flow below the graph and scroll into view, not in a focus-trapping overlay.

The inspector resolves canonical topic/domain information, prerequisites, related topic links, local progress/bookmarks, domain resources and an existing IndexedDB Library island. It never rewrites canonical knowledge or transmits documents. Layout is deterministic and bounded by field, not a force simulation; large graphs may require pan/zoom or list mode. New workspace messages are paired in `i18n/messages/workspace.ts`.

## Practice & Judge

`content/practice/problems.ts` defines seven versioned, bilingual problems with public JSON tests, constraints, return contracts, three hints, complexity guidance, and canonical domain/topic/algorithm/technique IDs. Validation checks both language variants, test IDs, JSON data, and registry relationships. `references.server.ts` is protected by the `server-only` marker and imported only by trusted test tooling. No hidden cases or reference solutions are sent to the browser. Topic/domain/algorithm/technique pages link back through `RelatedPractice`; global search indexes problem metadata.

Routes `/practice` and `/practice/[problem]` compose client islands for filters, editing, progress, and execution. `JudgeRunner` separates UI from execution. `BrowserPracticeRunner` creates one disposable Worker per run, rejects overlapping requests, supports cancellation, applies a 12-second outer deadline, and always terminates the Worker. Initialization failure is `unavailable`, not a fabricated algorithm time-limit result.

Inside the Worker, `engine.ts` initializes QuickJS and creates a fresh runtime/context for every public case. Submitted source is parsed by the QuickJS interpreter's `evalCode` API, **not JavaScript host eval/Function**. There are no guest-to-host callbacks or filesystem/network/DOM/credential bindings. Imports are unavailable. Direct Date/eval/Function globals and random generation are disabled for the exercise contract; the actual isolation boundary is the WASM interpreter with no host capabilities, not those global removals. This implementation has automated negative tests but has not received an independent sandbox security audit.

Limits live in `PRACTICE_LIMITS`: 20k source characters, 1s interpreter deadline per test, 32 MiB guest heap, 512 KiB guest stack, 8k serialized output characters, 12 cases/run, 40 retained runs, and one-second cooldown. Limits do not cover all browser/WASM overhead. OOM/stack failures are reported as Runtime Error, not a claimed measured Memory Limit verdict. The interpreter interrupt handler detects runaway code; the outer worker deadline contains startup/stalls. A captured serializer bounds guest output; strict shape/type/order comparison happens outside the guest. The ML comparator tolerates numeric differences within 1e-6 absolute/relative tolerance. Native handles and contexts are disposed even after errors.

The QuickJS FFI and worker are lazy bundles. `scripts/prepare-practice.mjs` copies the pinned upstream standalone ESM/WASM loader and its license unchanged to `public/practice-engine/` during install/dev/build. Worker dynamic import deliberately bypasses bundling for this one local artifact: Next 16.3.6 SWC corrupted the embedded binary-string escapes during a verified production build. No CDN or runtime external download is used; the initial homepage does not initialize or download the WASM engine. Deployments must include the generated public file. There is no service worker, so a full offline reload is not guaranteed even though drafts remain local.

`lib/storage.ts` owns the version-one Practice record, sanitizes persisted data, and reports malformed data and quota failures. Drafts autosave after 400ms and flush on pagehide/unmount. Attempts retain source, version, timestamp, case outcomes, and public-only scope. Compact versioned completion records survive history rotation. Progress requires the current version and the exact public test IDs; changing a contract requires a version bump. Local records are editable by the browser owner and must never be treated as authoritative remote scores. The ML reasoning checklist/reflection is saved independently and does not affect the deterministic verdict.

`/api/practice/feedback` is optional, bounded, same-origin checked, and process-rate-limited. Only an explicit button click sends the current problem/code/reported public cases through the existing Gemini adapter; Library data and reference solutions are never accessed. AI responses are plain text and cannot update judge state. The client reports results, so the API treats them as untrusted context, not certified evidence. Public hosting requires authentication, durable per-user limits and cost controls; the existing process-local rate limiter is for local use.

### Deliberate hidden-judge boundary

Submit is disabled because this environment has no reviewed remote execution service. Browser-visible tests cannot be secret. A future hidden judge should implement `JudgeRunner` through a queued authenticated service, keep tests and references server-side, and run untrusted submissions in hardened ephemeral sandboxes/microVMs with no network, credentials, host mounts, or shared state. It needs OS-level CPU/memory/process/output limits, cancellation, admission control, rate limits, audit logging without private source leakage, dependency patching, and independent isolation testing. Docker defaults alone are not sufficient. Do not execute submissions in the Next.js process. Notebook execution, Python and other languages are not supported by this release.

## Content architecture

The atlas is a typed content application. `lib/types.ts` defines the entity contracts; `content/` contains normalized domain, topic, algorithm, technique, project, and source registries. `content/index.ts` builds lookup maps, the global search index, and relationship validation.

A domain owns presentation order—its syllabus, roadmap, mind map, and related entity IDs—but topics and techniques remain reusable across domains. This makes adding a domain primarily a content operation.

### Topic content blocks

Topic prose is not stored as loose HTML or a single generic section. `ContentBlock` is a discriminated union with explicit variants for:

- paragraphs, definitions, intuition, key ideas, and learning objectives
- formulas, theorems, derivations, and step-by-step explanations
- worked examples, code, comparisons, and complexity analysis
- common mistakes, applications, callouts, exercises, and further reading

`ContentBlockRenderer` is the shared presentation layer. Topic routing and content lookup stay on the server; a focused client boundary applies the selected locale and owns code copying and exercise interaction. This keeps the content portable, validates block-specific fields at compile time, and provides a stable target for a future document-import pipeline.

Each topic also carries learning objectives, glossary entries, content maturity, revision metadata, and source IDs. `Source` and `Citation` keep provenance separate from prose so a source can be reused without duplicating bibliographic data.

## Routing

Next.js App Router provides static-friendly dynamic detail routes:

- `/domains/[domain]` and its `syllabus`, `roadmap`, and `mindmap` children
- `/topics/[topic]`
- `/algorithms/[algorithm]`
- `/techniques/[technique]`

Registry lookups resolve slugs. Missing entries use the application not-found experience.

## Optional Gemini assistant

`/assistant` is a client interaction island in a dynamic Server Component page. `lib/ai/context.ts` ranks public Atlas domain, topic, algorithm, technique, and project excerpts against the question and caps the selected pages. `POST /api/ai/ask` validates length and locale, applies a process-local request cap, and calls Gemini from the server-only `lib/ai/gemini.ts` module. The API key comes from `GEMINI_API_KEY`, never the browser bundle. The request has a timeout; API errors map to visible UI states. Answers render as text, while relevant Atlas links provide verifiable context. Model-written citation markers are advisory rather than verified proof.

The assistant route has no dependency on `lib/library/repository.ts` or IndexedDB and accepts no document payload. Library files, extracted text, progress, and bookmarks stay local. A future document-Q&A feature would require a separate, explicit privacy decision and opt-in before any document excerpts could leave the browser. Public deployment also needs authentication and persistent per-user rate limiting; the current process-local cap is for local use only.

## State and storage

`AtlasProvider` exposes topic progress, bookmarks, and exercise status operations. `LocaleProvider` exposes the current locale and typed message lookup. `lib/storage.ts` is the only layer that touches `localStorage`; progress, bookmarks, exercise state, language choice, and translation preferences use validated keys with safe fallbacks when storage is unavailable or corrupt. A future database adapter can implement the same operations without changing feature components.

### Document Library

The Library is a browser-owned resource layer, not canonical curriculum content. `lib/library/types.ts` defines versioned metadata, relations, extraction state, link-preview metadata, and the `LibraryRepository` contract. `IndexedDbLibraryRepository` is the only module that opens IndexedDB. Database version 2 retains two object stores:

- `items`: validated metadata indexed by update time, canonical URL, file fingerprint, and content hash
- `files`: original `Blob` values keyed by the same stable item ID

Metadata and binary writes share one transaction when an item is created. Delete removes both stores in one transaction. Valid version-one records migrate on read to version two without deleting their file blob or relationships; invalid metadata is discarded instead of crashing the application. The repository emits one local change event so listing, global search, and knowledge-page islands refresh without coupling components to IndexedDB.

File import validates the configured 25 MB per-file and ten-file per-batch limits, inspects MIME type, extension, and practical signatures, computes SHA-256 when available, then checks content hash and file fingerprint duplicates. Links accept only HTTP/HTTPS and are matched by a conservative canonical URL that preserves meaningful query parameters. Duplicate choices are explicit: skip, save a copy, or update existing metadata.

`lib/library/extraction.ts` exposes the format-independent extraction boundary. Plain text and Markdown use the File API; DOCX dynamically imports Mammoth's raw-text extractor; PDF dynamically imports the legacy PDF.js build and its worker. Extraction is asynchronous, time-limited, and capped at 500,000 stored characters. Search and preview use smaller capped slices. A failed parser never removes the original blob. Unsupported attachments remain downloadable with an explicit unsupported state.

The detail route uses a wide reading workspace: a content-first viewer, a 320-pixel collapsible metadata rail, and a full-viewport native `<dialog>` Focus mode. The viewer creates at most one object URL for a stored blob and revokes it during unmount. PDF uses the browser's local PDF renderer in a tall iframe; native PDF zoom and pagination belong to the browser, while Atlas provides Focus mode, open-original and download. DOCX and TXT are rendered as safe extracted text. Markdown uses a deliberately limited text-to-React renderer for headings, paragraphs, list lines, and fenced code; it never interprets imported HTML or executes scripts. Text modes offer real reading-width and font-size controls. Focus mode restores keyboard focus, closes on Escape, and locks background scrolling. External sites are never framed; links use `noopener noreferrer`.

### Link preview pipeline

`LinkPreviewMetadata` is persisted on each link item in IndexedDB, so opening Library does not refetch metadata. Import performs a best-effort metadata request after the user explicitly saves a URL; Refresh preview is also available on import and detail pages. The service boundary is `LinkPreviewService` in `lib/library/link-preview.ts`, separate from UI and storage. Manually entered title, description, source, and image URL take precedence over fetched values; Open Graph takes precedence over Twitter Card, then HTML title/description, then provider/domain fallbacks. A failed refresh preserves the prior preview.

The Next.js Node route at `/api/library/link-preview` fetches only HTML. It accepts HTTP(S) URLs without credentials or arbitrary ports, rejects local/internal hostnames and non-public IP ranges, resolves a public IPv4 address and pins the connection to that checked address while preserving Host and TLS SNI. Redirect destinations are revalidated, with a three-hop maximum. Requests have a six-second absolute timeout, a 512 KB HTML cap, a 16 KB response-header cap, and per-client/global in-memory rate limits. Errors return normalized codes, not scraped content. The route never stores a user's document or forwards a link to a metadata service; the linked website itself is contacted. For a production deployment behind a proxy, add shared rate limiting and enforce trusted forwarding headers at the edge.

Provider detection is a pure adapter-like function. YouTube video IDs produce an official `i.ytimg.com` thumbnail URL; playlists do **not** receive an invented thumbnail. GitHub repositories expose owner/name and use a social image only if one is actually fetched. Generic sites rely on parsed metadata. Browser image elements load only validated HTTP(S) URLs, lazily, with `referrerPolicy="no-referrer"` and an on-error fallback. Arbitrary saved domains are not placed in a wildcard Next image-optimizer allowlist. The browser may still contact the image host directly; image bytes are not currently proxied or capped. Static-only exports cannot run the server preview route: manual metadata and provider-derived fallbacks continue to work, but remote Open Graph refresh requires the Next.js server runtime.

Relations store stable entity type/ID pairs for domains, topics, algorithms, techniques, projects, and syllabus modules. Labels and hierarchy are resolved from the canonical content registry. Missing references remain visible and removable. `LibraryResources` is a narrow client island on knowledge pages, leaving the surrounding route and authored content server-rendered where applicable.

Library search is accent-insensitive and weights title and tags above metadata, relations, and extracted body. It is shared by the Library page and converted into ordinary atlas search results for command search. `useDeferredValue`, extraction caps, and body-index caps keep input responsive; parsers are absent from the initial application bundle until import is used.

The repository interface is the cloud migration boundary. A future implementation can provide encrypted sync while preserving the same component API. AI ingestion is intentionally absent: a future review-first `IngestionSuggestion` pipeline may cite excerpts from a Library item, but it must not mutate official atlas content or transmit documents without explicit authorization.

## Localization and contextual translation

English is the deterministic server-rendered default. After hydration, `LocaleProvider` restores the saved `en` or `vi` preference, updates the document language, and supplies typed interface messages from `i18n/messages/`. Domain and topic registries remain canonical English data; `i18n/content.ts` overlays Vietnamese metadata from `content/translations/` without duplicating routing or relationship logic.

All ten domains and 79 topic metadata records have Vietnamese translations. Complexity Analysis, Gradient Descent, and Linear Regression also have complete translated content blocks. Other detail prose remains explicitly English and is marked with an honest partial-translation status instead of silently mixing languages.

Text selection is handled by `hooks/use-text-selection.ts`, which rejects controls, navigation, code, formulas, editable surfaces, selections outside the main document, Vietnamese text, and oversized selections. `lib/translation/` resolves translations in a deterministic order: curated educational translations, local bilingual glossary, then the browser Translator API when feature detection succeeds. An unsupported browser receives a clear unavailable state; no API key or remote service is required.

## Search

`content/index.ts` creates a flattened, typed search index with destination URL, hierarchy, and English/Vietnamese titles, descriptions, and keywords. Domain entities are joined with topic text, glossary terms, exercises, and source metadata. Exercise results link directly to their block anchors. `lib/search.ts` performs accent-insensitive Unicode normalization, requires all query terms, then ranks exact and prefix title matches above keyword matches. Both the command dialog and full search page share this code and render the result in the active locale.

## Graphs

Roadmaps model learning dependency and sequence. Mind maps model conceptual families. Both use the `GraphNode`/`GraphEdge` primitives, but store distinct data. DSA, Mathematics for AI, and Machine Learning now use branching dependency roadmaps rather than flat chains. `GraphExplorer` adapts these models to React Flow and decorates nodes with persisted learning state.

Graph navigation is registry-driven. Topic nodes resolve their destination through the canonical topic registry instead of assuming a graph ID is a route slug. Root nodes without a topic return to the domain overview; structural branch nodes focus and reveal relationships without fabricating a URL. Every node surface is a keyboard-operable button with a purpose-specific accessible label.

Topology and presentation are kept separate. Base nodes, edges, adjacency, and entrance order remain memoized while hover, focus, and completion state only decorate those stable objects. Roadmaps highlight direct incoming and outgoing dependencies. Mind maps also highlight conceptual siblings that share a parent.

Validation treats a graph as data, not decoration. It rejects duplicate nodes and edges, missing topic references, self-loops, cycles, unreachable nodes, and prerequisite relationships that contradict roadmap order. Roadmap and mind-map registries remain separate because they answer different questions.

## Import-ready boundary

The current release deliberately does not upload or automatically mutate curriculum data. The typed content blocks, source registry, revision metadata, validation report, and shared renderer form the safe boundary for a later `ContentProposal` workflow: parse documents into a proposal, validate it, show a diff and provenance, then require review before merging. Imported material should never bypass the same validators used by hand-authored content.

## Visualization architecture

`AlgorithmVisualizer` treats an algorithm animation as a sequence of immutable frames. Controls only move through frames or schedule frame advancement. Binary search, BFS, and merge sort provide independent frame generators; another algorithm can be added by generating the same `VizFrame` contract.

## Motion and background architecture

Motion is implemented with CSS/SVG and state already owned by interactive components; no animation runtime dependency is shipped. Base easing tokens live in `app/globals.css`, with the product duration/surface layer in `app/workspace.css`.

`AmbientBackground` is a fixed, layout-independent decorative stack marked `aria-hidden`. It now consists only of a faint peripheral CSS grid and a restrained radial tint. The older generated topology images remain in `public/backgrounds/` but their DOM layer is no longer rendered, so they are not loaded by the workspace.

Both themes use opaque reading surfaces and semantic foreground colors. The ambient grid is masked away from the reading center and does not animate. Workspace entrance, hover and state transitions are short; reduced motion removes them. The Atlas starts in list mode on small screens, with an optional pan/zoom map that avoids shrinking labels solely to fit every node.

The homepage uses `KnowledgeAtlasPreview`, a small client boundary whose nodes remain ordinary links when motion is disabled. Route content receives a short enter transition while the application shell remains stable. Domain cards, status controls, bookmarks, disclosures, search, and visualizer frames reuse the same timing tokens.

Roadmap and mind-map motion deliberately differ. Roadmaps reveal from dependency direction and highlight prerequisite/next edges; mind maps expand from conceptual centers over a radial field. Entrance animation is enabled by a short-lived graph-level class and is applied only to the node's visual child and SVG edge path. The React Flow positioning wrapper is never animated because its `transform` is owned by React Flow. After entrance, hover and focus use transitions only, so interactions cannot restart the graph animation. Neither graph runs continuous edge animation.

Controlled nodes declare initial dimensions so React Flow can calculate the MiniMap viewport before measurement. The MiniMap uses fixed matching dimensions, neutral theme-safe colors, and static overview behavior; it is hidden on narrow screens where pan and zoom provide a more legible experience. Mobile graphs retain readable node sizes rather than shrinking labels to fit the entire topology.

`TableOfContents` uses `IntersectionObserver` to expose the active documentation section through both color and `aria-current`. Mobile navigation and command search lock background scrolling, support Escape, trap focus within the active surface, and restore focus on close.

The final `prefers-reduced-motion` layer removes route, stagger, floating, graph-draw, traversal, and pulse animations. It does not remove React Flow's positioning transforms. Essential state remains visible through color, border, labels, and progress values; the atlas camera also uses zero-duration moves when reduced motion is requested.

## Rendering and performance

Content pages are Server Components by default. Client boundaries are limited to persistence, localization, filtering, search interaction, selection translation, Library data, graph canvases, and visualizer controls. Library resources appear through small per-entity client islands rather than converting knowledge routes into IndexedDB-aware client pages. React Flow is route-loaded through `next/dynamic`, and graph data is memoized.

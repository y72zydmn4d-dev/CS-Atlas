# Status

Last updated: 2026-09-30

## Implemented

- Initial CS-Atlas 2.0 migration slice: capability-level shell navigation; additive Learn, Concept, Exercise, Problem, Explore, and local Profile routes; existing URLs and browser data preserved.
- Canonical type-qualified Concept registry and validated typed relation graph over Topics, Algorithms, and Techniques. `/atlas` now projects canonical topic relations while Roadmap and Mind Map retain separate authored layouts.
- Lesson, Exercise, and public-only Problem adapters connect current content to Concepts. Public browser exercise/problem activity contributes local evidence only; it is not a remote Judge result or public profile.
- Explicit public Concept context for Atlas AI, canonical Concept/Exercise/Problem search projection, and a non-destructive Library relation adapter. Library content remains excluded from AI context.
- Complete source-qualified legacy Concept migration map with collision reporting and parity tests across routes, citations, graphs, Exercises, Problems, and existing Library relations.
- Roadmap and Mind Map screens now consume canonical Concept view records, retain authored layout semantics, report unresolved nodes, and provide deterministic keyboard-accessible list views alongside progress-aware maps.
- Progress dashboards and graph overlays project preserved topic state through canonical Concept IDs. An idempotent local migration snapshot retains rollback data and imports topic/exercise/public-Practice evidence without altering legacy keys or claiming hidden-Judge mastery.
- Local goals support one-time, weekly, and monthly windows in the recorded browser timezone; study items retain due dates, and activity can be aggregated by local calendar day without leaving the device.
- The Problem Library now validates ratings, tags, constraints, public examples, provenance, publication visibility, and canonical links to prerequisites, lessons, exercises, and roadmaps; filters cover localized text, topic, tag, rating, difficulty, status, and language capability.
- Judge application contracts now distinguish public/hidden suite references, validated lifecycle events, terminal verdicts, and measured usage. The UI covers every lifecycle/verdict state, while the only server adapter remains explicitly unavailable and adversarial route tests confirm source is never executed.
- Global and command search now consume versioned public/owner-private document projections, filter local Library visibility before ranking, validate source versions and destinations, and preserve the existing bilingual accent-insensitive ranking as the fallback adapter.
- Atlas AI now has explicit source sensitivity/consent policies, debug/review task contracts, hardened untrusted-context prompt assembly, validated/capped provider output, and optional RAG-derived record interfaces; the active endpoint still accepts only public Concept context and never Library/progress/code context.
- Exercise contracts now include explicit rubrics, non-empty canonical Concept relations, locale fallback, version-scoped attempts, progressive hints, honest browser-only persistence labels, and catalog filters by mode and Concept; Learn links to the shared Exercise catalog.
- Learn now projects the existing authored topics into governed Lesson blocks, references, worked examples, and explicit runtime-capability records with canonical Concept links, review maturity, translation status, citations, and provenance. Code blocks are visibly display-only unless a future runtime is approved.
- Library now exposes explicit private local-owner, file-object, note, collection, resource-link, and canonical relation contracts; versioned metadata transfer excludes original/private extracted bytes, quota failures are recoverable, and a source-bound ingestion-job interface remains separate from AI/RAG. Remote sync stays deferred pending approved identity and cloud policy.
- Core route presentation metadata and breadcrumbs now come from one typed registry; the shell owns theme, locale, and navigation preferences through providers and includes localized loading/error recovery plus the existing keyboard, focus-trap, reduced-motion, theme, locale, and narrow-layout coverage.
- Profile remains deliberately anonymous and private: users can export a versioned snapshot of learning state/preferences or explicitly clear learning data without deleting Library items. Accounts, recovery, remote ownership, and authorization remain deferred behind a documented approval and migration policy.
- Lesson, Reference, Exercise, Problem, Roadmap, MindMap, public Resource, and UserMastery are now separate canonical-linked records. Canonical learning-view projections derive Concept labels and destinations instead of carrying legacy duplicates; structural graph labels remain authored view data.

- Technical Atlas Workspace overhaul: quieter light/dark surfaces, smaller headings, consistent spacing and restrained entry/hover/focus transitions; noisy image background removed from rendering.
- Desktop sidebar with persisted 240px/72px modes; mobile drawer with inert background, focus containment/restoration and desktop-resize recovery; top search/context/locale/theme bar.
- Learning-first homepage with real active topics, prerequisite-aware deterministic next-topic selection, newest bookmarks, onboarding and a data-derived navigable map preview. No fake activity metrics.
- New `/atlas` route: cross-domain prerequisite overview, domain/topic filtering, English/Vietnamese accent-insensitive search and camera focus, pan/zoom/fit, inspectable native buttons, accessible list fallback, and detail inspector with progress/bookmarks/Library resources.
- Clearer domain dashboards with real next-topic actions, all core topics, module progress links into syllabus, and clickable external resources. Reading surfaces and Practice editor/actions use the new visual tokens.
- Library list/grid switch with persisted preference; compact import area and improved metadata legibility. Import limits, IndexedDB schemas, existing documents and Practice execution contracts are unchanged.
- Practice at `/practice` with six DSA problems (Binary Search, BFS, Two Pointers, Sliding Window, Prefix Sum, 0/1 Knapsack) and one deterministic Linear Regression exercise; 35 public cases including boundaries, verified server-only reference solutions, bilingual statements, three progressive hints, and complexity guidance.
- Real public-test execution in a QuickJS WASM Worker with per-case comparison, interruption, output/guest-memory limits, cancellation, and honest initialization failures. Wrong Answer, Runtime Error, Time Limit and Accepted (public tests only) are working outcomes.
- Six catalog filters, accent-insensitive search, a Python 3/JavaScript language selector, separate per-language draft autosave, keyboard Run for JavaScript, expected/actual feedback, latest 40 run records, persistent versioned completion records, ML self-assessment notes, and a dedicated Progress section. Existing version-one JavaScript drafts migrate without data loss.
- Links in both directions between Practice and relevant domains/topics/algorithms/techniques; Practice metadata in global search. Optional explicit Gemini hints cannot alter verdicts and do not access Library data.
- Optional Gemini assistant at `/assistant`: bilingual questions are matched to public Atlas content, answered through a server-only Gemini API route, and shown with links to relevant Atlas pages. The rest of CS Atlas works without an API key.

- Production application foundation, responsive shell, dark/light themes, and mobile navigation
- Ten populated domains with structured syllabi, prerequisites, projects, resources, roadmaps, and mind maps
- Typed topic blocks for objectives, definitions, formulas, derivations, worked examples, code, comparisons, mistakes, applications, exercises, and further reading
- Shared topic renderer with generated table of contents, glossary, citations, code copying, progressive hints, and worked solutions
- Three reference-quality topics: Complexity Analysis, Gradient Descent, and Linear Regression
- Nine substantive exercises with locally persisted attempted/solved state
- Four verified external sources in a reusable citation registry
- Branching dependency roadmaps for DSA, Mathematics for AI, and Machine Learning
- Topic documentation pages with progress, bookmarks, prerequisites, related navigation, revision metadata, and honest content-maturity labels
- Algorithm encyclopedia with ten meaningful guides
- Interactive binary search, BFS, and merge sort visualizers
- Twenty algorithm and ML techniques with cross-links
- Local progress dashboard and bookmarks
- Full search page plus keyboard command search across entities, glossary terms, exercises, and sources
- Relationship and graph validation covering duplicate IDs, missing references, cycles, reachability, prerequisite ordering, citations, and exercise links
- Static, edge-weighted CSS grid and restrained radial atmosphere; older topology image assets are retained on disk but no longer rendered
- Shared motion tokens for micro-interactions, component transitions, route reveals, and graph entrances
- Interactive homepage atlas with navigable nodes, related-edge highlighting, focus parity, and a static reduced-motion fallback
- Distinct graph behavior: dependency-direction reveals for roadmaps and center-out conceptual reveals for mind maps
- Stable graph interaction model with one-time entrances, relationship highlighting on hover/focus, one-time completion feedback, smooth fit view, and non-continuous edges
- Registry-resolved topic navigation plus explicit root, branch, and topic node behavior with full keyboard access
- Responsive graph overview with a populated desktop MiniMap and readable pan/zoom nodes on mobile
- Improved Binary Search, BFS, and Merge Sort frame transitions with traversal, step progress, caption handoff, and deterministic controls
- Active topic table of contents driven by section visibility and exposed with `aria-current`
- Animated command palette and mobile drawer with scroll lock, Escape handling, focus containment, and focus restoration
- Global `prefers-reduced-motion` handling that removes decorative, route, stagger, floating, pulse, graph-draw, and traversal motion
- English/Vietnamese interface with persisted language choice, synchronized document language, and safe corrupted-storage fallback
- Vietnamese metadata coverage for all ten domains and all 79 topics
- Complete Vietnamese structured content for Complexity Analysis, Gradient Descent, and Linear Regression, with formulas and code preserved exactly
- Honest complete/partial translation states and language annotations for English-only long-form content
- Bilingual accent-insensitive command and full-page search, including Vietnamese queries such as `bảng băm`, `hạ dốc`, and `hồi quy tuyến tính`
- Contextual selection translation with curated content, local glossary fallback, optional browser Translator API support, keyboard dismissal, copy feedback, and protected code/formula/input surfaces
- Local-first Document Library routes for listing, import, and directly addressable item detail pages
- IndexedDB persistence with versioned/validated metadata, separate binary blob storage, atomic create/delete operations, corrupt-record recovery, and a repository abstraction
- File import with drag-and-drop or keyboard-accessible input, configured batch/size limits, MIME/extension/signature checks, SHA-256/file-fingerprint duplicate detection, and explicit skip/copy/update choices
- HTTP/HTTPS link import with safe URL validation/canonicalization, manual metadata, duplicate handling, and external-link isolation
- Lazy text extraction for PDF (PDF.js), DOCX (Mammoth raw text), Markdown, and TXT; unsupported files remain honest attachment-only items
- Library search, type/format/relation/tag filters, sorting, storage usage, metadata JSON export, notes, tags, language, editing, download, deletion, and responsive safe previews
- Stable Library relations to domains, topics, algorithms, techniques, projects, and syllabus modules, with missing-reference handling
- Small IndexedDB client islands showing related Library resources on domain, topic, algorithm, and technique pages
- Library items included in accent-insensitive global command and full-page search; Library items can also be bookmarked and assigned a learning state
- Wide Library reading workspace with a content-first viewer, collapsible 320px details rail, responsive tablet/mobile layout, and full-viewport Focus mode with Escape/focus restoration
- Real text-reading controls for extracted TXT, DOCX, and Markdown; safe Markdown heading/list/code presentation; tall native PDF viewer with clearly labeled browser-owned PDF controls and open/download fallbacks
- Persisted version-two link previews with a safe version-one migration, manual image/title/site editing, and refresh that preserves existing metadata on failure
- Rich link cards on Library list and detail pages with actual social or YouTube thumbnail URLs, favicon/site information, meaningful no-image fallback, and broken-image recovery
- Server-side Open Graph/Twitter/HTML metadata preview route with public-host validation, DNS/IP pinning, redirect revalidation, timeout, HTML response cap, and rate limiting; YouTube video and GitHub repository provider recognition
- Offline-safe system font stacks and separate development/production build directories, so production builds do not depend on Google Fonts or collide with a running dev server

## Deliberate first-release boundaries

- Workspace overhaul is a coherent first release, not a rewrite of every feature. Atlas currently graphs domains and topics; algorithms/techniques/projects remain on linked knowledge pages rather than additional node families. Atlas selection and camera position are not URL-persisted. The deterministic layout can need pan/zoom in large fields; mobile starts in list mode. There is no new force-layout engine, 3D background, or animation dependency.
- Library and Practice retain their established data and execution contracts. The UI overhaul does not increase the 25 MB import limit, add Python execution, replace the plain-text code editor, or translate all existing English educational prose. Those require separate product/engineering increments.
- Practice provides Python 3 and JavaScript starter code and independent drafts. Only JavaScript executes today, in the bounded local QuickJS interpreter; Python is visibly marked edit/save-only until an isolated Python runtime is configured. The plain-text editor has no syntax highlighting or debugger. Accepted means the visible cases passed, not proof of complexity or correctness on unseen inputs.
- Hidden Submit is disabled. There is no remote judge, queue, authentication, OS-level submission isolation, or independent sandbox audit. A hardened reviewed service is required before enabling public hidden-test judging; Docker defaults alone are not enough.
- Practice timings are machine-dependent. The 32 MiB guest heap excludes browser/WASM overhead; memory/stack failures appear as Runtime Error, not a precisely measured Memory Limit verdict. A worker startup deadline appears as unavailable, not algorithm TLE.
- Practice drafts/history/completion are browser-local, editable by the owner, and not authoritative scores. There is no account sync or Practice export UI. No service worker is installed: offline drafts remain, but reloading the application or uncached worker can fail offline.
- Live Gemini Practice feedback was not invoked during QA; request validation and UI behavior are covered without sending user code to an external service.
- Gemini requires a user-provided API key, Internet, and API quota. No live model response was tested because no key was supplied. The assistant does not read or transmit Library files or extracted text, and it does not create flashcards, quizzes, mind maps, or videos.
- The assistant's request cap is process-local and intended for local use; public hosting needs authentication, persistent rate limits, and spending controls.
- Restart the application after changing `.env.local`; optional Gemini routes read their configuration on the server. Core Practice execution requires no key.

- Progress and bookmarks are device-local and do not sync across browsers.
- Only Complexity Analysis, Gradient Descent, and Linear Regression currently meet the reference-quality content standard. Other topics are useful structural coverage but remain Foundation-level.
- Only the three reference topics currently have complete Vietnamese long-form content. Other domains and topics have translated navigation and metadata while their detailed teaching blocks remain visibly marked English content.
- Algorithm, technique, and project detail prose is still primarily English even when the surrounding interface is Vietnamese.
- Browser-powered free-form translation is capability-dependent. Curated and glossary translations work locally; unsupported browsers show an explicit unavailable state rather than making a hidden network request.
- Existing reading-block exercise progress remains self-directed. The separate Practice section now automatically checks its public cases; hidden submission is still unavailable.
- Library metadata export does not include binary file data, and backup restore is not implemented yet.
- PDF viewing relies on the browser's built-in local PDF renderer. DOCX is shown as safe extracted plain text; original Word layout is not reproduced.
- The Library never iframes external websites. Link preview metadata can be fetched only by the Node server route when the user adds or refreshes a link; static-only hosting needs manual metadata and provider fallbacks. Preview fetching contacts the linked website and can fail when that site blocks bots or networking is unavailable.
- Remote preview images are loaded directly by the browser with no referrer and a visible fallback; image bytes are not yet proxied or capped. Local image upload for link cards is not implemented; manual public image URLs are supported.
- PDF still uses the browser's native renderer, so Atlas cannot programmatically zoom a PDF page or reliably diagnose every browser-level PDF render failure. Native browser controls and open/download remain available.
- A real 400-page PDF, long DOCX/TXT, and provider-specific social images were not all available for visual verification in this environment. Automated tests cover parsing, fallbacks, migration, and reader lifecycle; manual QA with representative documents remains useful.
- Automatic curriculum updates and AI document analysis are not implemented. Library material remains personal reference data; a future ingestion workflow must be review-first and provenance-preserving.
- Library data is device/browser-local and does not sync across browsers. Storage capacity depends on the browser's quota and eviction policy.
- Projects describe authentic deliverables but do not include submission or review workflows.
- Route motion is an enter handoff rather than a shared-element morph; the shell remains fixed and unsupported animation APIs are not required.
- Graph layout remains content-authored. Large cross-domain graphs will benefit from a future automatic layout pass.
- On this macOS host, `next dev` currently hits the operating-system watcher error `EMFILE` (with either Turbopack or Webpack) and restarts repeatedly. The production build and `npm run start` work; the application is being served from that stable build on `localhost:3000`. The watcher issue has not been attributed to application code, so no polling workaround is enabled by default.

## Resolved issues

- Prevented Dark Reader from mutating Lucide SVG attributes before React hydration by declaring the site-managed dark theme with a static `darkreader-lock` metadata tag.
- Removed graph flicker and displaced nodes by moving animation off React Flow's transform-owned positioning wrappers.
- Prevented graph entrances and edge drawing from restarting during hover, focus, or completion-state updates.
- Restored the MiniMap by supplying controlled-node dimensions and matching its calculated viewport to its rendered size.
- Replaced graph ID-based URLs with canonical topic-registry resolution; structural branches no longer generate dead topic links.
- Replaced the generic procedural background with an edge-weighted scientific topology field while preserving a calm, readable center in both themes.
- Removed the duplicate page-level grid to prevent moiré and reduced topology detail progressively on tablet and mobile.
- Removed the narrow Library detail constraint that reduced PDF/DOCX reading width; isolated production output from the prior running development server.
- Added a build-only cleanup for macOS Finder `.DS_Store` files inside the generated production directory; these files had intermittently interrupted Next.js's output cleanup with `ENOTEMPTY`.

## Verification

Workspace overhaul checks on 2026-09-29:

- The landing page now ends with a bilingual, theme-aware creator footer for Trịnh Gia Huy, including the local red-polo portrait at `public/images/author/trinh-gia-huy.jpg`, HUST/IT-E10 context, safe external social links, responsive layout, and current-year copyright. It is mounted only from `app/page.tsx`; the portrait uses a centered CSS crop without modifying the source photo.

- ESLint and strict TypeScript pass; 144 tests in 21 files pass. New coverage includes unique graph IDs/canonical links, valid deterministic edges in every domain, real prerequisite provenance, Vietnamese search, preference validation, local recommendations, mobile list default, inspector focus/progress updates, sidebar persistence/Escape, Library list/grid persistence, author-footer accessibility, bilingual copy, safe social links, and the home-only mounting boundary.
- Production build passes with 139 generated pages, including `/atlas`. No additional package dependency was installed.
- Production-browser QA on isolated `127.0.0.1:3002`: Atlas map loaded without console warnings/errors; Vietnamese unaccented search selected Complexity Analysis; list/inspector works on mobile; changing learning state and bookmarking survived reload and appeared on the homepage.
- Final rebuilt production smoke check: Cmd+K opened global search, `do phuc tap` matched the Vietnamese Complexity Analysis title, and Enter navigated to `/topics/complexity-analysis`; no browser warnings/errors were recorded in that check. The preview was restarted from the final build and temporary viewport overrides were removed.
- Author-footer browser QA on the final production build: the footer count was exactly one on `/` and zero on `/domains`, `/practice`, `/roadmaps`, `/mind-maps`, `/library`, and `/assistant`. Light and dark themes rendered correctly. Widths 375, 768, 1024, and 1440px had no document-level horizontal overflow; mobile social controls resolved to a 44px minimum touch height. No browser warnings or errors were recorded, and the temporary viewport override was reset.
- Verified 390px CSS-width layouts for home, Atlas, domain overview, long topic, Library import and Practice without document-level horizontal overflow. Verified 1440px desktop, 240px expanded / 72px collapsed sidebar, collapsed preference after reload, mobile Escape returning focus, and both themes/locales. Reduced-motion behavior is implemented in CSS and camera code; OS-level preference switching was not exercised in the browser QA.
- Re-ran the real JavaScript Binary Search solution through the redesigned Practice screen: 6/6 public cases passed. Python remains explicitly edit/save-only. No Gemini request or user document upload was triggered by this UI QA. Existing Library extraction/storage suites pass; parser behavior was not changed.
- Normal-origin learner data was not cleared or migrated. The separate QA origin contains only test progress/bookmarks/drafts created for verification, not the user's normal Library.

Practice checks on 2026-09-29:

- Browser production smoke test: wrong Binary Search result displayed expected/actual output; corrected solution passed 6/6; reload retained source/history and Progress showed 1/7. An infinite loop was interrupted after roughly 1 second and the UI remained usable.
- The initial browser test exposed an SWC production minification bug in the embedded WASM loader; the loader is now pinned, prepared locally, and served byte-for-byte without rebundling.
- Full automated suite: 114/114 tests in 18 files passed, including real WASM execution of all JavaScript reference solutions, bilingual Python/JavaScript starter validation, version-one JavaScript-draft migration, independent per-language drafts, output/type comparison, corrupted storage recovery, guest capability checks, oversized allocation containment, worker cleanup/cancellation, UI keyboard/persistence flows, and mocked optional-feedback request validation.
- Final `npm run lint` passed with zero warnings; `npm run typecheck` passed; `npm test` passed; `npm run build` passed and generated 138 pages. The generated vendor loader is intentionally excluded from app lint and was independently syntax-checked.
- Production browser QA verified English/Vietnamese, light/dark mode, 390px mobile layout without horizontal overflow, 1440px desktop layout, accent-insensitive catalog search, Tab/Ctrl+Enter interaction, and the Binary Search ↔ Practice link. The ML regression solution also passed its 4/4 numeric cases in the real browser; reflection remains self-assessed.
- QA ran on a separate `localhost:3002` origin, leaving normal-origin learner data untouched. The final app can be served using `npm run start` after the successful build.

Gemini integration checks on 2026-09-28:

- ESLint passed with zero warnings; strict TypeScript validation passed
- Vitest: 84/84 tests passed, including new Atlas retrieval and assistant UI tests
- Next.js production build passed in an isolated temporary output directory; `/assistant` and `/api/ai/ask` are dynamic routes. The temporary build output was removed after verification and can be regenerated.
- Live Gemini call was not exercised without a user-supplied key; the existing `localhost:3000` process was not interrupted.

Completed successfully on 2026-09-28:

- ESLint: passed with zero warnings
- TypeScript strict validation: passed
- Vitest: 78/78 tests passed, including prior coverage plus preview metadata precedence, safe URL/IP rejection, private redirect rejection, oversized API request rejection, YouTube/playlist/GitHub detection, image-free and broken-image fallbacks, version-one migration, wide reader, PDF loading/timeout fallback, sidebar collapse, Focus mode, Escape/focus restoration, and object URL cleanup
- Next.js production build: passed; 135 pages generated, including the dynamic link-preview route
- Runtime smoke checks: home, domain overview, roadmap, mind map, graph topic navigation, non-navigating branches, browser back, algorithm detail, deep topic rendering, command search, visualizer controls, and bookmark persistence
- Graph visual QA: DSA roadmap and mind map; Mathematics for AI, Machine Learning, and Programming mind maps; populated MiniMaps; stable post-entrance transforms; light/dark themes; mouse and keyboard navigation
- Mobile visual QA: animated home atlas, navigation drawer, command palette, readable pan/zoom graph, hidden MiniMap, deep topic TOC, algorithm visualizer, light/dark themes, horizontal containment, and interactive controls
- Background visual QA: homepage, domain, roadmap, mind map, long topic, algorithm visualizer, and command palette at ultra-wide desktop, laptop, tablet, and mobile sizes in both themes
- Bilingual runtime QA: English/Vietnamese switching, saved locale after reload, localized home/domain/topic views, complete and partial translation labels, Vietnamese command search with keyboard navigation, and zero console warnings or hydration errors
- Library runtime QA: imported a real Markdown file, edited Vietnamese metadata, attached it to Gradient Descent with keyboard navigation, extracted/indexed its text, verified persistence after reload, searched without accents, opened the detail preview/download URL, confirmed the topic resource island, found it from global command search, and observed zero console warnings or errors
- New Library visual/runtime QA: saved a YouTube test link in an isolated local production origin, saw its official video thumbnail in list and detail views at mobile-sized and 1440px desktop viewports, confirmed the honest YouTube metadata-fetch failure fallback, and observed no browser console errors. The public preview endpoint returned real title metadata for Example Domain and real Open Graph image/favicon metadata for a GitHub repository; a loopback URL returned HTTP 400. This isolated test item is not in the user's original `localhost:3000` Library.

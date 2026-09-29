# CS Atlas

CS Atlas is an interactive, local-first Computer Science learning platform. It connects canonical knowledge concepts to lessons, exercises, public-test programming problems, roadmaps, mind maps, Library resources, local learning evidence, Atlas AI, and global search.

## Screenshots

_Add screenshots of the home atlas, a domain roadmap, and an algorithm visualizer here._

## Features

- Technical Atlas Workspace: compact/expanded sidebar, command bar, readable light/dark surfaces, and a learning-first home with real local progress and bookmarks
- CS-Atlas 2.0 entry points for Learn (`/learn`), canonical Concepts (`/concepts/[concept]`), Exercises (`/exercises`), Problems (`/problems`), Explore (`/explore`), and a local Profile (`/profile`), while preserving the original routes
- Validated canonical topic/algorithm/technique Concepts with typed relationships, a bounded in-memory graph service, and an `/atlas` projection over those records
- Cross-domain `/atlas` with lazy-loaded interactive graph, bilingual node search, field filtering, keyboard-friendly list alternative, and a knowledge inspector with personal Library resources
- Domain next-step recommendations and anchored module sequences; Library list/grid preferences persist independently of document data
- Practice mode: six bilingual DSA problems plus a deterministic Linear Regression exercise, Python 3 and JavaScript starters with separate drafts, real JavaScript public-test execution in a QuickJS WASM worker, hints, per-case feedback, local history, and knowledge links
- Ten interconnected domains spanning programming, DSA, mathematics, data, ML, deep learning, vision, NLP, LLMs, and AI engineering
- Data-driven domain, topic, syllabus, graph, algorithm, technique, project, and resource models
- Interactive roadmap and mind-map canvases with zoom, pan, fit view, navigation, and progress states
- A typed, block-based curriculum model for definitions, formulas, derivations, worked examples, code, comparisons, mistakes, exercises, and further reading
- Reference-quality vertical slices for Complexity Analysis, Gradient Descent, and Linear Regression
- English/Vietnamese interface with persisted language preference and bilingual search across all domain and topic metadata
- Complete Vietnamese teaching sequences for the three reference topics, with honest partial-translation labels elsewhere
- Selection-to-Vietnamese translation for eligible English prose using curated material, the local glossary, or the browser's Translator API when available
- Typed Exercise records with local attempts, progressive hints, self-directed legacy exercises, and original multiple-choice/fill-code NumPy/Pandas examples
- A verified source and citation registry used by topic blocks and search
- Working binary search, BFS, and merge sort visualizers with play, pause, step, reset, and speed controls
- Command search with `Cmd+K` / `Ctrl+K`, including glossary terms, exercises, and sources
- Local progress, learning evidence, goals, study plans, and bookmark persistence behind a storage adapter
- Local-first Document Library for PDF, DOCX, Markdown, TXT, attachments, and safe external links
- IndexedDB-backed metadata and binary storage with duplicate detection, extraction status, search, filters, notes, tags, and knowledge relationships
- Lazy PDF.js and Mammoth extraction, safe text previews, browser PDF viewing, original-file download, and object URL cleanup
- Library resources embedded as small client islands on domain, topic, algorithm, and technique pages
- Optional Gemini Q&A over public Atlas content, with linked pages for verification; Library files are not sent
- Responsive application shell, keyboard navigation, focus states, light mode, and dark mode
- A quiet edge-grid background and shared reduced-motion-safe motion system; the older generated topology assets are retained but no longer displayed
- Distinct roadmap, mind-map, search, navigation, progress, and visualizer motion that communicates state without decorative overload

## Stack

- Next.js 16 App Router
- React 19 and strict TypeScript
- Tailwind CSS 4 plus an intentional CSS token system
- React Flow (`@xyflow/react`)
- Lucide icons
- Vitest and Testing Library

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Enable the optional Gemini assistant

Copy `.env.example` to `.env.local` in this repository and set `GEMINI_API_KEY` to a key from [Google AI Studio](https://aistudio.google.com/apikey). Restart the running server, then open `/assistant`. Never add `NEXT_PUBLIC_` to the key or commit `.env.local`. `GEMINI_MODEL` can override the default `gemini-3.8-flash` if your API project cannot use that model. Google AI Pro is a separate subscription; check Gemini API billing and quota in your AI Studio project.

The assistant sends the question and a small selection of public Atlas excerpts to Google. It does not read or transmit Library files, extracted text, progress, or bookmarks. Answers can be wrong, so use the linked Atlas pages to verify them. The feature needs Internet and may incur API charges. Before hosting the API endpoint publicly, add authentication, persistent per-user rate limiting, and spending controls.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Practice & Judge

Open `/problems` for the v2 problem library or `/practice` for the original catalog. Each language has its own starter and locally saved draft. JavaScript `function solve(input)` can run the public tests in the browser with **Run public tests** (or Ctrl/Cmd+Enter); Python `solve(data)` is currently edit/save-only and is clearly labeled until an isolated Python runtime is configured. No API key is needed. The editor is a keyboard-friendly plain-text editor, not a full IDE. It supports Binary Search, BFS, Two Pointers, Sliding Window, Prefix Sum, 0/1 Knapsack, and an ML train/test regression audit.

**Accepted means public tests passed, not hidden-test certification.** Submit is intentionally disabled. Code executes in a QuickJS WebAssembly interpreter inside a disposable browser Worker, never inside Next.js or through host `eval`/`Function`. No host APIs, network, filesystem, or credentials are exposed to learner code. This is a bounded local practice tool, not a security-audited public competition judge.

The application also exposes an intentionally unavailable submission-contract endpoint at `/api/judge/submissions`. It validates source size, idempotency format, problem version, language and same-origin requests, then returns an honest unavailable state without executing or forwarding source. Remote Submit cannot be enabled until an authenticated queue, durable owner-scoped persistence, hidden-test store, isolated no-network execution service, quota/abuse controls, operational kill switch, and independent security review are in place.

Limits: 20,000 source characters, 1 second per test, 32 MiB guest heap, 512 KiB guest stack, 8,000 output characters, and a 12-second worker deadline including startup. Browser/WASM overhead is additional; local runtime is not a benchmark. The latest 40 runs and versioned completion records stay in this browser. Storage is not an authoritative score or cloud backup.

`npm install`, `npm run dev`, and `npm run build` prepare a pinned, locally served QuickJS loader in `public/practice-engine/`. It is loaded on demand without a CDN. Do not omit npm lifecycle scripts, or run `node scripts/prepare-practice.mjs` explicitly. Copy this generated directory along with other public assets when deploying. Keeping the vendor loader unmodified avoids a Next.js 16.3.6 minification issue with embedded WASM bytes.

Optional **Ask Gemini for a hint** sends the visible problem, current code, and reported public-test results only after a click; it never sets the verdict. It requires the existing server-only Gemini configuration. See [Practice architecture and boundaries](docs/ARCHITECTURE.md#practice--judge) before adding languages or enabling remote submissions.

## Project structure

```text
app/          App Router pages and route-level composition
components/   Reusable shell, graph, catalog, persistence, and visualizer UI
content/      Structured educational content registries
i18n/         Typed English/Vietnamese messages and localized content adapters
hooks/        Browser interaction hooks, including safe text-selection handling
lib/          Types, search, progress, storage, Library repository/extraction, and shared utilities
public/       Optimized local visual assets
tests/        Content, search, progress, and relationship tests
docs/         Product, architecture, implementation, and status notes
```

The decorative topology background is stored at `public/backgrounds/knowledge-topology-dark.avif` with a WebP fallback. Both 3840 × 1646 assets are loaded locally—never from a runtime image URL—and remain below 40 KB. Dark mode presents the visual as the primary low-contrast atmosphere; light mode reuses it through a faint desaturated treatment and a stronger readability mask.

Content additions should begin in `content/` and satisfy `validateContent()`. Vietnamese metadata lives in `content/translations/`, while translated interface strings live in `i18n/messages/`. The shared block renderer exposes typed material consistently, while validation checks IDs, citations, topic links, graph connectivity, cycles, and prerequisite ordering before the content reaches a page.

Library files never leave the browser. Metadata and binary blobs are stored separately in IndexedDB; `localStorage` is not used for document contents. The metadata export intentionally excludes binary files.

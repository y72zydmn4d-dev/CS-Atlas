# CS-Atlas Engineering Constitution

This document governs future engineering work in this repository. Read it together with the active milestone, the relevant `docs/atlas-v2/` subsystem document, and any existing feature-specific architecture note before changing behavior.

## Product and architecture boundaries

- Build one learning platform around canonical knowledge concepts. Learn, Practice, Atlas, Roadmaps, Mind Maps, Library, progress, search, and AI are views or consumers of shared domain records, not unrelated applications.
- Keep content and domain logic independent of page components. Pages compose capabilities; components present them; services/adapters own I/O.
- Preserve Next.js App Router and Server Components by default. Add client boundaries only for browser interaction, browser persistence, React Flow, or other APIs that require them.
- Keep `content/` as the current authored content source during migration. Do not move data to a database or replace it wholesale without an approved milestone, migration, rollback, and parity checks.
- Keep roadmaps, mind maps, and `/atlas` semantically distinct. Roadmaps express learning sequence/dependency; mind maps express conceptual association; `/atlas` is a derived exploration view. They may resolve the same canonical concepts but do not share presentation-specific node records.
- Do not duplicate canonical concept metadata in lesson, problem, graph, resource, or progress records. Use stable IDs and validated typed relations.
- Keep implementation changes incremental. Preserve existing URLs, content, user-local data, accessibility, and useful UI behavior unless the milestone explicitly changes them and includes a migration plan.

## Repository conventions

- Use the existing npm package manager and `package-lock.json`; do not add another package manager.
- Follow the current top-level ownership: `app/` routes and API handlers, `components/` UI, `content/` authored registries, `i18n/` messages and localization adapters, `lib/` domain/services/adapters, `hooks/` browser hooks, `tests/` tests, `docs/` product and engineering documentation.
- Place future feature modules under an established boundary instead of creating a competing framework or parallel content tree. Update `docs/atlas-v2/05-directory-structure.md` when an approved milestone changes ownership.
- Use kebab-case for filenames, PascalCase for React components and exported types, camelCase for functions/variables, and stable kebab-case IDs for authored entities. Keep IDs independent of mutable labels and URLs.
- Reuse existing shell, localization, form, graph, content renderer, Library, Practice, and storage components where their responsibilities fit. Do not clone a component to change one label or route.
- Keep CSS in existing feature stylesheets or shared workspace tokens according to ownership. Do not add an alternate theme system or direct hard-coded theme values when a semantic token exists.

## TypeScript and domain model

- Preserve `strict: true`; avoid `any`, unchecked casts, non-null assertions, and broad catch-and-ignore logic. Narrow `unknown` at external boundaries with explicit validators.
- Model variants with discriminated unions. Give persistent/domain records explicit IDs, schema/version policy, timestamps where needed, and validators at import/API/storage boundaries.
- Keep canonical entities distinct from authored presentation records, user state, and derived projections. A graph node is not a concept; a progress event is not authored content; a Library relation is not an authoritative curriculum edge.
- Add educational entities in data registries, not page or component source. Large datasets belong in structured content modules or a later content store, with provenance and validation.
- Do not create duplicate definitions of language, difficulty, verdict, relation, locale, or status across features. Reuse the owning contract or introduce a deliberate shared type migration.
- Maintain backward-compatible ID and schema migrations for persisted browser data. Do not silently discard valid user records. Make destructive reset/export behavior explicit.

## Components, routes, and APIs

- Keep route files thin: validate route identifiers, load/resolve records, set metadata, and compose feature components. Put reusable business rules in `lib/`.
- Keep Server Components as the default. Never import server-only code into a client module. Mark secrets and reference solutions server-only and test the boundary.
- API handlers validate method, origin/CSRF posture, content type, request size, shape, authentication/authorization, rate limits, and response shape. Return stable error codes and avoid leaking secrets, raw provider errors, or private content.
- Use explicit service/repository interfaces for external services and persistence. Feature code must not reach around an adapter to use IndexedDB, localStorage, a provider SDK, or direct SQL.
- Keep API contracts versionable and resource-oriented. Validate both incoming and outgoing data. Make retries/idempotency explicit for writes and asynchronous jobs.
- Gemini and future provider credentials stay server-only. Browser bundles and logs must never contain credentials.

## Persistence and content migration

- Keep browser persistence behind `lib/storage.ts` for current local preferences/progress and behind `lib/library/repository.ts` for Library metadata and blobs. Components never access `localStorage` or IndexedDB directly.
- Treat local browser records as user-controlled and non-authoritative. Validate and migrate before use; never use local verdicts as trusted online judge scores.
- Before introducing remote persistence, decide identity/ownership, data export/delete, conflict handling, offline behavior, schema evolution, and migration/rollback. Do not assume that a hosted database or ORM is required before those needs are defined.
- Migrate content by mapping old IDs to canonical concept IDs, preserving aliases and route redirects, validating links and provenance, and measuring parity. Do not bulk-rewrite all content in one operation.
- Do not hard-code large new subject datasets in React. Do not make Library material official Atlas content; any future ingestion must be opt-in, reviewable, attributed, and reversible.

## Security and privacy

- Treat imported files, extracted text, URLs, saved links, user notes, code, and model output as untrusted data. Render text safely; validate URLs, relation IDs, file limits, and provider response shapes.
- Never log or execute document contents. Do not send Library documents, excerpts, embeddings, notes, or metadata to Atlas AI/provider APIs without separate explicit user authorization for the specific action and destination.
- Never execute untrusted user code in a Next.js route or main application server process, through host `eval`/`Function`, or in a shared trusted worker. Local Practice remains in its constrained QuickJS WASM Worker. Remote judging must use a separately operated, hardened isolation service behind a narrow queue/API contract; containers with default settings alone do not establish sufficient isolation.
- Keep Practice reference solutions and hidden tests out of browser imports. Public browser tests are not secret. Do not enable Submit or claim hidden-test certification until an isolated judge is independently reviewed.
- Apply authorization at the server boundary for every user-owned record. Authentication alone is not authorization. Do not trust client-supplied owner IDs, verdicts, progress, roles, or relation labels.
- Use least privilege, bounded payloads/timeouts/output, safe redirects, rate limiting, privacy-aware telemetry, and dependency updates. Never include private source code, document text, tokens, or personal data in routine logs.

## UX, accessibility, and reliability

- Preserve keyboard access, semantic HTML, visible focus, screen-reader labels, reduced-motion behavior, and light/dark themes.
- Provide a keyboard-accessible list or equivalent for any graph/canvas-only interaction. Keep mobile behavior and useful touch targets working.
- Every asynchronous or data-backed view needs loading, error, empty, and success states appropriate to its operation. Do not display fake progress or imply a remote save when data is only local.
- Keep layouts responsive without horizontal overflow, content overlap, or controls that become unreachable. Test narrow mobile and desktop widths for UI changes.
- Use bilingual English/Vietnamese interface messages together where the feature participates in localization. Clearly mark untranslated content rather than implying completeness.
- Respect existing visual identity and established design tokens. Redesign only within the approved milestone and preserve familiar routes and interaction affordances where useful.

## Testing, documentation, and completion

- Add focused tests for domain rules, validators, migrations, API boundaries, security properties, and meaningful user workflows. Avoid tests that only mirror implementation details.
- Test canonical ID resolution, relation validity, and migration parity whenever shared domain/content contracts change. For Practice contract changes, bump the problem version and verify references/public cases/canonical knowledge IDs.
- Preserve the locally served Practice vendor loader byte-for-byte; do not edit generated `public/practice-engine/` output.
- Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` for implementation handoff unless the task explicitly limits scope. Do not install dependencies without task authorization. Report any skipped command and why.
- Update `docs/STATUS.md` for material capability changes and update the relevant architecture/ADR/task documents when architecture or milestone scope changes.
- Inspect `git diff` and `git status` before handoff. State exact changed files, checks performed, known limitations, and any data or rollout risk. Never mark future work complete because planning is complete.
- Avoid unnecessary dependencies. Before adding one, check whether the platform or installed stack already provides the capability and document the maintenance/security reason.

## Current Next.js guidance

This repository uses Next.js 16. Before changing framework code, read the relevant guide under `node_modules/next/dist/docs/` resolved from this repository and follow current API/deprecation guidance. Keep the generated block below intact; Next may regenerate it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

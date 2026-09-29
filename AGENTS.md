# AGENTS.md

## Working agreement

- Keep TypeScript strict and preserve the data-driven content architecture.
- Add educational entities in `content/`; do not hardcode new subjects inside page components.
- Keep browser persistence behind `lib/storage.ts`.
- Keep Library metadata and binary persistence behind `lib/library/repository.ts`; components must never access IndexedDB directly.
- Treat imported files and extracted text as untrusted data: render as text, validate URLs and relations, and never log or execute document contents.
- Keep Gemini credentials server-only; the assistant must not read or transmit Library document content without a separate explicit user authorization.
- Practice solutions execute only in the QuickJS WASM Worker, never in a Next.js route or host eval/Function. Keep reference solutions server-only and out of browser imports; do not enable hidden Submit without separately reviewed isolation infrastructure.
- Bump a Practice problem's version when its test contract changes. Verify reference solutions, public cases, and canonical knowledge IDs in tests; preserve the locally served vendor loader byte-for-byte.
- Treat roadmaps and mind maps as separate graph models with separate intent.
- Keep `/atlas` membership/prerequisite exploration separate from authored roadmap and mind-map graphs; derive canonical node IDs and links in `lib/atlas-model.ts`.
- Keep workspace theme/motion tokens in `app/workspace.css`, bilingual UI messages paired in `i18n/messages/workspace.ts`, and a keyboard-accessible list alternative to graph-only interactions.
- Prefer Server Components; use client components only for interaction, browser storage, or React Flow.
- Preserve keyboard access, visible focus, mobile layouts, and both color themes.
- Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before handoff.
- Update `docs/STATUS.md` when product capabilities materially change.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI redesign — Task 1 checkpoint

STATUS: COMPLETE — audit and implementation-ready design package, documentation only (2026-09-30).

COMPLETED:
- Verified repository `/Users/trinhgiahuy/Documents/CS-Atlas`, branch `atlas-v2`, baseline HEAD `0d48165`.
- Read repository constitution. Documentation-only scope; no dependencies, routes, authentication, push, or merge.
- Existing unrelated modification: `next-env.d.ts`; preserve byte-for-byte and exclude from commit.
- Inspected root docs, subsystem docs, route registry, root layout, shell, Home, Learn catalog/lesson/curriculum, Practice, Explore/Atlas, Library, Progress, AI, Profile, Settings, search, theme/locale providers and CSS.
- Verified `e412274` release-budget commit exists in current history; later Learn work is now HEAD.
- Auth finding: NO PRODUCTION AUTH. No account routes, session service, middleware/proxy, provider SDK or auth dependency; Profile is anonymous browser-local. Provider API errors are not user authentication.
- Created evidence-backed audit with 15 prioritized findings and explicit source-versus-browser limitations.
- Persisted exact landing anatomy, bilingual copy, route alternatives/migration/rollback, guest journey, capability gating and future auth state/validation contract in 02.
- Created principles/roles/contrast calculations, density rules, 12-node/13-edge canonical graph, responsive/accessibility matrix and phased component/server-client/performance implementation plan.
- Self-review corrected graph enhancement to have no focusable aria-hidden buttons and distinguished the product's44px targets from WCAG AA's24px minimum.
- Read-only documentation validation passed: 7 documents, 11 relative links, balanced Markdown fences, all 12 node IDs and 13 relationships verified against the Topic seed AST/derived canonical semantics. Both `git diff --check` and `git diff --cached --check` passed; staged scope is exactly the seven documentation files below.
- Self-reviewed buildability, auth availability, route compatibility, mobile action priority, focus/graph fallback and performance assumptions.

KEY DECISIONS:
- Persist evidence and decisions here after every major phase.
- Inspect implementation before choosing layout, auth availability, and routing.
- Identity: a precise scientific knowledge map, opaque surfaces, indigo action color and restrained cyan relationship highlight; no 3D or animation dependency.
- Proposed route model C: `/` public front door, `/home` existing workspace Home, other feature/deep URLs unchanged. This is a Task 2 proposal only; no redirects or route edits in Task 1.
- Task 2 release uses an honest guest-first panel while auth is unavailable. Full sign-in/create/reset states are specified for a future real adapter; never collect credentials in an unavailable form.
- Desktop: editorial hero over a bounded meaningful graph on the left; 400px auth/entry panel on the right. Mobile: short identity then panel, graph below or omitted.
- Source-supported audit issues include layered style ownership, very small labels, internal terms in learner copy, curriculum focus visibility, width pressure, uneven local evidence coverage and duplicate mobile search access.
- SVG/CSS/HTML with server-resolved bounded canonical data; static by default, short relationship transitions and explicit opt-in24–32s whole-layer drift with pause. No React Flow on landing.
- Preserve local data, generated Practice assets, privacy/judge boundaries and Home creator footer. Disable automatic workspace prefetch from public entry links.

FILES:
- `docs/ui-redesign/PROGRESS.md`
- `docs/ui-redesign/00-current-ui-audit.md`
- `docs/ui-redesign/02-landing-auth-ux-spec.md`
- `docs/ui-redesign/01-design-principles.md`
- `docs/ui-redesign/03-visual-motion-system.md`
- `docs/ui-redesign/04-responsive-accessibility.md`
- `docs/ui-redesign/05-implementation-plan.md`

UNRESOLVED:
- Account provider/security/lifecycle and remote persistence remain a separate milestone; do not block the guest release.
- Browser QA, exact route transfer and rendered contrast remain Task 2 validation, not Task 1 claims.
- Password policy, verification/recovery/MFA, account privacy/legal, abuse ownership and local-to-account conflicts/consent require a separate approved auth/persistence ADR. Safe default is unavailable, no credentials or uploads.

REMAINING:
- No Task 1 design work remains. Final delivery uses exactly one local commit: `docs(ui): define CS Atlas landing design direction`. If interrupted during commit, verify git log/status for this subject before retrying. No push or merge.
- Production implementation/authentication are not complete. No production UI, route, dependency, domain/content or persistence change was made. docs/STATUS.md is unchanged because no capability shipped.
- `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` intentionally skipped for this documentation-only task. Build lifecycle can regenerate Practice assets/next-env; these checks remain required for Task 2 implementation handoff.
- The existing `next-env.d.ts` modification is excluded from the documentation commit; observed worktree blob `a419cbe4e3a5e8d4b481b851dbf4ac767de069e6` must remain unchanged.

NEXT EXACT TASK:
- Task 2: verify current branch/status/diff/log; read AGENTS.md and00–05 (start with02 and05), then repository-local Next16 guides. Implement public `/`, retain existing workspace Home at `/home`, add the minimal route-aware public/workspace shell, and build02's unavailable guest-first entry panel. Continue through05's phased plan and04's browser matrix. Do not install auth/animation dependencies or redesign application pages incidentally.

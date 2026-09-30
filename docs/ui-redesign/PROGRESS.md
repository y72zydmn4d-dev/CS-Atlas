# UI redesign — Task 1 checkpoint

STATUS: TASK 2 — IN PROGRESS. Milestones A/B/C complete; milestone D responsive/browser QA next (2026-09-30).

## Task 2 live checkpoint

COMPLETED:
- Verified Task 1 commit `95ffbc4`, branch `atlas-v2`, and repository root. No branch switch.
- Read all seven Task 1 documents and repository rules. Task 1 remains the design contract.
- Existing `next-env.d.ts` modification is unrelated; baseline blob `a419cbe4e3a5e8d4b481b851dbf4ac767de069e6`, exclude from every task commit.
- A: extracted the single workspace Home composition to components/home and exposed it at /home. Public / is a temporary minimal shell until B. RouteShell lazily mounts workspace providers only on non-root routes; deep URLs remain ungated. Sidebar/brand/footer Home links use /home; legacy Home breadcrumb literals normalize centrally without touching saved records.
- A committed as 27b2da6. B: implemented bilingual public header/hero, unavailable manual-activation account tabs, functional guest link, native local-data disclosures, capability strip/footer and scoped responsive light/dark styles. No credential fields, provider buttons, form submissions or fake auth.
- B committed as e12985a. C: canonical server projection (12 concepts/13 verified edges), 12/8/6-node responsive SVG plus HTML labels, native connection list, selection/hover/Escape and resolved Concept links. Static by default; opt-in desktop CSS whole-layer drift pauses without reset on selection/details/auth focus/offscreen/document-hidden; reduced motion excludes control and drift.

FILES CHANGED:
- A: app/layout.tsx, app/page.tsx, app/home/page.tsx; components/route-shell.tsx, workspace-providers-shell.tsx, app-shell.tsx, breadcrumbs.tsx, home/workspace-home-page.tsx, home/author-footer.tsx; lib/capabilities.ts, lib/routes.ts; tests/route-shell.test.tsx, routes.test.ts, workspace-ui.test.tsx, author-footer.test.tsx; this checkpoint.
- B: components/landing/{public-landing-shell,landing-header,landing-hero,auth-panel,local-data-disclosure,capability-strip}.tsx; app/landing.css, app/layout.tsx, app/page.tsx; i18n/messages/{landing,en,vi}.ts; lib/routes.ts; tests/{landing,routes}.test.*; this checkpoint.
- C: content/landing/knowledge-preview.ts, lib/concepts/landing-projection.ts, components/landing/{knowledge-atlas-visual,use-landing-motion}.tsx/.ts, app/page.tsx, app/landing.css, tests/{landing-projection,knowledge-preview}.test.*; this checkpoint.

VALIDATION PASSED:
- A: npm run typecheck, npm run lint, npm test (46 files /238 tests) passed. Task 1 commit confirmed.
- B: typecheck, lint, tests passed (47 files /242 tests), including unavailable mode switching, keyboard focus, locale, guest href, credential absence and preserved progress.
- C: typecheck/lint passed; tests passed (49 files /248 tests). Initial lint ref-object taint fixed by destructuring callback/state; canonical Python slug test corrected to topic-python. One existing search timing-budget test transiently exceeded100ms while commands overlapped; isolated full rerun passed. No budget relaxed.

KNOWN ISSUES:
- No production auth. Per02/05, unavailable modes collect no credentials; password visibility/validation tests are not applicable until a real auth milestone. Test absence of credential collection instead.
- Browser visual/layout/keyboard checks, production build and public bundle measurement pending D/E. No dependencies added.

UNRESOLVED:
- Real auth/password/provider/sync policy remains outside Task 2.

EXACT NEXT ACTION:
- Commit C. Build production app and inspect dedicated QA browser at target widths, themes/locales and reduced motion; fix only landing/shell regressions, then validate/commit D. Preserve unrelated next-env.d.ts baseline if Next regenerates it.

## Task 1 retained design record

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

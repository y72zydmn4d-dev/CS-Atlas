# UI redesign — resumable checkpoint

STATUS: TASK 3 — COMPLETE. Visual audit and implementation-ready polish specification; documentation-only handoff.

## Task 3 live checkpoint

COMPLETED:
- Verified repository/atlas-v2, HEAD915d15f and completed Task2 milestone commits. Current origin points to the same HEAD; no remote operation performed.
- Preserved unrelated next-env.d.ts baseline blob a419cbe4e3a5e8d4b481b851dbf4ac767de069e6.
- Read AGENTS/TASKS/DECISIONS/README, all00–06 design/QA documents and actual landing CSS, components, projection, motion hook, messages and capability destinations.
- Created07 source-backed audit with6 P0,7 P1 and2 optional P2 items; no production edits.
- Created08 exact polish specification and09 Task4 milestones/QA plan. Defined frame/fold budget,12/8/6-node coordinate sets, rank/edge/neighbor states, static depth, guest-first panel, capability navigation and responsive behavior.
- Self-reviewed07–09 for implementation scope, precedence over old visual values, responsive geometry, unavailable auth, accessibility and performance. Local Markdown links resolve; nominal node envelopes at1440/1600/1280/1024/tablet have≥12px inset/pairwise clearance. This arithmetic does not certify rendered font wrapping or edge paths.
- Documentation diff whitespace check passed. Production tests/lint/typecheck/build intentionally not rerun for documentation-only Task3;06 remains historical evidence. next-env.d.ts baseline hash unchanged. One local documentation commit is the final checkpoint, identifiable by subject `docs(ui): define landing visual polish direction`.

KEY FINDINGS:
- Uniform4×3 graph geometry, near-equal ranks and absent neighbor emphasis weaken the knowledge metaphor. Account explanations precede the functional guest action; surface hierarchy is flat.
- Task2's remaining browser matrix is not signed off. New browser discovery returned no controllable browsers; native active-window control was not used. No fresh screenshots claimed.
- Preserve existing concepts/copy/routes/auth boundary. Refine hierarchy, not architecture: four graph anchors, two bridges, curved box-aware edges; Guest before account tabs. Default motion remains off; optional whole-layer32s drift only.

P0 ITEMS:
- P0-1 composition/fold budget; P0-2 graph ranks/coordinates; P0-3 curved box-aware edges; P0-4 direct-neighbor emphasis; P0-5 guest-led entry panel; P0-6 scoped depth hierarchy.

P1 ITEMS:
- Typography, header utility balance, capability navigation band, duplicate footer disclosure, consolidated graph utilities, narrow-layout alignment and restrained opt-in motion.

UNRESOLVED:
- Rendered label/path clearance, final theme contrast and responsive screenshots must be verified during Task4 in an isolated browser. No auth or routing decision is needed for this polish.

FILES CREATED:
- docs/ui-redesign/07-visual-polish-audit.md
- docs/ui-redesign/08-landing-polish-spec.md
- docs/ui-redesign/09-task-4-implementation-plan.md
- Updated docs/ui-redesign/PROGRESS.md.

NEXT EXACT TASK:
- Task4: verify current branch/status/log and read this checkpoint plus07–09. Start milestoneA in app/landing.css:08 §2–3 headline-aligned panel,16px hero-to-graph gap, scoped typography/header/surface roles. Keep graph geometry and entry ordering for milestonesB/C; validate and persist after each milestone. Do not implement auth or change routes.

## Task 2 retained implementation record

STATUS: IMPLEMENTATION COMPLETE; AUTOMATED VALIDATION PASSED. Manual browser sign-off remains explicitly outstanding (2026-09-30).


COMPLETED:
- Verified Task 1 commit `95ffbc4`, branch `atlas-v2`, and repository root. No branch switch.
- Read all seven Task 1 documents and repository rules. Task 1 remains the design contract.
- Existing `next-env.d.ts` modification is unrelated; baseline blob `a419cbe4e3a5e8d4b481b851dbf4ac767de069e6`, exclude from every task commit.
- A: extracted the single workspace Home composition to components/home and exposed it at /home. Public / is a temporary minimal shell until B. RouteShell lazily mounts workspace providers only on non-root routes; deep URLs remain ungated. Sidebar/brand/footer Home links use /home; legacy Home breadcrumb literals normalize centrally without touching saved records.
- A committed as 27b2da6. B: implemented bilingual public header/hero, unavailable manual-activation account tabs, functional guest link, native local-data disclosures, capability strip/footer and scoped responsive light/dark styles. No credential fields, provider buttons, form submissions or fake auth.
- B committed as e12985a. C: canonical server projection (12 concepts/13 verified edges), 12/8/6-node responsive SVG plus HTML labels, native connection list, selection/hover/Escape and resolved Concept links. Static by default; opt-in desktop CSS whole-layer drift pauses without reset on selection/details/auth focus/offscreen/document-hidden; reduced motion excludes control and drift.
- C committed as b726ac8. D: compacted mobile entry spacing, kept44px language targets at320px, clarified graph subset semantics, separated short curved edges from shared long corridors, restored selected-tab entry focus after leaving unactivated tabs, tested document-hidden/offscreen motion pauses.
- Native Chrome QA: inspected dark English1440×900 and light Vietnamese1600×900 (plus initial ~1154px compact layout), no obvious overlap;1440 DOM measured scrollWidth1440 and guest top413px. Console had no application errors. Tab browser APIs unavailable; native focus subsequently switched to unrelated user window. Stopped native interaction to avoid interfering. Remaining matrix must be manually reviewed; not claimed passed.
- E discovery: initial public requests included a83,953-byte gzip learning-record chunk through shared providers importing the full storage facade. Extracted preference-only storage leaf preserving exact legacy keys/encoding, updated providers and added compatibility/restricted-storage tests; these E files are uncommitted until final audit.
- D committed as48f42b1. E complete: lightweight preference leaf removes canonical learning records from initial public scripts; metadata and a real workspace-chunk loading fallback added; graph observes its actual graphic for offscreen pause;44px brand target and bounded graph label blocks. Ownership/status/discovery docs updated; reproducible local-only route/asset audit added.
- Final checks and self-review complete. No real auth, data migration, dependency addition, full app redesign, push, merge or branch switch. Only this task's QA server was stopped; dedicated native QA window may remain open.

FILES CHANGED:
- A: app/layout.tsx, app/page.tsx, app/home/page.tsx; components/route-shell.tsx, workspace-providers-shell.tsx, app-shell.tsx, breadcrumbs.tsx, home/workspace-home-page.tsx, home/author-footer.tsx; lib/capabilities.ts, lib/routes.ts; tests/route-shell.test.tsx, routes.test.ts, workspace-ui.test.tsx, author-footer.test.tsx; this checkpoint.
- B: components/landing/{public-landing-shell,landing-header,landing-hero,auth-panel,local-data-disclosure,capability-strip}.tsx; app/landing.css, app/layout.tsx, app/page.tsx; i18n/messages/{landing,en,vi}.ts; lib/routes.ts; tests/{landing,routes}.test.*; this checkpoint.
- C: content/landing/knowledge-preview.ts, lib/concepts/landing-projection.ts, components/landing/{knowledge-atlas-visual,use-landing-motion}.tsx/.ts, app/page.tsx, app/landing.css, tests/{landing-projection,knowledge-preview}.test.*; this checkpoint.
- D: app/landing.css, components/landing/{auth-panel,knowledge-atlas-visual}.tsx, i18n/messages/landing.ts, lib/concepts/landing-projection.ts, tests/knowledge-preview.test.tsx, this checkpoint.
- E currently modified: app/page.tsx (landing metadata), components/{locale-provider,theme-provider}.tsx, lib/storage.ts, lib/storage/preferences.ts, tests/browser-preferences.test.ts. next-env.d.ts baseline restored after Next build regeneration; do not stage.
- E commit files also include app/landing.css, components/{route-shell,landing/knowledge-atlas-visual}.tsx, tests/landing.test.tsx, scripts/audit-public-entry.mjs, docs/{ARCHITECTURE,STATUS}.md, docs/atlas-v2/05-directory-structure.md, docs/ui-redesign/{05-implementation-plan,06-task-2-qa,PROGRESS}.md. Full A–E changed-file inventory is available from git diff95ffbc4..HEAD; exclude next-env.d.ts.

VALIDATION PASSED:
- A: npm run typecheck, npm run lint, npm test (46 files /238 tests) passed. Task 1 commit confirmed.
- B: typecheck, lint, tests passed (47 files /242 tests), including unavailable mode switching, keyboard focus, locale, guest href, credential absence and preserved progress.
- C: typecheck/lint passed; tests passed (49 files /248 tests). Initial lint ref-object taint fixed by destructuring callback/state; canonical Python slug test corrected to topic-python. One existing search timing-budget test transiently exceeded100ms while commands overlapped; isolated full rerun passed. No budget relaxed.
- D/E worktree: typecheck, lint, tests (50 files /251 tests), production build (736 generated pages) and audit:build passed. Build total915,766B gzip; largest148,115B; largest route10,447B. Recheck after final QA fixes.
- FINAL: typecheck, lint, tests50 files /253 tests, production build736 pages, audit:build all passed. Final build total915,862B gzip, largest148,115B, largest route10,447B. No failed command hidden; earlier transient search timing test passed on isolated rerun without threshold change.
- FINAL HTTP/asset audit:16 routes200; / public without workspace shell/credentials; /home and deep routes retain SSR workspace. Modern initial JS10 files /168,400B gzip including shared framework/providers; root route4,386B. Initial asset marker checks exclude full canonical content and React Flow/QuickJS/PDF.js/Mammoth.
- Final typecheck re-passed after restoring original unrelated next-env.d.ts blob a419cbe4e3a5e8d4b481b851dbf4ac767de069e6. Generated Practice vendor/package manifests unchanged. git diff --check passed. Token contrast arithmetic recorded in06; not a browser contrast certification.

KNOWN ISSUES:
- No production auth. Per02/05, unavailable modes collect no credentials; password visibility/validation tests are not applicable until a real auth milestone. Test absence of credential collection instead.
- Manual viewport/keyboard/reduced-motion/zoom/screen-reader matrix partially unverified because browser automation has no isolated tab control. Only the observed desktop checks above are passed.
- Final public asset/route audit passed; task-owned server stopped. No dependencies added. Real auth/sync intentionally absent, not a fake success flow.

UNRESOLVED:
- Real auth/password/provider/sync policy remains outside Task 2.

REMAINING:
- No implementation or automated validation remains for A–E. Manual browser/assistive-technology sign-off remains: final1280/1024/tablet430/390/320/landscape/zoom, both themes/locales, keyboard, reduced motion, guest client navigation and fresh network/console review. See06 for exact matrix. Earlier desktop observations do not certify final mobile code.
- Real credentials/providers/recovery/sync/account ownership remain a separately approved milestone. Do not begin them from this checkpoint.

EXACT NEXT ACTION:
- Create the local E commit perf(landing): isolate preferences and verify public entry; verify HEAD/status and exclude next-env.d.ts. If resuming, inspect git log first: if that subject is already committed, do not repeat it. Then begin06's manual sign-off in an isolated controllable browser context (no user-window interference), starting390×844 Vietnamese/light guest reachability. Run npm run start -- --port3010 after a build and node scripts/audit-public-entry.mjs http://localhost:3010. Record verified results/fix only landing regressions before broader UI work.

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

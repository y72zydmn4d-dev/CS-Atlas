# 09 — Task 4: bounded landing polish implementation

Primary build contract: [08](08-landing-polish-spec.md). Priorities/evidence: [07](07-visual-polish-audit.md). Task 3 modified documentation only. Start from the actual worktree, not an assumed clean checkout or the Task1 implementation plan.

## Start / resume exactly

1. Run `git rev-parse --show-toplevel`, `git branch --show-current`, `git status --short --branch`, `git log --oneline --decorate -20`. Expected CS-Atlas / atlas-v2. Do not switch branches, push, merge or discard work.
2. Read AGENTS.md, TASKS.md, DECISIONS.md, README.md, PROGRESS,07–09 and relevant00–06 contracts. Task3 baseline is915d15f; verify newer commits before editing. Preserve unrelated next-env.d.ts (Task3 baseline blob `a419cbe4e3a5e8d4b481b851dbf4ac767de069e6`); do not stage generated changes.
3. Read current landing sources and existing tests. Before framework changes, read local Next16 guides under `node_modules/next/dist/docs/`; this task should not need route/layout restructuring.
4. Set PROGRESS to `TASK 4 — LANDING POLISH IN PROGRESS`; record active milestone, files, completed work, validation, known issues and exact next action. Preserve Task1–3 records. Capture baseline `/` in an isolated browser if available; do not reuse native active-user-window control.
5. Begin milestone A in `app/landing.css` and existing landing components. Do not begin with an auth/graph library installation or redesign the spec.

## Scope / change budget

Allowed: landing-scoped CSS and component presentation, bounded graph coordinates/ranks/path helpers, paired landing messages, targeted tests and review documentation. Retain Server/Client boundaries and serialized public projection. New geometry helper only if separation improves testability; keep it within `lib/concepts/` landing ownership. Keep current component tree rather than creating a second landing.

Not allowed: route policy changes, middleware, credentials/providers/sessions, canonical metadata/relations changes, storage migration, guest authorization flags, learning content changes, other app redesign, font/library installation, generated Practice vendor edits. Accounts remain unavailable. Task4 implements only the visible refinements in08; future auth sections in02/05 are not implementation instructions for Task4.

## Milestones

Each milestone: inspect diff/status; run `npm run typecheck`, `npm run lint`, `npm test`; record actual outcomes and browser gaps in PROGRESS before a local semantic commit. Do not claim visual pass from DOM tests. Keep commits confined to task files; no push/merge. If an intermediate visual state is intentionally unfinished, record exactly which later milestone completes it.

| Milestone | Likely files | Acceptance / validation | Risk / impact |
|---|---|---|---|
| **A — Composition and editorial hierarchy** |`app/landing.css`; `components/landing/{landing-header,landing-hero,public-landing-shell}.tsx` only if alignment markup needed; `tests/landing.test.tsx`; PROGRESS |Apply08 frame/spacing/type/header. Panel aligns with headline; no third column. Preserve hero→entry→graph DOM and mobile flow. Introduce scoped surface roles. Baseline screenshots at1440/1280/390 in both themes; core first-screen budget, no cropped focus. Keep graph at current geometry until B. |Low–medium / high. Suggested `style(landing): refine composition and surface hierarchy` |
| **B — Knowledge hierarchy and relationship geometry** |`content/landing/knowledge-preview.ts`; `lib/concepts/landing-projection.ts` (or focused landing geometry helper); `components/landing/{knowledge-atlas-visual,use-landing-motion}.tsx/.ts`; `app/landing.css`; `tests/{landing-projection,knowledge-preview}.test.*` |12 unchanged IDs/13 unchanged relations;4 anchors/2 bridges/6 supports;08 coordinates and responsive subsets; safe curved paths; active+neighbor states. Consolidated native details utility row. Motion static by default,3px/2px32s opt-in, pointer pause added, all existing pause reasons retained. Browser1280/1024/820 EN/VI label/path clearance, hover/restored selection and keyboard list. |Medium–high / highest. This is the only L-sized work. Suggested `feat(landing): refine knowledge atlas hierarchy` |
| **C — Guest-led entry surface** |`components/landing/auth-panel.tsx`; `app/landing.css`; `i18n/messages/landing.ts`; `tests/landing.test.tsx` |Exact08 order: title/subtitle→Guest→scope/disclosure→account options/tabs→single unavailable message. No form/input/backend. Preserve manual arrow/Home/End tab behavior and leaving-tab focus reset. Guest first among panel controls, real/home link; local retention/export copy unchanged. Test EN/VI, both modes, expanded local disclosure, mobile guest reach. |Medium / high. Suggested `style(landing): make guest entry the primary path` |
| **D — Capability band and footer** |`components/landing/{capability-strip,public-landing-shell}.tsx`; `app/landing.css`; `tests/landing.test.tsx` |Use existing capability records for destinations, no central route edits. Four links at≥1280,2×2 tablet,hidden mobile; prefetch=false. Remove footer's duplicate disclosure only. Check navigation semantics, single remaining complete data disclosure, focus and wrapping. |Low / medium. Suggested `style(landing): refine capability navigation band` |
| **E — Responsive and theme refinement** |Primarily `app/landing.css`; earlier landing files only for discovered visual defects; paired messages only if needed |Complete all widths/themes/locales below; render/measure actual label boxes and focus boundaries. Align tablet main to440px; no graph on mobile. Verify text/icon contrast, forced colors, reduced motion, scrollWidth and no-JS Guest. Make only scoped corrections; record deviations >12 graph units. |Medium / high. Suggested `fix(landing): polish responsive and accessible states` |
| **F — Final QA and handoff** |PROGRESS; a new `docs/ui-redesign/10-task-4-qa.md`; `docs/STATUS.md` for implemented polish status; production files only for confirmed scoped defects |Run full commands below, isolated browser matrix, route smoke/public-JS census; inspect diff boundaries. Record screenshots/measurements, exact failures/skips, commits, remaining manual review. Do not update06 historical Task2 passes as if newly rerun. |Low implementation / essential evidence. Suggested `docs(ui): record landing polish verification` |

## Focused tests to change, not indiscriminate snapshots

- `tests/landing.test.tsx`: guest precedes account modes in DOM; new unavailable messages replace old strings; no credentials/providers; one complete local-data disclosure; all four capability links use registry destinations and disabled prefetch; shared theme/locale and local-record-preservation tests retained.
- `tests/landing-projection.test.ts`: preserve canonical names/URLs/relations,12/8/6 subsets, invalid record rejection and<12KiB serialization. Replace exact old Manhattan-path string assertion with deterministic geometry invariants: finite bounded coordinates, valid ports, arrows only for prerequisites, no crossing label exclusion rectangles in representative measured-size fixtures. Sampling curves is an approximation; browser inspection remains necessary.
- `tests/knowledge-preview.test.tsx`: direct neighbors emphasized but transitive/nonincident nodes not misrepresented; hover temporarily overrides then restores selection; list selection and Escape retain focus; no focusable aria-hidden controls; pointer hover pauses opted-in motion; existing hidden/offscreen/selection/reduced-motion tests remain. Resize/locale updates should settle without render loops.
- Existing route-shell/routes/workspace tests remain unchanged unless a genuine landing expectation moved. Passing all tests confirms no intended route change; don't weaken tests to make a visual patch pass.

## Browser QA matrix / evidence

Use an isolated browser context and dedicated localhost port; no user-data reset. If unavailable, state the blocker and leave visual sign-off outstanding. Native control following the user's active window is not an acceptable workaround.

| Viewport | Required proof |
|---|---|
|1600×900,1440×900 |Both themes/locales; complete hero/graph/Guest first view, balanced panel alignment, lower strip subordinate. Record panel/graph bounding boxes and screenshot. |
|1280×800 |12 readable labels, no endpoint detachment or edge-through-label,384px panel, four-column capability strip. |
|1024×768 |8 nodes,360px panel, no motion control, long EN/VI labels fit. |
|820×1180 |440px aligned hero/panel/six-node sample; adequate touch targets; no isolated narrow card floating within a broad text column. |
|430×932,390×844 |Guest completely visible by≤600px target in EN/VI, no graphic/blank graphic region, all controls reachable. |
|320×640,667×375,200% zoom and narrow reflow |No horizontal scroll/clipped outlines or unreachable controls; ordinary vertical scrolling. Short tablet graphic omitted. |

At representative desktop/mobile widths capture rest, hovered neighborhood, persistent selection/list, both account tabs, expanded data disclosure and keyboard focus. Test actual prefers-reduced-motion; initial off state; user-enabled motion then pointer/auth focus/hidden/offscreen pauses. Check no-JS guest/Browse entry and graph omission fallback. Test theme/locale switch without data loss. Screen-reader check must cover tab roles, disclosure and selection announcement; no hover announcements.

Measure `scrollWidth` **and element bounds**; global hidden overflow can conceal defects. Record actual contrast of text/controls over the new field/panel; token arithmetic alone is insufficient. Use04 targets. No numerical “premium score” or screenshot comparison from an unobserved viewport.

## Final commands / performance

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run audit:build
npm run start -- --port 3010
```

In a separate terminal while that dedicated server runs:

```sh
node scripts/audit-public-entry.mjs http://localhost:3010
```

Only stop the server started for this task. Preserve next-env.d.ts pre-task contents if Next regenerates it; never stage unrelated changes. Compare initial public JS with168,400B gzip Task2 baseline (shared scripts counted); target polish delta≤5KiB. Retain existing aggregate build budgets and absence of heavy graph/Practice/PDF runtimes from public initial downloads. No continuous JS animation, forced layout loop or increased serialized content registry. Lab/field CWV remain unmeasured unless explicitly measured and documented.

Smoke `/`, `/home`, `/learn`, `/learn/python`, `/practice`, `/explore`, `/library` and existing audit-script route set. ConfirmGuest→/home, direct feature entry ungated, no auth/provider/network request on account-tab changes and no learning/Library reads introduced on public root.

## Definition of done / rollback

- All6 P0 and7 P1 items in07 implemented and verified, or specifically recorded as unresolved—not silently omitted. P2 can be skipped without compromising completion.
- Resting dark and light page communicates the same hierarchy without animation. Graph neighborhoods are meaningful, readable and visually distinct; panel celebrates the currently working guest path.
- No production auth, architecture migration, dependency or unrelated feature change. Relevant tests/typecheck/lint/build pass; actual browser gaps remain clearly separate from automated passes.
- Progress/QA docs identify exact files, commits, measurements and manual limits. Commit locally only, with task-specific staging and pre-commit diff review.
- Rollback is limited to Task4 presentation commits; no storage/content migration to reverse. Do not use hard reset or overwrite unrelated user edits.

**Exact first implementation action:** after safety/read checkpoints, edit `app/landing.css` for08 §2–3 desktop alignment,16px hero-to-graph spacing and scoped header/type/surface roles; leave graph-coordinate and entry-order changes to B/C. Validate milestone A, update PROGRESS and create the first local scoped commit.

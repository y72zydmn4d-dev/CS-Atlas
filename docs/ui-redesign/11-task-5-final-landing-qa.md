# Task 5 — final targeted landing polish

2026-10-01 · baseline009875f · refine, not replace, Task3/4 direction. Human review supplied seven composition issues. Implementation/source evidence below is **not rendered browser sign-off**.

## Seven objectives

| Objective | Implemented refinement |
|---|---|
|1. Scale |Wide frame cap1600 instead1440; graph column1008 instead848 at1600 (+19%). Headline64/68 instead56/60. No transform scaling. |
|2. Viewport height |Wide graph `clamp(400px,46svh,450px)`:414 at900h (+15%),450 at1080h (+25%). Extra height belongs to the actual map, not a blank spacer or new section. Short desktop keeps360. |
|3. Entry integration |Shared headline baseline retained; panel416 instead400, gap48 instead64. Same opaque surface and Guest-first content; no stretching or overlap. |
|4. Two focal anchors |Existing Programming Fundamentals and Machine Learning Fundamentals only: wide180px boxes,18px650 labels,12px cores. Other ranks untouched. Landing-authored focal flags, not canonical changes. |
|5. Relationship depth |Resting ordinary/focal/active edges .65/.9/1 opacity; related .45/.75/1, arrows/dashes retained. Active/dimmed override resting depth. One Python→ML curve approach refined for larger exclusion box, with near-collinear join tangents. No new edges, coordinates, glow or motion. |
|6. Capability affordance |Native registry links gain64px padded target,15px label, edge-aligned18px arrow and surface-2 hover/focus well. No resting cards or extra icons/content. |
|7. Dead space |Wide caption minimum72→56, main bottom24→16, band padding16→12. Caption/detail/disclosure still grow naturally; footer remains minimal/nonsticky. Frame/graph expansion consumes unused canvas. |

All seven implemented; final perceptual approval requires human review. Copy, graph state,12 concepts/13 relations, routing, local storage, unavailable account modes and shared theme system unchanged. No dependency, font, image, heavy runtime, timer or animation added.

## Responsive/source review

| Viewport | Left / gap / panel; graph; headline |
|---|---|
|1600×900 |1008 /48 /416;414px;68px |
|1440×900 |880 /48 /416;414px;64px |
|1920×1080 |1600px bounded frame,1008 /48 /416;450px;68px |
|1280×800 |Unchanged768 /48 /384;360px;48px |
|1024×768 |Unchanged552 /32 /360;280px8-node sample;44px |
|820×1180 |Unchanged aligned440px column/panel;232px6-node sample;36px |
|430×932 /390×844 |Unchanged390/350px available column; no graphic/band;32px headline; Guest first |
|Short desktop≤719h /320 /zoom |Wide graph360 and focal sizing off; existing short/tablet/mobile rules and normal scroll retained |

These are CSS arithmetic and source checks, not measured browser bounds. Wider geometry uses the same normalized coordinates and single ResizeObserver to map actual CSS-pixel label sizes to SVG units. Regression fixtures retain old stages and add880×414,1008×414,1008×450 plus conservative768×360 fallback. Three envelope patterns sample finite curves, safe inset and≥5px clearance; actual EN/VI glyph wrapping remains manual QA.

## Accessibility/themes/performance

- Existing native relationship list, manual tabs, announcements, Escape, visible3px focus,≥44px targets and no-JS Guest link preserved. No focus order or credential collection change.
- Reduced motion/static default and all opt-in pause reasons unchanged. Focal labels do not dim through parent opacity. New effects are only CSS color/surface emphasis.
- Dark and light reuse existing surface-2/accent/relationship roles; Guest colors unchanged. Forced-colors remains system-color based. No new luminance/glow recipes. Real composited contrast/focus still requires browser review.
- No per-frame JS/measurement. Initial modern public JS168,906B gzip (9 scripts), root5,113B and aggregate916,550B: each +29B versus Task4. Shared framework/providers included; script census is not a runtime/CWV/thermal benchmark. No materially increased bundle or dependency.

## Validation / completion checkpoint

- A: typecheck/lint pass; local61613a4.
- B: typecheck/lint and51 files/285 tests pass; local166164a. Two intermediate curve trials exposed fallback/Recursion clearance issues; final route passes all28 geometry tests without weakened assertions.
- C: typecheck/lint pass; local6461fff. D: source and automated geometry regression review complete; no separate responsive fix required. Actual browser review remains below.
- Final `npm run typecheck`, `npm run lint`, `npm test`: pass;51 files/285 tests, search timing42.84ms against unchanged100ms budget.
- `npm run build`: pass;736 generated pages. `npm run audit:build`: pass;99 chunks,916,550B aggregate gzip, largest148,115B, largest route10,447B. Unchanged limits1,500,000/200,000/100,000B.
- `node scripts/audit-public-entry.mjs http://localhost:3010`: pass;16 routes200; root public/no credential collection, directly available SSR workspace/deep routes, no full canonical/heavy runtime asset leak. Additional local `/problems` GET200. No routing/shared-workspace production files modified.
- After Next regenerated imports, restored only that generated delta to the exact pre-existing next-env.d.ts blob a419cbe4e3a5e8d4b481b851dbf4ac767de069e6; typecheck re-passed. This file remains unstaged. Package/Practice vendor output unchanged. `git diff --check` passes.
- Only the task-owned port3010 production server was started/stopped; no user browser or user-local storage was touched. Final QA commit identifiable by `docs(ui): freeze landing after final targeted polish`.

Task5 implementation and required automated validation complete. Exact changed-file inventory: `git diff 009875f..HEAD --name-only`. Production changes limited to landing.css, knowledge-atlas-visual, authored knowledge-preview and its landing-projection presentation type; geometry regression fixtures plus QA/PROGRESS/status documentation. Historical07–10 unchanged. No auth, content curriculum, route, storage or workspace change.

## Remaining human sign-off (freeze gate)

Safe browser discovery returned no apps/browsers and native pipe startup failed. No screenshots, console inspection or live keyboard measurements claimed. Do not follow an unrelated active user window.

Use an isolated browser/origin, both locales:1600×900 dark first,1440×900,1920×1080,1280,1024,820,430,390;1600×900 light and representative light laptop/mobile. Confirm seven objectives perceptually, no actual horizontal overflow/clipped labels or paths, full graph/Guest discoverability, short desktop and zoom. Check Guest→/home, links, both account modes, local disclosure, hover→selection restore/list focus, reduced motion, keyboard/focus and console. Check /home and /learn for unchanged workspace surfaces. No real user data reset.

Landing visual redesign frozen pending this human sign-off. No additional redesign phase/wishlist; change only confirmed scoped regressions, then stop. Preserve unrelated next-env.d.ts blob a419cbe4e3a5e8d4b481b851dbf4ac767de069e6 unstaged. No push/merge.

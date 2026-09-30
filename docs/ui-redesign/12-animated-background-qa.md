# Animated landing background QA

Status: FINAL HUMAN-REQUESTED ATMOSPHERIC TUNING — COMPLETE. LANDING — FROZEN PENDING HUMAN SIGN-OFF. Required automated/build checks pass; rendered sign-off outstanding.

## Latest tuning — source of truth

Human review found the original aurora too faint/peripheral and effectively static. This section supersedes original intensity/position/motion values below, **only on desktop≥1280px**. Layout, edge paths/point count, Knowledge Atlas data/geometry/interactions, Guest/auth/routes/band unchanged.

| Background treatment | Current target |
|---|---|
| Primary dark wash |15% accent × .75 opacity =11.25% peak before falloff/mask; ellipse center40%/62%, inward and lower behind map. |
| Secondary dark wash |12% relationship × .7 =8.4% peak; ellipse center64%/48%, toward inter-column space, opaque panel stays isolated. |
| Central depth |One additional **static** broad indigo ellipse,4% × .65 =2.6% peak;54%-wide/max1000px plane, no spotlight/glow/animation. |
| Edge contours / points |Exact existing geometry/count retained; dark main contour12% × .55 =6.6% peak; points24% × .25 =6% peak, no halos. |
| Light adaptation |Primary3%, secondary1.75%, core .65% effective peaks, light contour/points unchanged. Not dark opacity copied onto paper. |
| Responsive |Both moving planes78%-wide/max1600px; outer paint bounds remain2400×1200. Tablet/mobile original reduced-opacity/static rules unchanged, central plane omitted. |

- Motion defaults **on for background**, after desktop/no-reduced-motion eligibility; graph drift retains its static initial state. Minimal shared-control/data-attribute wiring only, no graph rendering or state-machine rewrite.
- “Pause motion” stops atmosphere and any opted-in graph drift; “Enable gentle motion” resumes both (preserving the prior explicit graph opt-in). Existing selected/list/hover/offscreen/document-hidden and entry-focus pause signals retained. Pauses stay respected after eligibility/reduced-motion changes.
- Primary56s,36px/-20px excursion; secondary83s,-28px/16px; ease-in-out alternate, -14s/-37s phase offsets avoid a motionless/synchronized startup. No animated filter, scale, size or React frames. Central field/contours static, tiny marker113s cycle unchanged.
- Reduced motion remains completely static; phone/tablet remain static, no added animation complexity. Decoration remains hidden/non-focusable/pointer-transparent; opaque graph-label backings and panel unchanged.
- Conservative all-layer maximum overlap (base+both washes+core+one primary contour+brightest marker) gives main/secondary contrast **dark7.77/4.66:1; light10.71/4.63:1** using current theme tokens. Ignores mask/radial falloff; not a rendered contrast certificate. No essential foreground colors brightened to fight atmosphere.
- Source/DOM tests cover background default-on vs graph default-off, pause/resume, pointer/selection/hidden/offscreen pause and dynamic reduced-motion change with explicit pause retained. Actual CSS timing/visual intensity remains manual.

### Latest validation and remaining sign-off

- `npm run typecheck`, `npm run lint`, `npm test` pass:51 files/287 tests, search44.73ms under unchanged100ms budget. Typecheck re-passed after restoring only build-generated changes to unrelated next-env's original hash a419cbe4e3a5e8d4b481b851dbf4ac767de069e6.
- `npm run build`736 pages; `npm run audit:build`99 chunks/916,587B gzip, largest148,115B, largest route10,447B: all unchanged budgets pass. Aggregate +37B versuscbd5e00. Public initial9 scripts168,943B/root5,150B: +37B each. CSS source +1,421B/gzip+207B (not emitted network measurement). No dependencies or added lifecycle/frame loop; central field static, same two animated planes now wider but capped1600px. GPU/thermal cost unmeasured.
- Existing `audit-public-entry.mjs` passes16 route/asset/boundary checks; `/problems`200. Local HTML: one atmosphere atroot, zero at/home,/learn. Only task-owned3010 server used/stopped. These are HTTP/HTML checks, not rendered browser navigation. `git diff --check` passes, unrelated next-env excluded from staging; no push/merge.
- Safe browser discovery again failed (no apps/browsers, native pipe startup failure). No new rendered screenshot/console/overflow/motion verification claimed.
- Human check:1600×900 dark first,1440×900 dark,1280 dark. Observe **10–15s without activating motion**; verify immediate atmospheric depth, slowly perceptible change, map/Guest dominance and readable body copy. Test pause/resume, tab hide/return, graph/entry focus and reduced motion. Then1600 light and430/390 regression. Confirm unchanged/home,/learn workspace and no horizontal overflow.
- Stop at this bounded intensity; no further increase without specific human evidence. No dependencies, video, WebGL, frame loop, routing/auth/content changes.

## Original implementation record (retained, superseded by latest tuning above)

## Scope and architecture

- `LandingAtmosphere` is a presentation-only Server Component, mounted once by `PublicLandingShell`, outside all content. Small `AuroraField`, `ScientificContours` and `SparsePointField` functions own their layers.
- Existing canvas, composition, routing, Guest-first order, panel, graph interactions, local data and bilingual messages unchanged. No new content or authentication.
- Root isolation: decoration z0, existing frame z1; `pointer-events:none`, `aria-hidden=true`, SVG `focusable=false`, no interactive descendants. Only decoration clips overflow, never content/focus outlines.
- Native CSS gradients plus six original peripheral SVG curves/four markers. No dependencies, assets, video, WebGL, filter blur, React frame loop, client component or new lifecycle.
- Connection traces and graph illumination echo omitted: contours already supply scientific context; no semantic background network or graph-state coupling.

## Layers, themes and motion

| Layer | Treatment |
|---|---|
| Base | Existing `--bg`; transparent accent wash, max2% accent, fading inward. |
| Indigo aurora | Outer-left radial gradient;89s alternate transform, total12px/-8px excursion. |
| Cyan aurora | Outer-right radial gradient;137s alternate transform, total-10px/6px excursion. |
| Contours | Six static curved paths;1px non-scaling stroke, no dashes/flow/morph. Secondary group half-opacity. |
| Markers | Four .8–1.4 SVG-unit radii, no halos; one113s opacity cycle, most of cycle unchanged, soft rise near94%. Not concept nodes/stars. |

- **Static by default, preserving Task2–5 motion policy.** Existing “Enable gentle motion” enables atmosphere as well as graph on ≥1280px when reduced motion is off. “Pause motion” stops both; no new toggle or state owner.
- Scoped CSS `:has()` reads existing `data-motion`/`data-paused`; graph selection/list/hover, offscreen/hidden-document signals and entry focus pause atmosphere. No new visibility listener. Unsupported CSS/failed hydration remains a pleasant static version; actual browser pause/rendering remains manual.
- Reduced motion disables all atmospheric animation through the existing landing-wide media rule. Contours never animate. Print/forced-colors omit decoration entirely.
- Dark: navy remains authoritative; indigo10%/cyan5% token alpha, plane opacity .65/.55; contour20% relationship × .55 opacity. Light: cool paper, indigo5%/cyan3%, contour10% muted × .55. Markers20% relationship × .25, echo further .65–1. No bright center or panel transparency.
- Top/bottom mask quiets header and capability/footer zones; opacity already low without mask. Opaque graph-label backings and entry surface unchanged.

## Responsive/source review

| Width | Background only; existing composition unchanged |
|---|---|
| 1440/1600/1920+ | Two bounded washes; six peripheral curves/four markers; opt-in motion. |
| 1280 | Two washes; four curves/four markers; opt-in motion. |
| 1024 / 768–1023 tablet | Two quieter washes (.5/.35); two curves/two markers, static. Peripheral SVG naturally crops, not essential. |
| 430/390 / below768 | One static indigo wash at .35 opacity; no cyan/SVG contours/points. |
| Tablet≤1023×700 | Same simplified phone decoration, preserving short-viewport priorities. |

Decoration bounded to2400×1200; each gradient plane62% width/max1400px and80% height. This limits texture area rather than promoting two full-screen surfaces. Only transform/one tiny marker opacity animate; no permanent `will-change`, continuously animated filters, size/layout animation or frame updates.

## Accessibility and hierarchy evidence

- Added regression test: single hidden non-focusable decoration outside main; Guest still `/home`. Existing graph tests cover static default, reduced-motion eligibility, opt-in and pause signals. These are DOM/state tests, not rendered CSS/motion verification.
- Conservative sRGB alpha-overlap calculation (full base+both maximum washes+primary contour+brightest marker coincident) gives main/secondary text light10.78/4.66:1 and dark9.34/5.61:1. Mask/radial falloff intentionally ignored. This bound assumes current token colors and single contour/marker intersection, not a rendered/zoom/antialiasing certificate.
- No header, band, Guest button, focus/labels or graph edge colors changed. Reduce atmosphere before brightening semantic graph content if human review finds competition.

## Validation and performance

- MilestoneA typecheck/lint/focused9 tests pass; B full51 files/286 tests pass; C focused16 tests plus typecheck/lint pass.
- Final `npm run typecheck`, `npm run lint`, `npm test` pass:51 files/286 tests; search45.48ms against unchanged100ms threshold. Typecheck re-passed after restoring only generated Next build changes to the original next-env baseline.
- `npm run build` passes (736 pages); `npm run audit:build` passes all unchanged budgets:99 chunks, aggregate JS gzip916,550B; largest chunk148,115B; largest route10,447B. **Identical to Task5**, no added client JS.
- `node scripts/audit-public-entry.mjs http://localhost:3010` passes16 routes/assets, Guest/public-vs-workspace/auth boundary and no-heavy-runtime assertions. Initial public9 scripts168,906B gzip, root5,113B: both unchanged. Additional `/problems` returns200.
- Local HTML checks: root exactly one atmosphere; `/home` and `/learn` zero. Only task-owned port3010 production server used/stopped. These are HTTP/HTML checks, not browser navigation/interaction QA.
- CSS source grows3,524B, source gzip+694B versusd6218d1; not an emitted CSS network measurement. Small added server HTML/SVG, no separate image/font requests. GPU/frame timing unmeasured.
- `git diff --check` passes. No dependencies/package/vendor output changes. Original unrelated next-env blob a419cbe4e3a5e8d4b481b851dbf4ac767de069e6 preserved, excluded from commits; no routing/storage/auth modification, push or merge.
- GPU/compositor traces, mobile thermals and field CWV unmeasured. No claim of zero GPU cost; two bounded gradients animate only on opted-in desktop.

## Browser limitation and exact human sign-off

Safe browser discovery returned no apps/browsers with native pipe startup failure. No unrelated user window was touched; no fresh screenshots, console, real overflow, motion or rendered contrast checks claimed.

1. Isolated local browser:1600×900 dark first, then1440×900,1920×1080,1280,1024/tablet,430/390. Compare atmosphere enabled/disabled in DevTools, not by changing repository composition. Confirm effect noticeable on attention, never primary.
2. At ≥1280 enable gentle motion; observe ≥15–30s on outer edges. Pause; focus entry/list/select/hover graph and hide/return tab; verify stable pause and no jump. Full cycles are intentionally long (89–137s one direction).
3. 1600 light and phone light: paper clean, graph labels/edges/Guest clearly distinct; contours not a competing diagram. Increase nothing unless human evidence requires it; prefer lower intensity.
4. Reduced-motion, forced-colors/print and keyboard: static attractive wash or omitted decoration, unchanged visible focus/Guest/tab semantics. Disable JS: page/content unaffected, no moving background required.
5. Inspect actual scrollWidth/clientWidth, label bounds, panel opacity and footer quietness; no decoration pointer target. Console and Performance: no new requests/frame-loop/layout churn; inspect real compositor cost on a mobile device if available.
6. `/home` and `/learn`: no atmosphere mounted, unchanged workspace/local data. Do not reset real user data for QA.

Known limitations: browser matrix above outstanding; animated background deliberately shares desktop opt-in, tablet/mobile remain static. Landing frozen pending human sign-off after required automated checks.

# Task 4 — landing polish implementation and QA

Baseline18ac2b9 · 2026-09-30. Build contract08; priority audit07; execution plan09. This record distinguishes implementation/automated evidence from rendered browser sign-off.

## Implemented direction

| Priority | Implemented change | Evidence / owner |
|---|---|---|
| P0-1 |Shared eyebrow/headline grid track aligns entry with h1; tighter rhythm, unified field and360px map; graph utilities share one row |landing.css; landing-hero; public composition tests |
| P0-2 |Four anchors, two bridges, six supports; staggered12/8/6-node layouts, differentiated dots/rings/type |knowledge-preview; landing.css; projection parity tests |
| P0-3 |Authored curved paths with box-aware ports, CSS-to-SVG conversion, one resize observer, server fallback envelopes |landing-geometry; use-knowledge-geometry; sampled clearance fixtures |
| P0-4 |Direct-neighbor emphasis on hover/list focus/selection, hover restores selection, no transitive relationship claim |knowledge-atlas-visual; interaction tests |
| P0-5 |Guest first; local scope/disclosure before secondary account modes; one paired unavailable explanation |auth-panel; messages; DOM order/manual-tab/local-data tests |
| P0-6 |Local static indigo/cyan depth field, opaque panel with restrained border/top edge/shadow |Scoped landing roles only; no global theme replacement |
| P1-1/2 |Refined hero tracking/measure and brand/utility balance |Same headline, system-capable fonts,44px targets |
| P1-3/4 |Four registry-resolved capability links; single complete local disclosure, minimal copyright footer |Public landing/navigation tests; no route policy change |
| P1-5/6 |One graph utility row; aligned440px tablet column; Guest precedes account controls on mobile |Source breakpoint/DOM review; browser reach measurement outstanding |
| P1-7 |32s3px/2px opt-in whole-layer drift; pointer pause added to existing pause reasons |Static/reduced-motion/offscreen/hidden/selection/pointer tests |

P2 entrance/calibration ticks omitted; no added font, image, runtime or dependency. No per-frame React state, force simulation, private-data source or canonical relation change. Authentication remains unavailable, with no fields/provider requests/session logic; Guest is a native/home link. Existing storage keys, records and routes untouched.

## Validation checkpoint

- A–E typecheck/lint passed; latest full suite51 files/273 tests.
- Projection retains12 canonical IDs,13 verified relations and12/8/6 subsets; serialized projection remains below12KiB.
- Geometry fixtures sample curves at reference-wide actual widths880/848/768 (1440/1600/1280 viewports), compact552 (1024) and tablet440 (820), with reserved/short/mixed label heights. Curves finite and inside12-unit safe inset, avoid tested label rectangles with≥5px sampled clearance. Designed port clearance6px +3px arrow gap. This is arithmetic over nominal/measured-size fixtures, not a font-rendering or screenshot proof.
- Resize-observer test verifies measured width changes ports and cleanup; all labels retain fixed CSS font size. Single observer on graph/layout nodes, no animation measurements.
- UI coverage includes guest href/order, explanatory modes/manual activation, paired locale/theme, unchanged local progress, capability destinations, single full data disclosure, graph selection/hover/focus/Escape, hidden/offscreen/pointer pause and reduced-motion-sensitive eligibility.
- Final production build, route smoke and performance totals **pending milestoneF**; update this section before handoff.

## Theme / accessibility evidence

Calculated sRGB contrast with current opaque tokens (rounded; not rendered certification):

| Pair | Dark | Light |
|---|---|---|
|Guest white text / normal fill |5.57:1 |6.11:1 |
|Guest white text / hover fill |4.94:1 |5.38:1 |
|Guest white text / pressed fill |6.13:1 |6.69:1 |
|Panel secondary text / surface |8.69:1 |6.36:1 |

Structural rules are decorative, distinct from control/focus requirements. Graph labels never receive parent opacity dimming; only decorative edges/rings recede. Keyboard uses the native accessible relationship list and real links; the pointer layer has no focusable aria-hidden controls. Focus3px/3px offset, targets≥44px, reduced motion removes decorative movement without removing positioning. Forced-colors system surfaces/CTA/focus/edges added. Actual composited contrast, VoiceOver/NVDA announcements and visible focus must still be reviewed in a browser.

## Breakpoints reviewed

**Source and automated geometry review only. No fresh Task4 browser screenshots.** Safe browser inventory returned an empty list; native control following the active user window was not used. Task2's earlier desktop observations are historical, not Task4 sign-off.

| Viewport | Implemented/source-reviewed behavior | Human review remaining |
|---|---|---|
|1600×900 /1440×900 |Max1440 frame,400px panel, full12-node map, headline alignment, content height rather than large viewport minimum |First-view balance, core graph/Guest visible, EN/VI wrapping and selected states |
|1280×800 |384px panel, full map,768px graph column, four-column capability band |Actual164/148px label bounds, ports and curve clearance |
|1024×768 |360px panel,552px8-node map, no ambient control |No squeeze, long labels, cyan active rings |
|820×1180 |440px aligned stacked column,6-node map after panel |Label boxes/curves and touch targets |
|430×932 /390×844 |20px gutters, hero→Guest-led panel, no graphic/capability band, text/list fallback |Guest complete by y≤600 target, no overflow in both locales |
|320×640 /667×375 /zoom |Compact header, ordinary scroll, graph omitted on short tablet, readable untruncated copy |44px targets, outlines, reflow and offscreen controls |

## Exact remaining manual review

Use an isolated browser context and a dedicated localhost origin, never reset real user-local data. Run both themes/locales across the matrix. Inspect actual scrollWidth and element bounds; existing global overflow hiding is not evidence of no overflow. Test closed/expanded local data, both account tabs, relationship hover/persistent selection/list, theme/locale switches, prefers-reduced-motion, opted-in pauses and visible keyboard focus. Check skip→header→Guest→disclosure→account tabs→graph order, manual arrows/Home/End/Enter/Space, selection Escape focus retention and screen-reader announcements.

Check no-JS Guest/Browse navigation, graph omission, direct/home and feature links, console/hydration warnings and initial network requests. Field LCP/CLS/INP and actual mobile thermals are unmeasured. Browser unavailability is not represented as a visual pass.

## Local commits / handoff

-8ab870d composition/hierarchy
-ec961a1 graph hierarchy/geometry/interaction
-5176e3a Guest-led entry panel
-bf13db9 navigation/capability band
-E/F hashes available in local history; final handoff adds exact completed validation/performance evidence here.

No push, merge, rebase or branch switch. Pre-existing next-env.d.ts baseline blob a419cbe4e3a5e8d4b481b851dbf4ac767de069e6 must remain unstaged/preserved. Final file inventory is available from `git diff18ac2b9..HEAD --name-only` (use a space between diff and the revision range when running the command).

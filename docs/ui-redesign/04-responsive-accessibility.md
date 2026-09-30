# 04 — Responsive and accessibility contract

Landing is independent of current AppShell breakpoints. Preserve existing application responsiveness in Task 2; do not adjust Learn/Practice widths incidentally. Dimensions below are CSS pixels at default zoom. Screen height never gates access to entry actions.

## Responsive matrix

Outer max-width 1440px includes horizontal padding. Two columns only at ≥1024px. Use `minmax(0,1fr)` for the hero; the panel never uses viewport-relative scaling. Header does not stick. Region spacing uses [01](01-design-principles.md).

| Viewport | Columns / padding / gap | Hero | Graph | Panel | Header / lower content |
|---|---|---|---|---|---|
| ≥1600 | centered 1440 frame; 64 padding, 64 gap; 1312 inner → 848 left + 400 right | 60px, ≤18ch; no stretching to ultrawide | 800×320 composition within left area, 12 nodes | 400px, padding28; top aligned below eyebrow | 72px header; full Browse lessons + locale/theme; 4-item strip; compact footer |
| 1440–1599 | fluid to1440; 48 padding,64 gap; at1440 left880 | 56px | 12 nodes,320px box | 400px | same; target whole current-release page at1440×900 |
| 1280–1439 | 40 padding,48 gap; at1280 left768 | 48px; copy18px | 12 nodes; fixed readable labels, scale coordinates to available box;320px box | 384px,padding28 | 72px header; 2×2 capability strip, footer may scroll at800px height |
| 1024–1279 | 40 padding,32 gap; at1024 left552 | 44px, support16px | 8-node compact560×260, no ambient toggle; use 6-node static subset if measured labels collide | 360px,padding24 | 72px header;2×2 strip; no extra product nav |
| Tablet 768–1023 | one column;32 padding; main max640 centered | 36px; ≤2–3 lines, short support | Static six-node figure **after panel**, max640×220; omit if height≤700 or wrapping collides; textual relations remain | min(440px,100%), centered,padding24 | 64px header, Browse lessons + locale/theme;2×2 strip after figure |
| Small tablet 480–767 | one column;24 padding;max560 | 34px; support16px | graphic omitted; concise textual example + Atlas link below panel | min(440px,100%),padding24 | Browse lessons retained if fits; no capability strip; footer flow |
| Mobile 390–430 (also320–479) | one column;20 padding (16 at≤359); main gap24 | 32px/1.12; headline + ≤3 lines support, no multi-paragraph hero | graphic omitted; below panel: “Python connects to machine learning.” localized + View knowledge atlas; optional relationship disclosure | full inner350–390px,padding20; unavailable branch action near first screen; no nested scroll |64px header; brand + EN/VI + theme only; Browse lessons moves below primary/local disclosure in panel; no capability strip |

At1366px use1280 row; at1180 use1024 row. At exactly1024 use2 columns, at1023 stack. Very short desktop (<720px high) uses normal flow, main padding24 instead of40; no full-viewport panel clipping. Mobile landscape follows width but auth remains in flow; consider graph omitted whenever height≤500px. At200% zoom, breakpoints follow the CSS viewport: stack when necessary. At400%/320px, never horizontal page scrolling.

## Content order and layout details

- DOM order: header → hero copy → entry panel → knowledge figure/detail/list → capability strip → footer. CSS grid places figure below copy in left column on desktop and panel in right column. Do not use `order` to make keyboard traversal jump between panels. Graph optional controls always follow entry actions.
- Hero copy and panel align horizontally at headline top on desktop; graph follows copy with24px gap. At tablet/mobile the panel follows copy with24px gap, graph with24px gap after panel. No empty ghost graph column on mobile.
- Unavailable panel remains compact; at390×844 default theme/locale it should show the complete guest button without scrolling, aiming at ≤600px from document top. Signup/errors/large text may scroll; never truncate legal/error/disclosure text to satisfy the target.
- Keep form controls and buttons≥44px high (fields48px). Full-width primary and guest buttons. Mobile primary is in normal flow, never sticky over the browser keyboard or footer. No horizontal tab clipping; mode names may wrap.
- No autofocus on load. When software keyboard opens, preserve document scrolling and field visibility with16px input font. Use safe-area padding for bottom16px minimum. Do not center with fixed `100vh` or lock body scroll for the inline panel.
- Related text and footer wrap with `overflow-wrap:anywhere` only for long email/URL data; normal copy wraps naturally. Code does not belong on landing. Graph can be omitted at any width without leaving an empty placeholder.

## Accessibility requirements

| Concern | Requirement / verification |
|---|---|
| Landmarks and headings | One `main#main-content`, one h1 hero, h2 entry title, labeled figure/disclosure, header navigation and footer. Public shell supplies a skip link; do not nest another main inside root shell. |
| Contrast | WCAG2.2 AA target: normal text≥4.5:1, large text≥3:1, meaningful control boundaries/icons/focus indicators≥3:1 against adjacent color. Test both themes, opacity and error states. Decorative graph/grid may be fainter because equivalent readable text exists. |
| Focus | Every interactive item has `:focus-visible`, including inputs removing native outline, composite fields and disclosures.3px accent ring /3px offset; no clipped outlines. Keyboard focus is not same as selection. |
| Tab order | Skip → brand → Browse (if header) → locale → theme → mode tabs → available form controls/primary/providers → guest → local-data disclosure → mobile Browse → graph disclosure/list/motion → footer disclosure. Unavailable mode has no hidden field tab stops. |
| Graph alternative | Visual is optional pointer enhancement; HTML disclosure/list supplies same nodes, labels, relationships, selection and concept links. SVG is aria-hidden and nonfocusable; no hidden native button receiving focus. No hover-only instructions or tooltip-only concept descriptions. |
| Tabs | `tablist`, labeled tabs, `aria-selected`, one roving tab stop, controls/panels IDs. Left/Right/Home/End focus movement, Enter/Space manual activation. Recovery view restores previous trigger on Back. |
| Fields | Visible labels, stable IDs, autocomplete, helper/error IDs, required semantics, `aria-invalid` only after validation. No placeholder-as-label, paste prevention or inaccessible custom select. Password toggle announces current visibility. |
| Error announcements | Field errors via describedby; form summary uses role alert once per failed submission. Focus first invalid field on validation; focus summary on service rejection. Loading/success use polite status; graph hover never spams live region. |
| Language | All public copy/actions/errors/disclosures/messages have EN/VI counterparts. Respect document lang updates; don't use raw internal status strings. Verify Vietnamese wraps/accents on system fallback fonts. |
| Touch |44×44 recommended target for buttons, password toggle, locale/theme and graph hotspots; ≥8px between compact controls where possible. Existing28px locale buttons require landing-scoped target expansion. No swipe required to reach entry. |
| Reduced motion | No movement/fade/auto-pan, immediate state changes; optional ambient control omitted. Do not strip transforms that position graph nodes. Success/failure still clear as text/icon. |
| Forced colors / zoom | Use real borders/outlines and text; selected states remain identifiable via aria semantics and underline/edge.200% text,400% zoom/320px reflow: no hidden controls or clipped error text. |
| JS / graph failure | Server HTML shows hero, unavailable status, primary guest link, Browse lessons and local scope. Graph enhancement failure leaves its readable text. No opacity0 content depending on JS to reveal. Full client app features can still require JS; this requirement concerns public entry and real link navigation. |

## Task 2 browser evidence matrix

Capture dark and light at1440×900,1280×800,1024×768,820×1180,390×844 and430×932; spot-check1600+ and320px. Exercise EN and VI, checking longer VI strings at390 and1024. Also test667×375 landscape, short-height desktop, reduced motion,200% text/zoom and keyboard-only flow. Verify actual `scrollWidth≤clientWidth` without masking overflow.

Record initial guest panel, both unavailable account modes, opened local-data disclosure, graph hover/selection/list, theme/locale switching and visible focus. Check focus stays after tab activation and graph selection. Disable enhancement/JavaScript for public HTML check; optional graphic must not be needed. Available auth flows require a future real adapter milestone and its own integration evidence—Task 2 must not claim that signup/recovery succeeded.

Use existing browser tooling if available; no new testing dependency by default. Real browser/screen-reader checks supplement source/component tests, especially for focus announcements, computed contrast, touch targets and label collisions. Record gaps explicitly, not as passed checks.

## Standards references

Requirements use W3C's [text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). The44px target is CS Atlas's usability requirement: WCAG2.2 AA [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) specifies24px with exceptions, not a universal44px AA minimum. Optional motion has a user-operated pause and is off by default; see [Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html). Source review is not a conformance certification.

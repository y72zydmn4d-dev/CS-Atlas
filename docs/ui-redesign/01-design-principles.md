# 01 — Design principles and visual roles

## Identity

CS Atlas should resemble a carefully composed scientific atlas and a serious study desk: precise labels, visible relationships, useful density, steady geometry. Dark is the showcase; light is a clear academic reading environment. Originality comes from a real knowledge slice and editorial hierarchy, not a borrowed logo, layout, gradient treatment or animation.

Preserve the CA mark, CS Atlas wordmark, indigo family, existing locale/theme architecture and recognizable workspace controls. No new logo/font dependency in Task 2. A muted edge grid may supply depth; opaque text/form surfaces supply clarity. No frosted panels, star field, terminal cosplay, neon rims, universal glows or multi-color domain rainbow on the public page.

## Hierarchy and actions

1. One page purpose, one h1, one primary action per operation.
2. On landing: identity → actionable entry panel → knowledge connections → compact capability evidence.
3. Content pages later: title and context → task/content → supporting tools. Keep explanatory metadata subordinate without making it illegible.
4. Filled indigo = primary action; outlined neutral = alternative; text = navigation/disclosure. Danger actions require explicit destructive context. Availability is a message, never an unexplained disabled button.
5. Active navigation uses accent tint + edge/underline + `aria-current`. Do not use color alone. A progress color, selected node and primary action have different meanings.

## Color roles and integration

Use the current `data-theme` and existing variable vocabulary. The following are the default landing palette, based on final overrides in `app/workspace.css`, not the earlier values in `globals.css`. Keep product tokens unchanged in Task 2; scope any new control/graph roles to landing. Future app palette migration needs a separate review.

| Role | Existing owner / proposed role | Dark | Light | Use |
|---|---|---|---|---|
| Canvas | `--bg` | `#10151e` | `#f4f6fa` | Page field, opaque, no pure-black requirement |
| Surface-1 | `--surface` | `#181f2b` | `#ffffff` | Auth/entry panel, important content |
| Surface-2 | `--surface-2` | `#1f2837` | `#eef2f8` | Input well, quiet selection/background |
| Surface-3 | `--surface-3` | `#283448` | `#e5eaf2` | Stronger grouped/pressed context, used sparingly |
| Structural border | `--border` | `#2c3748` | `#dce3ed` | Surface edges; not enough alone to identify every form control |
| Muted border | landing `--border-muted` = border at 60% against canvas | derived | derived | Decorative rules/grid only |
| Control boundary | landing `--control-border` | `#77859b` | `#728099` | ≥3:1 against input well; no global border override |
| Primary text | `--text` | `#ecf0f8` | `#1c2840` | Headings, field contents |
| Secondary text | `--muted` | `#b0bdd0` | `#526078` | Supporting copy and labels |
| Muted text | `--faint` | `#99a9bf` | `#626f85` | Metadata on canvas/surface-1/2; light surface-2 is near 4.5:1, never further dim |
| Primary accent | `--accent` | `#a3b2ff` | `#4255ce` | Selected state, focus, textual actions |
| Primary fill | `--button-bg` + white foreground | `#4c5cd2` | `#4556ca` | Filled CTA; accent text token is not the button fill |
| Accent tint | `--accent-soft` | `#263252` | `#eaf0ff` | Selection, no luminous wash across entire page |
| Secondary accent | `--cyan` for edges; landing `--relationship-text` for readable text | `#22d3ee` | `#0e657f` (text) | Direct relationship emphasis only; existing light cyan is decorative, not small text |
| Success | `--success`; landing `--success-text` if needed | `#34d399` | `#06734f` (text) | Confirmed status with icon + words |
| Warning | `--warning`; landing `--warning-text` if needed | `#fbbf24` | `#8a5100` (text) | Recoverable limitation or review, not every unavailable capability |
| Danger | `--danger`; landing `--danger-text` if needed | `#fb7185` | `#b42345` (text) | Field/auth failure; safe neutral wording |
| Focus | `--accent` | as above | as above | 3px outline, 3px offset; no glow-only substitute |

Proposed text variants are purpose-specific contrast adjustments to existing semantic roles, not a second theme system. Use them only where the existing role fails its actual text/background pair. Never hard-code these hex values in a component. Role table lives with feature stylesheet tokens until a later shared-token review.

Calculated sRGB examples (Task 1, opaque pairs, not rendered WCAG certification): dark text/surface-1 14.48:1; dark faint/surface-2 6.20:1; light faint/surface-2 4.52:1; white/primary fill 5.57:1 dark and 6.11:1 light; proposed control boundary/surface-2 3.96:1 dark and 3.55:1 light. Existing light success/white is 3.77:1, warning/white 3.19:1, danger/surface-2 4.18:1 and cyan/canvas 3.40:1: these must not be used unchanged for small landing status text. Check final composited colors, hover states and every use in Task 2.

## Typography

Keep existing `--font-inter` and `--font-mono` family stacks. Current declarations name Inter/IBM Plex Mono but do not establish bundled font loading in `app/layout.tsx`; Task 2 must look good with system sans/mono. No external font request needed. Any future self-hosted font selection must cover Vietnamese diacritics, declare fallback metrics and be separately measured.

| Role | Size / line height | Weight / treatment |
|---|---|---|
| Brand | 18 / 24px | 650; existing mark 12px mono |
| Landing hero | 56 / 1.08 desktop, 44 laptop, 36 tablet, 32 mobile | 600–650, tracking −0.03em maximum; no ultra-light/futuristic display |
| Page title (future app) | 28–36 / 1.2 | 650; landing header rules scoped, do not change app h1 |
| Section heading | 18–24 / 1.3 | 600–650 |
| Body | 15–16 / 1.6 | 400–450; lesson prose 16 / 1.75 later |
| Hero supporting copy | 18 / 1.6 desktop, 16 mobile | Secondary foreground, ≤54ch |
| Small body | 14 / 1.55 | Helpful explanations/forms |
| Caption | 12 / 1.5 | Secondary/muted; never 8–10px meaningful copy |
| Technical label | 12 / 1.4 | Mono 500; uppercase only short domain eyebrow |
| Navigation | 13–14 / 1.4 | Sans 500–600; touch height independent of type size |
| Code | 13–14 / 1.7 | Existing mono; horizontal scrolling only within code |
| Metadata | 12 / 1.5 | Tabular numbers when useful; readable labels |

Limit uppercase to short labels. Natural sentence case for actions. English/Vietnamese messages are paired; do not reduce Vietnamese type to force English geometry. Avoid excessive negative tracking and monospace paragraphs.

## Geometry, borders and depth

- Base spacing 4px: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80. Component internals 8–16; panel padding 28 (7 units), mobile 20; region spacing 32–64. Every exception must solve measured alignment, not visual guesswork.
- Radius roles: 4px status/code chips, existing `--radius-sm` 7px controls, 12px primary panel, 0px editorial sections/dividers. Keep shared `--radius-lg` 18px for legacy surfaces; no new blanket 18–24px cards.
- Structural borders define independently operable surfaces; muted dividers organize related rows. No box around every paragraph or label. Selected state gets a strong edge and tint; fields need visible control boundaries.
- Panel shadow permitted once: current `--shadow`, low opacity. Dropdown/dialog elevation later may reuse it. No shadow per node, row or button.
- Glow only for a focused/selected relationship dot, ≤6px soft radius and ≤20% accent opacity. Focus ring remains crisp. No glowing panel edges or always-pulsing nodes.

## Density by product area (later redesign directions)

| Area | Density and content priority |
|---|---|
| Landing | Medium: one paragraph, bounded graph, one entry panel, optional compact capability proof. Leave space around action; not a catalog of all subjects. |
| Home | Medium-high: resume first, ≤3 actionable rows, concise local status; goals/bookmarks secondary. Domain exploration below, not equal-weight hero cards. |
| Learn catalog | High: grouped compact subject rows, authored-versus-planned maturity visible, scope-specific search. No 428-card grid. |
| Lesson reader | Reading density: 60–72ch prose, 16px/1.75, clear block rhythm; curriculum/tools denser. Collapse tools before prose shrinks. |
| Practice | High working density: statement/editor/results prioritized, runtime/save boundary concise; long history/hints via disclosure. Keep editor and output readable. |
| Explore | Graph/list choice and semantics first; labels readable at stable size, selected details in bounded inspector. No decorative dashboard around canvas. |
| Library | High list density, title/type/relation/date first, details expandable; reader owns width. Active filters visible; honest quota/export scope. |
| Progress | Evidence-first rows and timelines; scope/recency/source labels alongside metrics. No inflated mastery rings or streak gamification. |
| Atlas AI | Question + selected public context + sourced answer first; secondary task choices grouped. Answer width ≤72ch, no chat chrome drowning citations. |
| Profile / Settings | Compact grouped facts and direct controls; private local identity/data actions explicit. Do not invent account features. |

Density does not excuse hidden focus, 10px labels or inaccessible targets. Future changes flow into AppShell active states, Home rows, Learn hierarchy, Practice actions, Explore relationships, Library panels, Progress evidence and AI provenance through these roles, not by applying the landing hero across all pages.

## Themes and motion philosophy

Dark uses blue-gray canvas and progressively brighter opaque surfaces, restrained indigo and cyan detail. Light uses pale blue-gray paper, white panel, darker boundaries and ink-colored graph labels. Light graph lines become darker low-opacity strokes; remove luminous bloom and dark-only overlays. Primary fill retains white text in both modes. Selected cyan is darker in light, not simply inverted.

Respect saved theme and OS preference through the current provider; dark showcase is not a forced theme. The existing deterministic server dark / post-hydration preference can briefly change theme: Task 2 must assess flash with both themes and avoid transitions during preference reconciliation. Do not introduce another persistence key or claim zero-flash before verification.

Motion communicates entry, focus and relationship only. Default map is static; optional bounded ambient drift is opt-in with pause, stops during auth focus and never changes semantic layout. No motion required for navigation or understanding. Timings and exact behavior are owned by [03](03-visual-motion-system.md).

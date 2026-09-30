# 08 — Landing polish specification

Task 3 target for Task 4. Baseline `915d15f`; findings and priority IDs in [07](07-visual-polish-audit.md). This is a presentation refinement, not a new front-door architecture.

## 1. Direction, scope and precedence

**Scientific atlas: an editorial headline, a spatial knowledge field and a precise guest-entry surface.** Depth comes from relative scale, curved relationships and opaque surface separation. The resting page must look finished with motion off.

Preserve `/`, `/home`, all deep routes, shared preference/storage infrastructure, server-resolved canonical projection, existing CA identity/fonts and bilingual copy. No credential fields, providers, fake sessions, new dependency, search/nav overhaul or application-wide token change. Actual AI route remains `/assistant`; no new `/atlas-ai` route.

This document supersedes Task1's landing presentation values where explicitly specified here: responsive graph coordinates/ranks/height/paths, utility arrangement, type/spacing/surface recipes, tablet alignment, entry-panel order (including its corresponding keyboard order), header sizing, capability-strip behavior, footer duplication and opt-in motion amplitude. Everything else in00–06 remains a constraint, especially accessibility, authentication availability and privacy. Task4 should not rewrite those historical documents.

## 2. Composition and first screen

Keep two columns, not three. The knowledge field belongs to the headline; the entry panel is a separate, stronger surface beside them. No line connects a concept to the panel—that would imply a knowledge relation to authentication.

```text
72px header: CA CS Atlas              Browse lessons   EN VI Theme

eyebrow
headline, normally two EN lines       Enter CS Atlas
short supporting paragraph           Study locally. No account required.
                                     [ Continue as guest              → ]
staggered knowledge field             local scope + disclosure
  clear anchors, curved relations     ── Account options ──
                                     Sign in / Create account
                                     one unavailable explanation

reserved caption / Atlas link
Explore connections                         Enable gentle motion
───────────────────────────────────────────────────────────────────────
Learn                Practice             Explore               Library
short descriptor     short descriptor     short descriptor      descriptor
© year CS Atlas
```

DOM remains header→hero→entry→graph→capabilities→footer. Use grid placement, not reordered tab traversal. No graph behind text/panel and no stretched panel matching the entire graph height.

### Desktop geometry

Outer frame remains max1440px **including padding**. Keep existing gutters/column widths to avoid unnecessary shell work:

| Viewport | Frame padding | Left / gap / panel | Main top / bottom | Graph viewport |
|---|---|---|---|---|
| ≥1600 |64px |848 /64 /400px |32 /24px |360px high |
|1440–1599 |48px |880 /64 /400px at1440 |32 /24px |360px high |
|1280–1439 |40px |768 /48 /384px at1280 |32 /24px |360px high |
|1024–1279 |40px |552 /32 /360px at1024 |28 /24px |280px high,8 nodes |

Main uses content height; remove the old620px minimum rather than adding viewport-height centering. Hero-to-graph gap16px instead of24. Panel starts at the h1 top, not eyebrow top: reserve a shared eyebrow track (minimum20px line box +12px gap =32px desktop); use that offset in the grid, not a visual transform. If the eyebrow wraps, offset tracks its actual height; at≤1023 remove the panel offset entirely.

At1440×900 and1600×900 default closed state: brand, entire headline/support, graph graphic and full guest action must fit. Indicative1440 vertical budget: header72 + main-top32 + hero≈220 + gap16 + graphic360 = graphic bottom≈700px. Caption72 + utility44 + bottom24 puts capability band around840px. Footer may fall below900px; do **not** shrink labels or force all footer text into the first screen. This qualifies Task1's whole-page-above-fold aspiration: core experience first, lower navigation second. Expanded disclosures and long locale text grow naturally.

Graph utility space falls from160px to116px while graphic grows40px: net left-column height is nearly unchanged. Do not add extra empty space beneath graphic or vertically center the panel in that column. At desktop heights<720 use24px main top padding; ordinary scroll is correct.

## 3. Header and typography

- Header72px desktop,64px below1024; nonsticky. Preserve single Browse link, EN/VI and theme. No extra nav labels.
- Desktop CA mark36×36, wordmark19px/24,650; gap10px. Mobile retains28px mark/16px wordmark,14px only at≤359. Brand target≥44px. Use existing mark treatment, not a new pictorial logo.
- Theme icon18px in44px target: transparent border at rest, surface-2 on hover, real3px focus outline. Icon contrast≥3:1. Locale targets44px; active locale gets existing tint plus visible underline, not color alone. No enclosing utility card.
- Header divider uses muted structural border, not control border. Browse14px medium muted; accent+underline on hover/focus.

| Text | Target |
|---|---|
| Eyebrow |12px/1.4 mono500, tracking.06em;12px below; muted; mobile.04em |
| Headline |60px at≥1600;56 at1440;48 at1280;44 at1024;36 tablet;32 mobile. Weight650; line-height1.08 desktop,1.12≤1023; tracking−.03em desktop/−.025em small screens |
| Headline wrapping |max18ch desktop,22ch tablet; mobile available width. Keep text-wrap:balance; no `<br>` or nowrap. English typically2 lines desktop, Vietnamese1–2; no equal-height requirement across locales |
| Support |18px/1.55 desktop,16px/1.6 at≤1279; max48ch; margin-top16px; unchanged full bilingual statement, no line clamp |
| Panel title |24px/1.3,650 desktop;22px mobile |
| Labels/actions |14px/1.4,500–600; uppercase reserved for eyebrow |
| Metadata/disclosure |13px/1.55; no meaningful landing text below12px |

Do not add a hero CTA, gradient headline, emphasized random word or new font fetch. The graph supplies the specificity behind the existing headline.

## 4. Knowledge field: ranks and positions

Retain all12 current IDs and13 selected canonical edges. Presentation ranks express visual orientation, **not difficulty, mastery or a new taxonomy**. Do not introduce generic domain nodes such as “AI” or “Systems” without a later content decision.

Use label+dot hybrid: left dot beside a readable multiline label, generous unboxed resting hotspot. Only active selection gets a bounded tinted surface. No pill around every concept. Four anchors establish entry points; two bridge concepts connect clusters; six supporting nodes fill the field.

| Rank | Existing IDs (all `topic:`) | Dot diameter | Label | Hotspot / label envelope |
|---|---|---|---|---|
| Anchor |programming-fundamentals,python,linear-algebra,ml-fundamentals |10px solid core + restrained18px outer ring |16px/1.25,600,primary text |164px wide;≥56px high; reserve72px for routing |
| Bridge |dynamic-programming,neural-networks |8px core, no resting outer ring |14px/1.3,600,primary text |148px wide;≥48px high; reserve64px |
| Supporting |complexity-analysis,arrays,recursion,multivariable-calculus,optimization,gradient-descent |5px core |13px/1.4,450–500,secondary text |148px wide;≥48px high; reserve64px |

Rank can be a landing-only enum change; never change canonical concept type/difficulty. Keep internal8px dot-to-label gap; horizontal padding8px. Full canonical names wrap; no abbreviation to “ML,” truncated ellipsis or metadata copied into presentation records. Reserve envelopes conservatively for both locales. If labels exceed them, enlarge routing exclusion boxes and verify, never clip the text.

### Wide composition — reference800×360

Points are **hotspot centers**, not line junctions. Scale center coordinates with available width/height; HTML label sizes remain CSS pixels. This keeps current projection approach. Vertical coordinates introduce stagger, not random jitter. Safe bounds include labels, not just node centers.

| ID suffix | x / y | Role in composition |
|---|---|---|
|programming-fundamentals |100 /48 |Upper-left foundation anchor |
|complexity-analysis |296 /44 |Upper bridge toward algorithm concepts |
|arrays |478 /76 |Upper-middle supporting branch |
|ml-fundamentals |690 /80 |Upper-right anchor |
|python |104 /162 |Left-center cross-field anchor |
|recursion |280 /156 |Interior supporting concept |
|dynamic-programming |464 /200 |Interior bridge |
|neural-networks |690 /210 |Right-center bridge |
|linear-algebra |104 /288 |Lower-left anchor |
|multivariable-calculus |282 /270 |Lower mathematics support |
|optimization |464 /312 |Lower-middle supporting chain |
|gradient-descent |684 /316 |Lower-right supporting connection |

Use these as implementation coordinates, with at most±12 reference-unit adjustment to resolve measured label/path collisions. Larger changes need an explanation in PROGRESS, not a new design exercise. No extra anonymous dots: every visible node must remain a real selectable concept. Constellation-like richness comes from hierarchy and cross-cluster curves, not filler stars.

### Compact and tablet

- 1024–1279: reference560×280, eight current compact IDs. Centers: fundamentals(86,44), complexity(280,44), ML(468,52), Python(86,138), neural(468,150), algebra(86,236), optimization(280,232), gradient(468,236). Anchor labels14px, bridge14px, support13px; all boxes140px, reserve64px height initially. Anchor core8px/ring14px. No ambient control. Keep only existing edges with visible endpoints.
- 768–1023: aligned440px maximum stage, six current tablet IDs; reference440×232, centers Python(76,48), ML(220,44), neural(364,64), algebra(76,184), optimization(220,180), gradient(364,188). Boxes128px, reserve64px height initially; labels13px, anchors14px. This is a quiet sample after entry, not a scaled12-node map. Omit graphic at height≤700 or if verified wraps cannot fit; retain text/list.
- ≤767: omit graphic and its empty height entirely. Keep current short Python→machine-learning example, Atlas link and native relationship disclosure after the panel. No decorative mobile cluster needed.

## 5. Edges and responsive geometry

**Do not change the relation list in `content/landing/knowledge-preview.ts`.** Prerequisites remain directed solid lines; RELATED_TO remains undirected dashed. Neither depth nor interaction changes semantic type. Keep the disclosure's explicit incoming/outgoing wording and subset disclaimer.

| State | Stroke / opacity | Node response |
|---|---|---|
| Rest, prerequisite |1.25px, graph-edge token at.8 opacity; small arrow |Four anchors already distinct |
| Rest, related |1px, same token at.6, dash3 5; no arrow |No special subject color |
| Active incident |1.75px, relationship token at1; preserve solid/dashed |Active node:2px relationship boundary + surface-2; neighbors: primary text, cyan dot/ring, no extra card |
| Active nonincident |1px, graph-edge token at.25 |Unrelated labels remain secondary text≥4.5:1; reduce only decorative rings/dots, never parent opacity |
| Selected after hover leaves |Same incident neighborhood persists |Selected marker/border remains until toggled/Escape |

- Use a cubic Bézier for short links; long cross-cluster edges may use two smoothly joined cubic segments. No right-angle shared buses. Curve perpendicular displacement starts at20–36 reference pixels for local links,48–64 for long cross-field links; keep within viewport inset12.
- Route Python→ML through upper-middle negative space; algebra→neural through lower-middle gap; optimization→gradient along the lower corridor; gradient↔neural on the right. Keep fundamentals/complexity/recursion/DP branches left/interior. Do not turn crossings into filled junction dots.
- Add small per-edge presentation routing hints keyed by the existing relation selector/ID where the general curve intersects a label. Those hints belong to landing presentation, not canonical relations. Do not duplicate titles or change relation direction to simplify paths.
- Compute ports from the **rendered label exclusion rectangles +6px clearance**; endpoints sit on the relevant outer boundary, with an additional3px arrow tip gap. Recompute on resize/locale change, never every frame. A single ResizeObserver is acceptable; no continuous measurement or force simulation. Convert CSS-pixel box sizes into current viewBox units before calculating ports. SSR fallback uses the reserved envelopes above; enhancement must not hide the initial graphic.
- Use non-scaling strokes; markers remain small (about5px) and inherit current stroke. No arrow at RELATED_TO endpoints. No port under a label, clipping at outer edge, or two unrelated edges sharing a segment for more than12px.
- All labels above edge layer; small opaque label backing uses graph-region base color with4px padding, not a full-width card. This is secondary protection, not permission to route through text. Curves/labels must be reviewed in both locales at1280 and1024.

Graph-specific geometry work is bounded to this presentation/projection helper. Do not import the complete Atlas renderer or introduce automatic graph layout.

## 6. Interaction, utilities and motion

State precedence stays `hovered ?? selected`. Derive the one-hop neighbor set from visible incident edges; don't highlight transitive chains as direct relations. Hover exit restores selection. Click/tap toggles selection; Escape clears without moving focus. No automatic navigation/progress save. List buttons select the same neighborhood, preserve aria-pressed and polite selection announcement; hover never announces.

Keep presentational SVG/HTML hotspots aria-hidden and nonfocusable, with the native accessible list as the equivalent control. Keyboard focus on a list button has a visible ring; Enter/Space selects. Do not hide actual buttons in the aria-hidden layer.

- Caption: reserve72px at desktop; primary default caption + View knowledge atlas link. On selection/hover, show canonical name/summary. Allow longer text to grow; no fixed-height overflow or rapid truncation. Mobile keeps its compact current fallback.
- Utility row: one44px minimum row, Explore connections left, opt-in motion right. Native details owns the left column; its expanded body spans full width **below** the row. Use CSS grid placement for summary/content; never place a button inside `<summary>`. Motion button retains its own independent target. At narrow widths it wraps or is absent according to eligibility; never overlays details content.
- Default is static. “Alive” means responsive relationships; do not enable animation automatically to compensate for weak composition.

| Motion | Target |
|---|---|
| Button/border response |140ms, existing ease |
| Hover/neighbor/edge emphasis |180ms opacity/color;220ms maximum; do not scale labels |
| Account mode content |140ms opacity only if used; stable available space, no sliding underline or animated height |
| Optional ambient |32s ease-in-out loop, whole graph layer moves from0,0 to3px,2px and back; labels/edges/backing move together;≥1280 only |
| Optional entrance (P2) |280ms,≤4px rise, once; no delayed CTA or hidden initial content |

Pause (freeze, not reset) on explicit pause, pointer over graph, any graph selection, open connections, entry-panel focus, offscreen graph or hidden document. Add pointer pause to existing behavior so hotspots do not drift under the cursor. Reduced motion removes all decorative movement/fades and motion toggle; instant state changes retain static positioning transforms. No independent node drift, edge pulse, traveling dashes, parallax, animated blur or per-frame React state. Do not persist motion preference or start a new timer.

## 7. Guest-led entry panel

This is the largest hierarchy change, not an authentication feature. Current account modes stay explanatory. Use existing `AuthPanel` boundary; no new credential form, provider slot, recovery button, loading animation or success screen.

Exact order:

1. “Enter CS Atlas” h2.
2. Existing “Study locally. No account required.” subtitle.
3. **Continue as guest**, native `/home` link, full width, prefetch=false.
4. Existing local-scope statement, complete and readable.
5. Existing native About local data disclosure, full retention/export text unchanged.
6. Quiet divider and small “Account options” label (reuse existing localized modes label).
7. Existing Sign in / Create account manual tabs.
8. One mode-specific message in the active tabpanel: **“Sign in is not available yet.” / “Account creation is not available yet.”** Paired VI: **“Đăng nhập hiện chưa khả dụng.” / “Tạo tài khoản hiện chưa khả dụng.”** These replace the repeated notice plus launch explanation. No date or promise of imminent availability.
9. On mobile only, existing Browse lessons link.

| Part | Exact visual contract |
|---|---|
| Panel |Widths from table; padding28 desktop,24 at1024/tablet,20 mobile; landing-scoped radius10px;1px panel border; opaque surface-1 |
| Heading/subtitle |Heading margin-bottom8; subtitle14px/1.5 secondary; margin-bottom20 |
| Guest |min-height48 (allow wrapped label),14px/1.4 weight600, padding12×16, radius7; indigo fill, white label,18px arrow; no glow or pulse |
| Scope |margin-top16;13px/1.55 secondary; max panel width; no icon pretending to certify security |
| Disclosure |44px minimum summary; no separate surrounding box; expanded content grows panel normally |
| Account group |margin-top16; padding-top16; muted separator; label12px/1.5 secondary, margin-bottom8 |
| Tabs |Two equal columns;44px targets; neutral resting labels; selected2px indigo underline +600 weight; baseline muted border (not high-contrast input boundary) |
| Availability |13px/1.55 secondary; margin-top12; reserve two text lines (~40px), grow for wraps; no warning orange, left warning stripe or repetitive notice |
| Panel edge |Subtle stronger top edge + very low-opacity shared shadow; never translucent/backdrop-filter; no cyan outline suggesting graph selection |

Expected closed panel approximately410–470px desktop depending on locale; **not a fixed height**. No spacer to mimic missing form fields. Guest precedes account tabs in keyboard order and remains usable without JS. Mobile guest target: fully visible by y≤600 at390×844 in EN/VI default closed state. Full disclosure may scroll; never clamp it to meet target.

Button hierarchy: primary filled indigo=Guest only; secondary=Browse/Atlas/capability navigation as readable text links; tertiary=disclosures/motion; account tabs=mode selection, not submit. Future real Sign in/Create account button hierarchy is outside Task4. Focus3px/3px offset, pressed slightly darker, no transform needed. Recheck hover foreground contrast if retaining brightness filter; use a derived fill token instead if it fails.

## 8. Surfaces, borders and color

No global token replacement. Introduce only landing-scoped roles derived from existing variables. Colors below are starting role recipes; verify composited contrast in Task4. Do not spread isolated hex values across components.

| Layer / role | Dark | Light |
|---|---|---|
| Canvas |Existing --bg #10151e |Existing --bg #f4f6fa |
| Main region |Transparent, no enclosing card |Same |
| Graph field |One static radial field: accent at6% over canvas, center45%/48%, reaches transparent by70%; optional second relationship tint at3%, lower-right |Paper-like tint: accent at3%, no cyan glow; edges supply depth |
| Graph guide |Border color at30%, at most two short peripheral rules / optional P2 ticks; not a full grid |Border-strong at25%; no bright white glows |
| Panel |Existing --surface; panel border from70% --border-strong +30% --border; top edge --border-strong; existing low-opacity --shadow |White surface, same role mix, subtle existing shadow |
| Subsurface |--surface-2 for selected graph/detail; no box around unavailable text |Existing blue-gray well, not gray-on-gray disabled appearance |
| Interactive surface |--accent-soft for selected tabs/list if necessary; main button --button-bg |Existing accent-soft/indigo, white CTA foreground |
| Graph edge |Landing --graph-edge = --border-strong; use state opacities in§5 |Same role; avoid luminous cyan resting edges |
| Structural rule |--border at70%; headers/group boundaries |Same recipe; visible but not form-control strength |
| Relationship |Existing --landing-relationship #72cede only active/direct neighbor dots/edges |Existing #0e657f, no pale cyan label text |

Cyan explains connection; indigo identifies action/selection; primary text supplies authority. Do not assign a different hue to every subject. Resting anchor rings use indigo at30% in dark/35% in light; core uses accent. Selected core/ring may have one≤6px soft shadow at≤15% relationship color in dark only; optional, never required for focus. Supporting cores stay muted. Unrelated **text** never receives reduced opacity.

Light mode is ink on a lightly tinted sheet: preserve a white entry surface, darker line work, muted-blue guides and dark relationship accent. Remove luminous effects, not graph hierarchy. Controls, selected state and all text still meet the existing04 contrast requirements on the actual composited background.

## 9. Capability band and footer

Convert the current static list into a compact labeled navigation region, not four cards. Resolve destinations from `lib/capabilities.ts`: Learn `/learn`, Practice `/problems` (existing `/practice` alias remains unchanged), Explore `/explore`, Library `/library`. Preserve descriptor messages. Use native links with prefetch=false; do not mount Library data on the public page.

- ≥1280: four equal columns,24px gap, one top divider; padding16px block, each link≥48px tall, label14px600 + descriptor13px/1.45 separated4px. Typical band height80px; allow long descriptors to wrap.
- 768–1279:2×2, gap16px vertically/24px horizontally; no panel background or separate rounded boxes.
- ≤767: omitted as today; mobile Browse/Atlas/Guest already provide entry paths.
- Small16px diagonal arrow aligned with label, muted at rest. Hover: label accent+underline, arrow accent; no lift, scale or expanding underline. Entire item is link with visible focus rectangle; no nested links. Icons unnecessary—do not add a second set of symbols competing with graph nodes.
- Footer removes duplicate LocalDataDisclosure only; retain the complete panel disclosure. Copyright-only12px/1.5, padding8px block, natural32–40px height; no second heavy divider, no invented privacy/terms/status/version links. Footer is not sticky and never overlaps graph detail.

## 10. Responsive visual acceptance

| Width | Visual priority / adjustments |
|---|---|
|≥1600,1440 |Full12-node hierarchy; balanced headline and opaque400px panel; graph field subordinate to text/Guest. All core content fits900px-high first view; lower band may begin near fold. No widening beyond1440 frame. |
|1280 |Same12 nodes and360px viewport;384px panel. Verify164/148px label envelopes and edges at768px left width. Four-item capability band. No font shrink to fit long labels. |
|1024 |Two columns,360px panel;8-node280px map. Hero44px/support16; no motion or decorative guide marks. Remove additional graph field tint if it muddies reduced area. |
|Tablet768–1023 |Single440px maximum aligned content column for hero, panel and six-node map.32px page gutters; main gap24. Panel is second, no desktop offset. Header64px. Capability band may use wider frame independently. |
|480–767 |Single column max440;24px gutters; no graphic/capability band; hero34px. Header brand/preferences only; Browse in panel. |
|430 /390 |20px gutters, full-width panel,20px hero→panel gap,32px h1. Keep support16px, exact copy; no forced line count. Guest precedes account group and is fully visible≤600px target. No graph height reservation. |
|320 / short landscape / zoom |16px gutters at≤359, existing compact brand; all controls≥44px. Normal vertical scrolling; omit tablet graph at height≤700. No clipped tabs, offscreen focus or CSS overflow hiding used as a fix. |

## 11. Non-negotiable implementation gates

- Preserve one main/h1, existing skip link, semantic tabs/disclosures and real native links. Test manual tab activation, focus restoration, selection/Escape and screen-reader announcements after reordering.
- Text≥4.5:1; meaningful icon/control/focus≥3:1; decorative edge dimming is allowed only because readable relationship list remains.44px targets are the product standard. Forced-colors must retain focus/selected cues.
- Verify default, hover, selected, keyboard focus, expanded disclosures, both account modes, EN/VI, light/dark and reduced motion. No graph/JS must leave guest/Browse and local-data explanation usable.
- CSS/SVG/React only, no continuous JS loop or new library/font/image. At most12 nodes/16 edges; actual13 edges unchanged. No per-node filters, network requests or mounted private-data adapters.
- Preserve current initial public JS baseline168,400B gzip accounting for shared chunks. Target added polish JS≤5KiB gzip; investigate any larger increase and rerun build/public-entry audit. This is a transfer budget, not a CWV certification.
- Never change canonical content, local storage keys/values, routes, middleware or actual auth capability to implement a visual recommendation.

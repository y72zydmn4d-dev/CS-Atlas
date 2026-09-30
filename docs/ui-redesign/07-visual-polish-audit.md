# 07 — Landing visual polish audit

Task 3 · 2026-09-30 · source baseline `915d15f` on `atlas-v2`. Design review only. Implementation targets are in [08](08-landing-polish-spec.md); bounded execution plan in [09](09-task-4-implementation-plan.md).

## Assessment and evidence limits

The landing has sound structure but weak visual differentiation: a strong headline, a nearly uniform diagram and an ordinary entry card occupy separate regions without enough hierarchy connecting them. The remedy is a denser, deliberately composed knowledge field and a guest-led entry instrument—not more content, bigger page height or continuous animation.

Evidence reviewed: current landing CSS/components, authored projection, edge adapter, motion hook, paired messages, capability destinations, Task 1 contract and [Task 2 QA](06-task-2-qa.md). Task 2 recorded dark English 1440×900, light Vietnamese 1600×900 and approximately 1154px compact desktop inspection. Its measured guest action at 1440 began at y=413.09px; no obvious overlap was reported. Those are historical observations, not fresh Task 3 screenshots or full responsive certification.

Task 3 browser discovery returned no controllable browsers. Native active-window control was not used because Task 2 documented loss of isolation to a user window. No new rendered inspection, screenshot, contrast certification or motion observation is claimed. Findings below are source-proven mechanisms and explicitly identified visual judgments; final rendered tuning is a Task 4 gate.

## What already works / keep

- Concise identity and headline; preserve “Understand the connections.” and its existing Vietnamese equivalent. The meaning is appropriate; hierarchy should do the work.
- Public `/`, workspace `/home`, unchanged deep links, shared themes/locales, no workspace sidebar on landing.
- Honest unavailable accounts, functional native guest link, accurate local-data disclosure. No credentials, sessions, OAuth placeholders or cloud claims.
- Bounded canonical projection: 12 concepts, 13 validated relations, localized labels and real Concept URLs. This is distinctive product substance.
- Static default, opt-in motion, offscreen/hidden-tab pauses, native relationship disclosure/list and reduced-motion support.
- Existing fonts, restrained color family, opaque entry panel, 44px controls and one filled action. No new library is justified.

## P0 — must fix for the polish handoff

Effort: S = scoped CSS/copy; M = one component/presentation adjustment; L = coordinated visual geometry work, not product architecture.

| ID / effort | Current observation and evidence | Why it feels underpowered | Target / implementation direction |
|---|---|---|---|
| P0-1 / M | Main grid starts panel at eyebrow height; graph occupies the next row. Graph utilities consume at least 72+44+44px when motion control is eligible (`app/landing.css:23–28,48,61–84`). | Headline, diagram and panel read as stacked independent objects. Spending height on utility rows limits useful graph mass and pushes the lower band down. | Align panel to headline, enlarge graphic 320→360px on wide desktop, consolidate graph utilities to one 44px row plus 72px caption. Keep whole first-view composition within the explicit height budget in08; do not add a full-screen hero minimum. |
| P0-2 / L | Wide coordinates form four columns × three nearly uniform rows (`content/landing/knowledge-preview.ts:5–17`). Nodes differ by only 1px of type and 2px of dot diameter (`landing.css:52–55`). | A spreadsheet-like distribution and near-equal labels suppress central anchors and cross-field connections. | Keep the same12 concepts; introduce three visual ranks, staggered fixed coordinates and four clearly recognizable anchors. No invented Programming/AI/Systems domain entities. |
| P0-3 / L | Long paths share horizontal/vertical corridors; ports use fixed76/72-unit offsets while HTML boxes stay fixed CSS widths (`lib/concepts/landing-projection.ts:56–69`). | Right-angle buses imply a workflow diagram. SVG stretching and fixed HTML geometry can change endpoint gaps; this is a geometry risk, not a measured collision. | Bounded curved paths with per-edge routing hints, box-aware ports and label clearance. Preserve arrow/dash semantics and prevent shared segments from implying nonexistent junctions. |
| P0-4 / M | Hover selects one node and incident edges, but neighboring nodes receive no relationship state (`knowledge-atlas-visual.tsx:37–48`). Only one node gets a border/tint. | The user sees a selected label rather than a connected neighborhood. Increasing drift would not repair this missing interaction hierarchy. | Distinct active, direct-neighbor and unrelated states; brighten neighbor labels/dots, preserve unrelated text contrast, retain selected state after hover leaves. Same state through keyboard list. |
| P0-5 / M | Panel places tabs, availability notice and a minimum72px explanation before Guest (`auth-panel.tsx:25–34`, `landing.css:30–41`). Two messages repeat that accounts are unavailable (`i18n/messages/landing.ts:12–14,49–51`). | The available action appears to be the fallback beneath a nonfunctional sign-in form. Most panel visual mass describes something visitors cannot do. | Guest immediately after title/subtitle; scope/disclosure next; account options become a quiet lower group with one mode-specific unavailable message. Preserve manual tabs, remove no security information. |
| P0-6 / M | Canvas is one flat fill, node backings are the same fill, panel has a single border with no depth treatment (`landing.css:2–8,28,52`). | There is little spatial distinction between knowledge field, labels and entry surface. | One static, localized atlas field; subdued structural guide marks; opaque raised entry surface with a restrained top edge. No card around graph, blur, neon rims or per-node shadows. |

## P1 — should fix

| ID / effort | Observation / evidence | Refinement |
|---|---|---|
| P1-1 / S | Hero uses −.045em tracking vs Task1's −.03em limit;55ch support and17ch headline have independent wrap behavior (`landing.css:25–27`). | Keep copy; use −.03em,48ch support, explicit desktop type scale and natural EN/VI line budgets. No hard-coded English line break. |
| P1-2 / S | Theme button has a strong control border while brand is only32px mark/18px text (`landing.css:11–20`). | Keep header72px; increase desktop mark36px/wordmark19px, remove strong theme-button box at rest, retain recognizable icon,44px target and focus ring. Header remains quiet, not a marketing navbar. |
| P1-3 / M | Capability strip is **static text, not links** (`capability-strip.tsx:4–8`). At768–1439 it becomes two rows (`landing.css:90–101`). | One compact navigation band with four real capability destinations at≥1280; two columns only768–1279. Restrained label/description/arrow hierarchy, no feature cards. |
| P1-4 / S | Full local-data disclosure repeats in panel and footer (`public-landing-shell.tsx:17`, `auth-panel.tsx:34`). | Keep complete disclosure beside Guest; footer becomes copyright-only,32–40px normal-content row. Do not add fabricated privacy links. |
| P1-5 / S | Caption, list and motion controls form three separate horizontal blocks (`knowledge-atlas-visual.tsx:54–70`). | Caption remains stable and readable; one utility row aligns Explore connections with motion. Expansion naturally adds content below; no fixed-height clipping. |
| P1-6 / M |1024px has552px graph column and360px panel; tablet stacks but panel narrows to440px within640px content (`landing.css:100–108`). Mobile guest geometry was not browser-signed-off in06. | Preserve responsive slice reduction. Align tablet hero/panel/graph to one440px study column; guest-first ordering shortens mobile decision path. Validate long Vietnamese labels, not only English at1440. |
| P1-7 / S | Current optional motion translates the whole map only2px/1px over28s (`landing.css:81–84`). Static default is intentional. | Keep opt-in; increase only whole-layer excursion to3px/2px over32s. Most “life” must come from relationship response, not a background loop. No independent node drift or edge pulse. |

## P2 — optional, only after P0/P1 pass

| ID / effort | Optional refinement | Limit |
|---|---|---|
| P2-1 / S | A single280ms figure entrance,≤4px translation | No initial hidden content, CTA delay, stagger, re-entry on locale change or reduced-motion animation. Safe to omit. |
| P2-2 / S | Four short calibration ticks at the graph perimeter | Decorative only, no fake scale/coordinates or dot field. Omit if they compete with edges or make it look like a dashboard. |

## Before / after decisions

| Region | Current | Target | Implementation direction |
|---|---|---|---|
| Hero | Large headline above a separate320px diagram; long supporting line | One editorial introduction flowing into a360px knowledge field; panel starts at headline | Scope grid/padding/type in landing.css; preserve DOM order hero→entry→graph. |
| Graph | Uniform148px label boxes,4/6px dots, shared orthogonal routes | Four anchors, two bridge subjects/concepts, six supporting concepts; curved one-hop neighborhoods | Presentation coordinates/ranks + bounded edge geometry + neighbor state, not a new graph engine. |
| Entry panel | Account tabs and repeated unavailable text above the working action | Guest-led entry surface; account modes subordinate but explicit | Reorder existing elements, consolidate availability copy, refine panel rhythm/border. No new auth functionality. |
| Header | Utility controls carry much of the contrast | Slightly stronger CA identity, quieter utilities |36px mark/19px brand on desktop; preserve compact mobile sizing and target sizes. |
| Capability strip | Four equal text blocks; two rows even at1280 | Quiet, actionable four-column band at1280+ | Reuse capability destinations with prefetch disabled; no new route, marketing section or metrics. |

## Review conclusion

Change **presentation geometry, visual ranks, entry ordering and scoped surfaces**. Keep product boundaries and most copy. Graph geometry is the only L-sized work; everything else is a bounded component/CSS refinement. Do not interpret “cinematic” as permission to introduce 3D, particles, automatic motion, bright gradients, larger marketing sections or a new brand/font.

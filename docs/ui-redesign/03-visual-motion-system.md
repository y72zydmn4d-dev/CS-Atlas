# 03 — Knowledge Atlas visual and motion

## Technology and meaning

Use a server-resolved public projection, SVG edges and ordinary HTML labels over deterministic coordinates. This is a small editorial view of existing canonical relationships, not the full `/atlas` graph, a force-layout simulation, a roadmap or a mastery visualization. Do not reuse the positional-index selection in `KnowledgeAtlasPreview` or import the full Atlas model into a client merely for a landing image.

Default is **static layout + interactive relationship emphasis**. Dynamic response gives the figure life without an always-running renderer. Provide View knowledge atlas (`/atlas`) as the real exploration action. Task 2 includes optional user-enabled motion defined below; zero automatic ambient motion.

## Node hierarchy

| Presentation type | Meaning / visual contract |
|---|---|
| Domain heading | Resolved domain labels in text/capability copy, not nodes in this 12-node slice. Do not mix domain membership and prerequisites into one unlabeled edge. |
| Subject anchor | Python: canonical topic record, anchor dot 6px, 14px medium label. It is a presentation rank, not a new domain entity type. |
| Concept anchor | Programming Fundamentals, Linear Algebra, Machine Learning Fundamentals: dot 6px, 14px medium, small background backing only where needed for crossing edges. |
| Supporting concept | Complexity Analysis, Arrays, Recursion, Multivariable Calculus, Optimization, Gradient Descent, Neural Networks: dot 4px, 12–13px label. |
| Advanced concept | Dynamic Programming: dot 4px, 12–13px label, optional short advanced tag in detail text, not a different hue. Difficulty cannot be inferred from position or dot size. |

“Subject/anchor/supporting” are layout ranks only. Use canonical `name`, `summary`, `slug`, domain and difficulty owners; don't relabel Machine Learning Fundamentals as an entire course. Do not add C++, Java, NLP, OS or Networks just to fill space. Additional slices require actual records and relationships, not invented connections.

## Fixed public slice and layout

Wide figure viewBox 800×320. Node rectangles center on these coordinates; within each rectangle, a left dot is the edge anchor and label is to its right. Maximum rectangle 148×52 (two/three short lines as needed), no truncation of meaningful names; cap anchor title at 14px and supporting at 13px. Layout below leaves ≥12px rectangle gaps with 148px widths; resolve Vietnamese wrapping in Task 2 and shrink the visible slice rather than type if labels collide. The graph figure has its own layout box; no nodes behind hero or panel.

| Canonical ID | Presentation rank | x / y |
|---|---|---|
| `topic:programming-fundamentals` | anchor | 112 / 42 |
| `topic:complexity-analysis` | supporting | 290 / 42 |
| `topic:arrays` | supporting | 468 / 42 |
| `topic:ml-fundamentals` | anchor | 686 / 42 |
| `topic:python` | subject | 112 / 148 |
| `topic:recursion` | supporting | 290 / 148 |
| `topic:dynamic-programming` | advanced | 468 / 148 |
| `topic:neural-networks` | supporting | 686 / 148 |
| `topic:linear-algebra` | anchor | 112 / 268 |
| `topic:multivariable-calculus` | supporting | 290 / 268 |
| `topic:optimization` | supporting | 468 / 268 |
| `topic:gradient-descent` | supporting | 686 / 268 |

Compact figure (1024–1279px) uses 560×260, eight nodes: fundamentals (86/36), complexity (280/36), Python (86/128), ML foundations (468/36), neural networks (468/128), linear algebra (86/224), optimization (280/224), gradient descent (468/224). Max rectangle 140×52, fixed label size; retain only edges with visible endpoints. No full 12-node figure scaled to unreadable text. At 1024px narrow column, validate actual label boxes against 14px text; use static six-node subset if wrapping needs more space, with no invented replacement edges.

Coordinates and IDs belong in a small authored presentation record, not canonical metadata. Server adapter resolves labels/URLs and relation records; serializes only the bounded projection to the client. Reject missing IDs/relations, duplicates and self-links in a focused validation test. Never mutate canonical registries or upload local progress to drive this visual.

## Edge contract and proven relationships

The following 13 edges are present in the Topic seed/derived canonical relation registry (`content/topics.ts:42–99`, `content/concepts/registry.ts`). Filter by relation type, not proximity. Source → target on a prerequisite means **the source is a prerequisite of the target in this authored Atlas**, not a universal curriculum requirement.

| Source → target (all `topic:`) | Relation / explanation |
|---|---|
| programming-fundamentals → complexity-analysis | PREREQUISITE_OF |
| programming-fundamentals → recursion | PREREQUISITE_OF |
| complexity-analysis → arrays | PREREQUISITE_OF |
| complexity-analysis → dynamic-programming | PREREQUISITE_OF |
| recursion → dynamic-programming | PREREQUISITE_OF |
| python → ml-fundamentals | PREREQUISITE_OF |
| ml-fundamentals → neural-networks | PREREQUISITE_OF |
| linear-algebra → neural-networks | PREREQUISITE_OF |
| linear-algebra → optimization | PREREQUISITE_OF |
| multivariable-calculus → optimization | PREREQUISITE_OF |
| optimization → gradient-descent | PREREQUISITE_OF |
| python ↔ programming-fundamentals | RELATED_TO, undirected |
| gradient-descent ↔ neural-networks | RELATED_TO, undirected |

This is a connected subset with cross-field edges, not an exhaustive prerequisites list. Selected explanations say this explicitly. Do not add NumPy→ML, language→algorithm or graph→AI edges unless the owning relation registry supports that exact semantic type. Deduplicate RELATED_TO direction, prefer the specified prerequisite if a pair also has a related edge.

- Prerequisite: solid 1px stroke, subtle arrowhead. Related: dashed `3 5`, no arrowhead. SVG non-scaling stroke so width stays stable.
- At rest: border-strong at roughly 55% against canvas in dark, 70% in light. Decorative lines may be subtle; readable labels and the text relationship alternative convey meaning independently.
- Focus/selection: incident edges use accent/cyan at readable strength, 1.5px; nonincident edges at 15% strength; labels do not dim below normal text contrast. Do not animate every edge or draw random connections.
- Route paths around label rectangles using stable waypoints; ≤2 bends/edge or a single restrained curve. Long Python→ML link uses free corridor near y=92, lower-to-upper cross-links use the gaps at y≈208; never draw through labels. Paths stay inside the viewBox with 12px safe inset. Endpoint coordinates come from same record as nodes.

## Interaction and accessible counterpart

- The visual SVG/label layer is `aria-hidden` and nonfocusable; its node hotspots are presentational groups/spans with pointer delegation, not hidden native buttons. An adjacent **Explore connections** disclosure contains an ordinary keyboard-accessible HTML list of the same nodes, in table order, plus their direct relation text. The visual is a pointer enhancement of this list, not a canvas-only control. No duplicate screen-reader labels for the same node.
- Pointer hover highlights one-hop edges and shows a fixed caption-region summary; no floating tooltip over form. Leaving clears hover unless a node was selected. Click/tap toggles selected ID; second click clears it. Only one selected/hovered ID; hover temporarily overrides selection, then selection restores.
- In the list, each node is a button with `aria-pressed`; Tab follows ordinary list order, Enter/Space toggles same selection. Escape clears selection while focus remains. Detail includes resolved title, ≤140-character summary, direct labeled relationships and a real “Open concept” link from canonical slug. Selecting never navigates, pans, records progress or changes auth state.
- Caption/detail reserves 72px at desktop, grows naturally for longer text. A selected list item announces the detail politely once; hover does not produce live announcements. No focus transfer on selection. List remains functional if SVG fails.
- The list and optional motion control are after the entry panel in DOM order, although desktop positions the graph left of it; primary entry must be reachable before 12 optional study controls. Closed disclosure adds one tab stop, not 12.
- ≤1023px: static six-node/tiny-map figure or no graphic; disclosure/list remains optional below the entry panel. Mobile default omits the graph graphic, shows a one-sentence connection example and View knowledge atlas. No tap-to-pan, no hover dependency.

## Motion tokens and behavior

Keep existing easing `cubic-bezier(.2,.75,.25,1)`. Reuse current duration roles where possible; scope landing-specific ambient roles.

| Category | Duration | Exact behavior |
|---|---|---|
| Micro | 120–160ms (`--motion-fast` 140ms) | Border/background change, button response, visibility-toggle icon |
| Component | 180–240ms (`--motion-base` 220ms) | Mode panel opacity, disclosure/selection emphasis; no height animation on error text |
| Page entrance | 280–360ms once | Optional hero/figure opacity plus ≤6px rise; all content visible in initial HTML without JS, no animation delay on entry CTA |
| Relationship | 180–220ms | Incident edge opacity/stroke transition, no traveling particles, no looping dashes |
| Drawer, later app | 220ms | Existing transform/focus behavior; no new landing drawer |
| Ambient, explicit opt-in | 24–32 seconds | Move the entire graph layer including its edges by ≤2px x / ≤1px y inside safe inset; no independent node drift or layout simulation |

Optional desktop button “Enable gentle motion” / “Bật chuyển động nhẹ” toggles to “Pause motion” / “Dừng chuyển động”; 44px target, `aria-pressed`, component-memory state only, initial false. Move a single parent containing labels and SVG together; connections never detach. Pause immediately while any auth-panel control is focused, graph selection is active, disclosure is open, figure is offscreen or document is hidden; resume only if user opted in. Pause means freeze the current transform, not snap/restart. No requestAnimationFrame loop or per-frame React setState; CSS keyframes + play-state suffice.

Below 1280px, reduced motion, print or no-JS: omit ambient toggle and animation. Under reduced motion remove entrance, drift, animated height, transforms and fades; update state instantly and leave all content visible. Preserve meaningful position transforms used for static layout. No auto-pan, parallax, bounces, blur transitions, shimmer, pulsing CTA, constant status pulse or long stagger.

## Fallback and limits

Failure of enhancement leaves initial labels, caption, real links and HTML relationship list. Omission of the entire figure leaves headline + entry + Browse lessons intact. Default graph does not animate and creates no CPU animation work. Stop optional animation offscreen; no expensive per-node filters. Graph has ≤12 nodes, 13 expected edges (hard cap 16), one detail region, fixed dimensions and no network/provider data source. Print only static caption/list as appropriate.

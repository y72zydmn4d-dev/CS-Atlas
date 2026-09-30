# Approved aurora artwork integration QA

Status: APPROVED AURORA ARTWORK — INTEGRATED. LANDING — FROZEN PENDING FINAL HUMAN SIGN-OFF. Implementation and automated validation complete; composed browser/human sign-off outstanding. This asset-backed implementation supersedes procedural background directions in12 QA, not the landing composition.

## Approved asset / provenance

| Asset | Format / dimensions | Size |
|---|---|---|
| Attached `codex-clipboard-7ZzpqI.png` / exact reference `docs/ui-redesign/references/approved-aurora-background.png` | PNG,1672×941,sRGB, opaque pixels (alpha channel in source) |2,016,126B |
| `/backgrounds/cs-atlas-aurora.webp` (`public/backgrounds/cs-atlas-aurora.webp`) | WebP,1672×941,sRGB |154,548B (151KiB;92.3% smaller) |

- Actual approved image copied byte-for-byte, not regenerated/recreated or replaced with existing workspace topology assets. Original outside public; only WebP served. No unnecessary AVIF/size variants.
- Encoding uses already-installed Sharp: `.webp({quality:94,effort:6,smartSubsample:true})`, no resize/upscale/recolor/filter. Reproduce from reference with the same installed stack. WebP strips the redundant fully opaque alpha automatically. No dependency/package change.
- Reference SHA256 `1ce15b99bc384177de967ceaf27dfed52469d15edba5e1708c7b27d7f125b88b`; WebP `ceef58e90ef0777ba868ff77c1dcc077c77d9ef66fc4e928b94b1d9877b9a9c1`. Asset test protects approved source fingerprint, same intrinsic size/format and≤250KB budget.
- Viewed both original and production image directly: cyan left, calmer dark center, indigo-violet right, fine contours/points retained; no obvious banding at inspected scale. This is asset inspection, not composed browser QA or proof at every display/gamma.

## Architecture / removed effects

- Existing Server Component `LandingAtmosphere` now only two decorative div layers: `landing-artwork` and stationary `landing-readability`. No new client boundary or lifecycle.
- Dark artwork is native CSS `url("/backgrounds/cs-atlas-aurora.webp")`, full opacity, centered `cover`. No fading it to3% or substituting CSS aurora. No duplicated artwork plane.
- Removed all six procedural SVG curves, four procedural points, three aurora planes, their five color roles and three obsolete keyframes. Baked-in approved geometry/lights now supply the atmosphere. Existing workspace images/styles untouched.
- Reading treatment is **localized**, not a flat page-wide navy veil: upper text ellipse82→75% alpha then transparent, map field35% maximum then transparent, gentle header/lower fade. Image itself remains fully opaque; lower/lateral art remains pronounced. Protect existing text/edge tokens before increasing graph brightness; no graph/node/edge/Guest/panel changes.
- Opaque entry surface and graph-label backings retained. Public shell, composition, routes, local-first data, auth tabs, header/band/footer and EN/VI unchanged.
- Decorative z0 versus frame z1, `aria-hidden=true`, `pointer-events:none`; only decoration clips. No keyboard descendants, alt semantics, canvas, image UI, video, GIF, WebGL or filters.

## Motion / loading / themes

- Existing shared default-on atmosphere preference on ≥1280/no-reduced-motion; graph drift still initially off. “Pause motion” freezes artwork and optional graph drift; resume follows existing opt-in behavior. Selection/list/hover/offscreen/document-hidden/entry-focus pause signals unchanged; no second state owner.
- One64s ease-in-out alternate traversal, phase-16s: scale1.035→1.055→1.04; translate+.35/.2%→-.5/-.3%→+.6/.4%. Small overscan prevents exposed edges, no obvious wallpaper slide intended. Image only transform animates; overlay static. Actual10–20s perception still requires human check.
- Reduced motion: animation removed by existing landing-wide rule and transform explicitly none. Approved image remains visible, centered/static. Print/forced colors omit decorative layer.
- Light: **optionA**, replace dark image with two pale native gradients (3% accent/2% relationship) in the same layer. Shared motion can drift that lightweight fallback on eligible desktop; no dark art as light's computed background. Existing root SSR starts dark, so a saved-light visitor may still initiate the image request before preference reconciliation; no theme-provider/loading-state redesign.
- Matching existing navy base under image, no JS loading state/fade delay. CSS file discovers the image natively; a slow network can show the base before image arrives. No preloading dark artwork unconditionally onto every workspace route. Decorative absolute positioning cannot introduce a content layout box/CLS.

## Responsive/source checks

Canvas is absolute, height`min(100svh,1200px)`: opening long relationship content no longer stretches the image/crops both sides. Additional page content continues on existing canvas. No layout reordering/width change.

| View | Placement / behavior |
|---|---|
|1920×1080 /1600×900 |Source≈16:9 fills frame; both broad auroras retained, slight animated overscan. |
|1440×900 |Centered cover:≈10% total horizontal source crop before scale; cyan/violet bands retained. |
|1280×900 |Centered cover:≈20% horizontal source crop before scale; same image/motion. Shorter laptop viewport crops less. |
|1024 /tablet |Static, transformnone; centered cover and simpler transparent vertical reading wash. |
|430 /390 phone |Static, transformnone;54% horizontal crop favors dark central source, no additional layers/points or mobile animation. |
|Light /reduced motion |Light computed background excludes artwork; reduced-motion dark retains still image. Existing responsive product UI unchanged. |

- Approximate source-pixel/sRGB model sampled intro envelope at2px steps (y210–345; frame-left to min(half viewport,700px)) for three motion keyframe poses: secondary-text minima1920×1080:5.96,1600×900:5.27,1440×900:5.17,1280×900:5.79:1. Initial lighter upper shield produced risk and was corrected. These are sampled source/alpha estimates, **not** actual glyph bounds, continuous animation, full-page/header/caption contrast or browser certifications. Previous12 QA gradient-only contrast figures do not apply to this bitmap.

## Validation / performance

- A e4dc45b: typecheck/lint/focused18 tests pass. B78979a6: typecheck/lint/full52 files/288 tests pass. C52f004d: typecheck/lint/focused18 tests pass; diff whitespace passes.
- Final `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run audit:build`: PASS.52 test files/288 tests; final search69.27ms against unchanged100ms budget. Build736 pages. Typecheck re-passed after restoring only build-generated next-env imports to the original pre-existing blob.
- Build audit:99 JS chunks/916,587B gzip; largest148,115B/route10,447B. Public9 initial scripts168,943B/root5,150B. All byte counts unchanged from f69bd4e; no new client code, packages or dependencies.
- `node scripts/audit-public-entry.mjs http://localhost:3010`: PASS all16 routes, script/style assets, root artwork mount and Guest destination. `/problems` additionally200. HTML boundary check: root one atmosphere; `/home` and `/learn` zero.
- Static asset smoke:200, `image/webp`,154,548B byte-for-byte match, emitted CSS reference verified; ETag conditional request304. Cache-Control is standard `public, max-age=0`, not immutable. Initial default Fetch conditional request returned200; diagnostic now uses explicit `cache:"no-cache"` revalidation and passes304. No application serving/cache policy change.
- Network adds one154,548B artwork asset on dark initial view; original PNG not in public. Existing build budgets concern JS; asset size is separately covered by≤250KB test/smoke budget.
- One decoded image/composited animated plane instead of two large procedural moving planes plus SVG; no frame React work, heavy library, animated blur or permanent `will-change`. Real GPU/memory/thermals/CWV unmeasured; mobile static deliberately avoids continuous work.
- Task-owned3010 server stopped. Unrelated next-env.d.ts preserved/excluded, blob `a419cbe4e3a5e8d4b481b851dbf4ac767de069e6`. No routing/data/auth/vendor changes; no push/merge. Diff whitespace check passed.

## Remaining human sign-off

Safe browser discovery: no apps/browsers, native pipe startup failed. No real screenshot, console, overflow, font-wrap, keyboard or motion perception claims. Only approved/optimized artwork was directly viewed.

1. Dedicated local browser, dark:1920×1080,1600×900,1440×900,1280×900. Immediately perceive cyan left / calm center / indigo right and baked scientific lines. Compare toggling the image layer off/on in DevTools: must materially change atmosphere. Content/map/Guest must still dominate.
2. Observe10–20s without manually enabling; pause/resume, hover/select/list, entry focus and hide/return tab. Confirm stillness when paused and no edge gaps/obvious whole-wallpaper sliding. Do not increase intensity reflexively.
3. Tablet1024/820 and430/390 phone: calm static source crop, Guest accessible, no dramatic energy under text, no added scrollWidth/CLS. Open long relationships; viewport art framing remains stable, lower content readable.
4. Light theme clean paper/soft gradients, reduced-motion dark visibly retains art without movement; forced colors/print omitted. Test both locales, keyboard/focus/native list/tabs, actual secondary/caption/header contrast. Asset/page loading waterfall and console require browser inspection.
5. `/home`, `/learn`, `/learn/python`, `/practice`, `/explore`: unchanged workspace/no landing artwork. Never reset real user data.

Landing frozen pending final human sign-off. Correct only confirmed scoped artwork/readability regressions; no renewed landing/auth/product redesign.

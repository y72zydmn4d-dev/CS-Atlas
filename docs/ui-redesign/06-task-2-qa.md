# Task 2 — implementation and QA record

## Shipped scope

- Public /: server-composed identity, bilingual copy, minimal header, existing theme/locale, unavailable account tabs and native guest /home link. No credentials, providers, sessions, remote saves or auth middleware.
- /home: one extracted workspace Home implementation including creator footer; workspace brands/sidebar point there. Legacy Home breadcrumb literals normalize centrally. Other URLs and saved hrefs/data remain unchanged.
- Canonical preview:12 nodes/13 actual relationships, wide12/compact8/tablet6 layouts, mobile text fallback; SVG/HTML visual plus native list/buttons, explicit relation directions, selected Concept destination. Static default; optional desktop28s whole-layer motion with pause/reduced-motion rules. No dependencies added.
- Existing storage facade retains its API; theme/locale use its preference-only leaf. Same keys/encoding, no migration/reset. Full learning/Library services are workspace-only mounts.

## Automated evidence

| Check | Result |
|---|---|
| Typecheck / lint | Passed |
| Unit/integration suite |50 files /253 tests passed at final checkpoint |
| Production build | Passed;736 pages generated; public / and /home static |
| npm run audit:build | Passed;915,862B total gzip; largest chunk148,115B; largest route10,447B |
| node scripts/audit-public-entry.mjs http://localhost:3010 |16 routes200; root public shell, workspace SSR on deep routes; no credential forms; creator footer at /home |
| Projection tests |12 canonical IDs/13 real edges, localized metadata/resolved slugs, <12KiB JSON; rejects missing/duplicate/self/invented relations and invalid coordinates |
| UI tests | Guest href; unavailable modes/manual tab focus; locale/theme; preserved local progress; native list/selection/Escape; no focusable aria-hidden controls; desktop opt-in and offscreen/document-hidden pause |
| Persistence compatibility | Legacy storage facade and preference leaf share keys/encoding; corrupt/restricted storage defaults tested |

Smoke routes: /, /home, /learn, /learn/python, /learn/python/introduction, /practice, /explore, /library, /progress, /assistant, /profile, /settings, /search, /atlas, /topics/python, /concepts/topic-python. Actual Atlas AI URL remains /assistant.

The smoke script performs GETs only and restricts its origin to localhost. It does not execute Practice code, submit AI requests or read browser-local Library data.

## Performance evidence and limits

- Initial native Chrome resource census before preference split:225,583B gzip for10 modern JS files, including an83,953B shared storage/learning chunk. No automatic workspace link prefetch.
- Final post-split local production HTML script census:168,400B gzip including Next/React and shared providers/messages; root route chunk4,386B gzip. The route chunk plus icon/shared dependencies must be counted honestly; this is not a4KiB entire application.
- Public initial script checks exclude full canonical records and React Flow/QuickJS/PDF.js/Mammoth markers. Graph serializes only its bounded display projection; no renderer/runtime, per-frame React state or animation network requests.
- HTML census does not prove hydration requests/timing. Native pre-split resource list matched the script census; fresh post-split browser network verification remains manual.
- LCP/CLS/INP lab measurements and field Core Web Vitals were not measured. No performance certification claimed. System font fallbacks retained; no new font/image fetches.
- Token contrast arithmetic (normal final palettes): secondary text/surface light6.36:1, dark8.69:1; control border/surface3.99:1 and4.42:1; white CTA text6.11:1 and5.57:1; focus/canvas5.67:1 and9.03:1. Still requires rendered/forced-colors review.

## Browser checks actually observed

Dedicated native Chrome window at localhost:3010 (not the user's existing app origin):

- Dark English1440×900: public header/hero/form substitute/12-node graph inspected; guest visible, no obvious overlap. DOM readout:innerWidth1440, scrollWidth1440, guest top413.09px and49.09px height. Application console showed0 errors.
- Light Vietnamese1600×900: hierarchy, localized labels, graph and opaque entry surface inspected; no obvious overlap.
- Initial approximately1154px desktop: compact8-node graph and entry side-by-side inspected.

Chrome/IAB tab automation APIs returned unavailable. Native app control follows the active window; focus subsequently returned to an unrelated user window. QA interaction stopped rather than touching user content. No other windows/tabs were navigated, closed or modified. The dedicated QA window may remain open. No screenshot of unrelated content is stored in this repository.

Only this task's local production server was stopped after final smoke checks. No unrelated server/browser window was closed.

## Remaining manual sign-off — NOT PASSED YET

Use a fresh isolated browser profile/context and a dedicated QA origin; do not clear the user's learning data. Run npm run build, then npm run start -- --port3010. Re-run the smoke script. Check final code, not the earlier desktop screenshots.

| Width / height | Required review |
|---|---|
|1600×900,1440×900 | Recheck final graph label sizing, paths, auth/hero balance; both themes/locales |
|1280×800 |12-node readable layout,384px panel, no label collisions/overflow |
|1024×768 |8-node compact view,360px panel, no motion control, no squeeze |
|820×1180 | Stacked hero→entry→6-node static figure; panel≤440px |
|430×932,390×844 | Guest easy to reach; graphic omitted, headline fits; assess guest top≤600px especially Vietnamese |
|320×640 | Header fits with44px controls; guest/text/fields substitute unclipped |
|667×375 | Normal vertical scroll, no graphic, all controls reachable |
|200% zoom / narrow reflow | No clipped controls/offscreen focus or unintended horizontal scroll |

At each: dark/light + English/Vietnamese; inspect true scrollWidth and element bounds (not only the global overflow-x:hidden rule).

Workflow checklist:

- Keyboard-only: skip link, header/locale/theme, manual Arrow/Home/End account tabs; Enter/Space activates; leaving unactivated tab restores selected entry tabstop. Guest before optional graph controls in DOM order. Disclosure/list select and Escape retain focus.
- Focus rings visible, no hidden node button. Reduced motion via browser emulation removes optional motion control/drift/transitions, preserves static coordinates.
- Opt-in motion freezes on entry focus, selection, open disclosure, offscreen figure and hidden tab; pause button freezes rather than resets. Confirm pointer hover temporarily overrides/restores selection.
- Guest link and Browse lessons work without JS; root does not redirect based on storage. Open /home and deep routes directly; browser Back restores public shell without workspace side effects.
- Local progress/bookmarks/Library/preferences retained across entry (non-destructive test records only). No provider/auth/AI request or Library read on root.
- Check final console/network for hydration warnings, errors, unexpected workspace prefetch/runtime scripts. Screen reader review (VoiceOver/NVDA) for tab selection, status and native disclosures is outstanding.
- Contrast token arithmetic is helpful, not a substitute for rendered contrast/forced-colors review. Verify text≥4.5:1 and necessary control/focus boundaries≥3:1; selected state also uses underline/aria-selected.

## Out of scope

Real account credentials/loading/validation/reset/provider/security flows require the separate auth ADR and genuine adapter. Cloud sync/backup, full app redesign and release/security certification are not implemented. Future auth must not reuse guest navigation as successful sign-in.

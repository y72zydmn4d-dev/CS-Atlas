# 05 — Task 2 implementation plan

Task 1 is design/documentation only. Task 2 implements the public entry and minimal supporting shell/route work; application redesign and production authentication remain later tasks. Primary specification: [02](02-landing-auth-ux-spec.md). Baseline source audit: [00](00-current-ui-audit.md).

## Scope and release decision

Build `/` public landing, `/home` existing workspace Home, route-aware public/workspace shell composition, shared theme/locale, static plus interactive SVG graph, honest unavailable account modes and functioning guest links. No auth dependencies, provider placeholders in production, credential form capture, sessions, data migration, cloud backup, private-data AI, new remote judge, full offline promise, global app redesign or route namespace prefix.

Do not build future `AuthField`/password/reset/social infrastructure merely to make a screenshot look complete. Their responsibilities below preserve the intended available-state design for the future auth milestone. Keep an explicit `unavailable` capability, not a fake implementation returning success. Accounts require the separate ADR gates in `docs/atlas-v2/21-identity-profile.md`.

## Proposed ownership and component hierarchy

Use `components/landing/` for public presentation, `lib/concepts/landing-projection.ts` for the pure bounded projection adapter, and a small `content/landing/knowledge-preview.ts` presentation record containing IDs/ranks/coordinates/relation selectors only. This is an editorial view over current canonical records, not a parallel curriculum. Task 2 records the new ownership in `docs/atlas-v2/05-directory-structure.md`. Shared landing role styles belong in existing `app/workspace.css` under a public-shell scope; leave legacy/global token values intact. Add messages through current typed EN/VI infrastructure.

```text
RootLayout (server: html/body/metadata/styles)
└─ ThemeProvider + LocaleProvider (existing)
   └─ RouteShell (small client gate, pathname only)
      ├─ path /: server-composed public children, no workspace providers/chrome
      │  └─ PublicLandingShell
      │     ├─ LandingHeader + PreferenceControls
      │     ├─ LandingHero
      │     ├─ EntryPanel (capability: unavailable)
      │     │  ├─ AuthModeTabs
      │     │  ├─ UnavailableAccountNotice
      │     │  ├─ GuestAccessLink
      │     │  └─ LocalDataDisclosure
      │     ├─ KnowledgeAtlasVisual + ConnectionList + detail
      │     ├─ CapabilityStrip
      │     └─ LandingFooter
      └─ other current feature paths + /home: WorkspaceProvidersShell
         └─ WorkspacePreferencesProvider → AtlasProvider
            → existing AppShell + SelectionTranslator + passed route children
```

Root currently wraps every route in AppShell (`app/layout.tsx`). A client gate can receive server-composed `children` without importing server pages. Load `WorkspaceProvidersShell` dynamically from that client gate, with server rendering retained, rather than eagerly importing AppShell/Search/content registries into the public bundle. Keep workspace fallback stable and accessible. A conditional render alone does not prove imports were excluded—inspect production chunks and network requests.

This avoids physically moving every feature route into a route group. Do not gate via localStorage first-visit flags, create competing root layouts or disable SSR for the whole workspace/landing. If measured bundling fails to isolate workspace chunks, use URL-neutral public/workspace route groups as an implementation fallback only after a precise file-move/parity plan is recorded; no prefix changes or new auth policy. Avoid speculative bulk relocation by default.

| Component / owner | Responsibility / inputs | State ownership | Interaction responsibility / boundary |
|---|---|---|---|
| PublicLandingShell | Semantic frame, main, CSS grid; children | none | Server; skip link and anatomy, no workspace chrome |
| LandingHeader | Brand, Browse lessons, control slots | none | Server composition; real links; compact targets |
| PreferenceControls | Existing locale/theme controls | existing providers | Client; expands targets by landing scope; no new persistence |
| LandingHero | Chosen short identity copy | locale provider if hydrated message adapter | Server structure; small existing Message islands keep current locale model |
| EntryPanel | Availability + active mode + local disclosure + action layout | mode; no user identity | Client island prerendered with truthful unavailable default; receives serializable capability |
| AuthModeTabs | Sign in/Create account selection, stable IDs | controlled mode from panel | Client; tab semantics and keyboard movement |
| UnavailableAccountNotice | Truthful status + selected explanation | none | Rendered in initial HTML; no credential collection |
| GuestAccessLink | Valid application entry path, default `/home` | none | Native link; no auth/storage side effect; works without JS |
| LocalDataDisclosure | Scope/retention/export details | native details open state | No JS required; don't add IndexedDB access |
| KnowledgeAtlasVisual | Serialized public projection, wide/compact records | active/selected ID, motion opt-in/pause | Client enhancement, SSR static figure; no force layout, private data, provider I/O or per-frame state |
| KnowledgeNode | Label/rank/coordinates from resolved projection | none | Presentational graph hotspot; actual keyboard selection belongs to ConnectionList |
| ConnectionList | Same node IDs/relationships + current selection | controlled selection | Native disclosure/list buttons; real resolved Concept links; works when SVG omitted |
| CapabilityStrip | Four existing capabilities and descriptors | none | Server structure + Message islands; no metrics or fake completion |
| LandingFooter | Current year, local-data disclosure | native disclosure | Server; no fake privacy/terms route |
| WorkspaceProvidersShell | Existing browser state providers, AppShell, translator | existing owners | Client; workspace-only mounts, preserve all behavior |
| Future AuthForm | Approved service capability/policy; current mode | in-memory values, touched/errors/request state | Client; validate/submit/cancel through real service; not Task 2 |
| Future AuthField / PasswordField | Label, value, policy/helpers/error, stable IDs | controlled values; local visibility | Client; autofill/paste, describedby/focus, no credential storage |
| Future RecoveryPanel | Service response/cooldown and email | form request state | Client; neutral anti-enumeration response, no token fabrication |
| Future SocialAuthButtons | Trusted configured-provider allowlist | controlled pending provider | Client; actual service redirect/response only, absent in Task 2 |

Client imports must not include server-only providers/keys/reference solutions. Pure graph projection should use `lib/concepts/service.ts` and current canonical relations on the server and emit ≤12 node display records with localized names/summary/slug. Reuse owning contracts/Locale types; narrow `unknown` at any external boundary. No React import into domain rules. Local concept view data does not confer authentication or ownership.

## Technology choice

| Option | Suitability / decision |
|---|---|
| CSS + SVG + HTML | **Chosen.** Small fixed topology, SSR labels and paths, ordinary list fallback, inexpensive state changes, optional one-layer CSS drift. No new dependencies. |
| Canvas | Avoid: manual text/size/hit testing and accessibility duplication add work; this node count does not need it. |
| Framer Motion | Not installed; CSS and current React state cover transitions. No dependency recommended. |
| React Flow | Installed and appropriate for existing Atlas/roadmap/mind-map exploration; avoid on landing because pan/zoom/edit/large-map capabilities are unnecessary. |
| Three.js / React Three Fiber | No meaningful 3D task, lighting or spatial navigation requirement; no installation or recommendation. Avoid hydration/GPU/context/thermal overhead and canvas-first accessibility. |

Read relevant **repository-local Next16 guides before framework implementation**: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`, `05-server-and-client-components.md`, `01-app/02-guides/lazy-loading.md`, `01-app/03-api-reference/03-file-conventions/route-groups.md` if used. Dynamic client code splitting is declared from a client boundary; never use `ssr:false` in a Server Component. Use promise-based route APIs where relevant. Task 1 only inspected framework/source guidance and made no framework edits.

## Performance and hydration strategy

- Server render headline, links, status and graph projection; enhancement never blocks first action. Current locale/theme Message providers hydrate, so do not claim the page is entirely zero-JS.
- No full `@/content` import from a new public client. Full search and Library/Atlas providers mount only in workspace. Set `prefetch={false}` on landing links into workspace/Concept pages so viewport prefetch cannot download heavy workspace chunks during the first visit; ordinary clicks still navigate normally. Measure Next network requests before claiming absent chunks. No graph/provider network requests.
- Landing additive client code target ≤30KiB gzip beyond necessary framework/shared theme-locale runtime; bounded graph serialized payload≤12KiB uncompressed. Targets, not measured results. Log actual route transfer, not only the page chunk: root/shared chunks can conceal regressions.
- Keep existing `scripts/measure-build.mjs` aggregate gates (1.5MB gzip all chunks;200KiB largest;100KiB largest route). Use production build artifacts and browser network to measure public-route total; existing script alone is insufficient to prove the30KiB target.
- Target LCP≤2.5s, CLS≤0.1, INP≤200ms under documented mobile test conditions. Task 2 lab observations are not field percentile certification. Record device/browser/network/throttle assumptions.
- Reserve figure height and panel/action geometry; font fallback must not shift entire panel. No hero image/video; no external font needed. Read preferred theme before painting only through an approved compatible change; otherwise explicitly report current provider flash. Do not widen Task 2 into a preference migration.
- Default motion has no animation loop. Optional single-parent transform only after opt-in; pause offscreen/hidden/auth focus. No continuous JS loop, per-frame React render, blur stacks or SVG filters. On mobile omit graphic and ambient motion; no active thermal work.
- CSS imported globally still includes existing React Flow style import; don't claim it vanished. Measure and defer CSS ownership cleanup if it isn't needed for entry budgets. Keep QuickJS/PDF.js/Mammoth/React Flow JS and WASM absent from initial public landing downloads; preserve vendor loader bytes.

## Implementation sequence and checkpoints

1. **Resume safely.** Read this progress file and all00–05 documents, AGENTS.md and current docs; verify branch/status/log/root. Preserve unrelated `next-env.d.ts` and all later work. Read local framework guides. Record baseline screenshots/network of current Home; no dependencies.
2. **Entry composition and minimal routes.** Add public `/`, retain current Home at `/home`, root gate/workspace provider isolation, contextual Home references and descriptive metadata. Update route/capability tests and architecture route/ownership notes. Keep every other feature path.
3. **Static design.** Scoped roles, desktop/tablet/mobile anatomy, paired copy, unavailable account modes, native guest/Browse links and local-data disclosure. Validate guest paths before adding graph enhancement.
4. **Meaningful projection and motion.** Server resolve the specified12 nodes/13 relations; fixed paths, compact layout, accessible list/selection, restrained transitions, explicit opt-in ambient control. Test invalid relation endpoints, subset parity and reduced motion.
5. **Verification and handoff.** Focused meaningful workflow tests, then `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; no install. Run relevant browser matrix from04, measure bundles/network and diff boundaries. Build may regenerate `next-env.d.ts`; compare to preserved baseline and do not commit unrelated/generated changes. Never edit generated Practice output; check integrity.
6. **Documentation.** Update `docs/STATUS.md` with actual implemented entry capability, relevant architecture/directory/route notes and this PROGRESS; don't mark accounts or later app redesign complete. Record exact changed files, checks, limitations, actual performance measurements and rollback. No push/merge without a later explicit request.

Keep phase checkpoints as work progresses so an interruption can resume from the diff. Task 2's eventual commit policy comes from its user instruction; Task 1 authorizes only the single local documentation commit.

## Acceptance criteria for Task 2

- [ ] `/` is public entry without workspace sidebar/topbar, global search or private-data reads. `/home` shows existing Home, including local progress/bookmarks and creator footer.
- [ ] Existing feature/deep links, legacy Learn aliases, Search and stored bookmark destinations still work. Root behavior change is documented; no data ID/href migration, clearing or automatic upload occurs.
- [ ] Within five seconds identity, connected-learning purpose and a functioning guest path are clear. No complete-course counts or unsupported promises.
- [ ] Current-release panel exactly matches unavailable contract; account modes explain availability and collect no email/password. Providers/recovery/forms/success are absent from production until a real service milestone.
- [ ] Both themes/locales, explicit1024 breakpoint and390–430 mobile entry priority work. Full current guest action is visible at target390×844; zoom/short height can scroll. No hidden overflow or colliding graph labels.
- [ ] Graph uses specified resolved IDs and actual relation types;≤12 nodes/16 edges; list/figure endpoints match. Selection/hover affects one-hop relationships, never progress or routing automatically.
- [ ] Keyboard, visible focus, form/tab semantics applicable to unavailable mode, disclosures and screen-reader messages work; full public entry usable without graph/animation. No focusable aria-hidden control.
- [ ] Motion static by default, optional bounded single-layer drift only when enabled, reduced motion/offscreen/hidden/auth focus rules honored.
- [ ] No new dependency; no3D/graph engine public bundle; performance targets measured with shared chunks counted. Report any unmet target with cause and next fix, not a claim of success.
- [ ] Quality scripts and relevant browser workflows pass or blockers/gaps are explicitly reported; server/client/private-solution boundary and Practice vendor integrity remain intact.

## Deferred decisions and safe defaults

| Decision | Owner / default until resolved |
|---|---|
| Auth provider, session, password policy, verification/recovery, MFA, account privacy/legal, abuse controls | Separate auth ADR/milestone; capability unavailable, no credential collection |
| Account sync and local-to-account import/conflicts/rollback/Library consent | Separate persistence milestone; existing local browser state continues |
| Additional font/brand redesign | Later design review; existing CA mark and system-capable fonts |
| Expanding graph coverage and multilingual label adjustments | Authored projection and tests; keep canonical labels and remove nodes if needed for readability |
| Field Core Web Vitals / release security audit | M14; lab checks don't replace operational release review |

**Exact Task 2 starting point:** inspect current worktree on `atlas-v2`, read this package, then implement step2 (public `/` + preserved `/home` + minimal route-aware shell) with the guest-first unavailable panel from02. Do not begin by installing an auth or animation library.

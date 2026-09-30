# 02 — Public landing and auth UX specification

Design decision, not implemented behavior. Read [00](00-current-ui-audit.md), [01](01-design-principles.md), [03](03-visual-motion-system.md), [04](04-responsive-accessibility.md) and [05](05-implementation-plan.md) together. This is the primary build specification for Task 2.

## Product decision and first five seconds

The public entry is a technical study environment organized around connected knowledge. Main focal point: a clear headline and grounded map; the entry panel is the next visual anchor. No marketing carousel, dashboard screenshot, metrics, pricing, testimonial block or long scroll campaign.

Chosen copy:

| Role | English | Vietnamese |
|---|---|---|
| Brand | CS Atlas | CS Atlas |
| Eyebrow | COMPUTER SCIENCE · DATA · AI | KHOA HỌC MÁY TÍNH · DỮ LIỆU · AI |
| Headline | Understand the connections. | Hiểu những mối liên hệ. |
| Supporting statement | Learn computer science through connected concepts, lessons and practice—from algorithms to artificial intelligence. | Học khoa học máy tính qua các khái niệm, bài học và thực hành được kết nối—từ thuật toán đến trí tuệ nhân tạo. |
| Map caption | A small view of connected knowledge. | Một góc nhìn về tri thức được kết nối. |
| Entry title, current release | Enter CS Atlas | Vào CS Atlas |
| Guest action | Continue as guest | Tiếp tục với tư cách khách |
| Local scope | Progress, bookmarks and Library files stay in this browser. No account sync or cloud backup. | Tiến độ, dấu trang và tệp Library được lưu trong trình duyệt này. Không đồng bộ tài khoản hoặc sao lưu đám mây. |
| Account unavailable | Accounts are not available yet. You can learn as a guest. | Tài khoản hiện chưa khả dụng. Bạn có thể học với tư cách khách. |
| Guest data detail | Clearing site data or changing browsers can remove access to local records. Library exports contain metadata, not original files. | Xóa dữ liệu trang web hoặc đổi trình duyệt có thể làm mất quyền truy cập dữ liệu cục bộ. Bản xuất Library chứa siêu dữ liệu, không chứa tệp gốc. |

Supporting copy: one paragraph, max 45 English words / ~3 desktop lines, no list of every language. Alternate headline directions for a later editorial review only: “Computer science, connected.” / “A map for serious study.” The chosen headline above is the Task 2 default.

CTA hierarchy depends on actual availability:

- **Task 2 / auth unavailable:** primary = Continue as guest; secondary = header Browse lessons (`/learn`); account modes are discoverable explanatory UI, not credential forms.
- **Future auth available:** primary = mode-specific Sign in / Create account; secondary = Continue as guest, full-width outlined button; Browse lessons stays a quiet header link. Guest is never a tiny tertiary legal link.
- No repeated hero CTA: the entry panel owns the action. No global sidebar or command palette on the landing.

## Exact page anatomy

```text
PublicLandingShell — max outer width 1440px, centered
┌────────────────────────────────────────────────────────────┐
│ CA  CS Atlas               Browse lessons     EN VI  Theme │ 72px
├────────────────────────────────────────────────────────────┤
│ [eyebrow]                            [entry/auth panel]    │
│ Understand the                       Enter CS Atlas        │
│ connections.                         Account mode control  │
│ One short supporting paragraph       Capability/status     │
│                                      Active panel content  │
│ Meaningful 2D knowledge map           Continue as guest     │
│ 12 readable labels; faint links      Local-data disclosure  │
│ Caption + View knowledge atlas                             │
├────────────────────────────────────────────────────────────┤
│ Learn / structured lessons   Practice / public tests        │
│ Explore / connected concepts Library / your local resources │ compact strip
├────────────────────────────────────────────────────────────┤
│ © current year CS Atlas                    Local-data info  │ 48px min
└────────────────────────────────────────────────────────────┘
```

| Region | Build contract |
|---|---|
| Frame | `min-height:100svh`, document scrolling, no fixed hero height. Canvas opaque; grid only at outer margins. Outer width includes horizontal padding. |
| Header | 72px desktop / 64px mobile minimum; 32px mark + 18px wordmark; brand links `/`; right-aligned single Browse lessons link, existing locale and theme controls. Non-sticky on landing. No hamburger, Sign in duplicate, search, product mega-nav or provider logos here. |
| Main | At 1440px: 48px outer padding, 1344px inner width, columns `minmax(0,1fr) 400px`, 64px gap. Left is 880px. Main top/bottom padding 40px; panel top aligns with headline top (after eyebrow). Do not add a third fixed center column. |
| Hero | Heading width ≤18ch, text width ≤54ch, supporting copy 18px/1.6. Eyebrow 12px. At 1440px headline 56px/1.08, 600–650 weight; balanced 2 lines, no forced breaks that harm Vietnamese. Copy stays above graph, never overlapped by nodes. |
| Knowledge map | Separate bounded figure below copy, margin-top 24px, wide box ratio 800:320. Desktop height 320px; 12 nodes / ≤16 edges. Header/copy/panel keep foreground priority. Figure is not an interactive curriculum or completion display. Details in 03. |
| Panel | 400px wide, opaque surface-1, 1px boundary, radius 12px, padding 28px. Title 24px/1.25, 8px subtitle gap; mode control 24px below title; field group gap 16px; primary action 24px after last field. Auto height; no internal scrollbar or absolute bottom action. Never stretch to graph height. |
| Capability strip | Four static items, no counts, each label 13px semibold + descriptor 12px secondary. At most two lines per item; border-top only, padding 16px 0, no four independent cards. Text is existing capability, not guarantee of complete curriculum. Task 2 includes it; collapse to 2×2 below 1280px and omit below 768px. |
| Footer | Compact current-year copyright and Local-data info disclosure. No invented legal-policy links. Disclosure expands in document flow, max 64ch; same data wording as panel. Current creator footer remains on workspace Home. |
| Above fold | At 1440×900: header, copy, graph, complete current panel, capability strip, footer should fit. At 1280×800: complete current guest action and disclosure fit; strip/footer may scroll. At short heights or zoom, scroll normally; never shrink labels or hide actions to fit. Future full signup form may require scrolling. |

## Entry panel: current release versus future infrastructure

**Repository status: NO PRODUCTION AUTH.** `docs/atlas-v2/21-identity-profile.md` remains authoritative. The full experience below defines a future adapter contract; it does not authorize accounts, provider selection, cloud sync or migrations.

Panel receives a trusted discriminated capability: `unavailable` or `available`. Task 2 uses `unavailable` as a constant from composition. A browser flag or local profile must never unlock the available branch.

**Task 2 exact default panel:** Enter CS Atlas → subtitle “Study locally. No account required.” / “Học cục bộ. Không cần tài khoản.” → Sign in / Create account two-button mode control → visible “Accounts are not available yet…” notice → short selected-mode explanation → primary guest link → local-scope paragraph → expandable “About local data” / “Về dữ liệu cục bộ”. Mode defaults Sign in; clicking Create account changes only the explanation (“Account creation will be available when accounts launch.” / “Bạn có thể tạo tài khoản khi tính năng tài khoản ra mắt.”). Both controls are operable and announced as selected; no email/password fields, Continue submit, forgot-password link, provider buttons, fake success, spinner or waitlist capture in this branch.

Graph navigation, Browse lessons and Guest work immediately. Do not auto-open a demo form. Full form loading/error/success states can be tested later through synthetic component fixtures, never exposed through a production demo query or simulated session.

**Future available panel:** title changes with mode (“Sign in to CS Atlas”, “Create your account”, “Reset your password”); mode tabs; email/password or recovery content; mode-specific primary; enabled provider group if verified; divider; secondary guest link; local-scope disclosure. Sign-in defaults. Default panel min-height 480px at desktop only to stabilize mode changes; allow natural growth with error text/translation and clear min-height at tablet/mobile. Unavailable release has no fixed empty field space.

## Auth modes (future adapter required)

| Mode | Exact content and behavior |
|---|---|
| Sign in | Email; Password with Show/Hide; Forgot password quiet link aligned to password label row; Sign in primary. No Remember me until a reviewed session-lifetime choice exists. |
| Create account | Email; Password; password-policy text from approved server capability; Create account primary. No confirm password, display name or avatar requirement. If the eventual service requires verification, success is “Check your email to verify your account”; retain guest access, no fake authenticated redirect. |
| Recovery | Back to sign in button, title, one-sentence instructions, Email, Send reset link. Response: “If an account exists for this address, you’ll receive a reset link.” Same result for known/unknown email. No reset-token creation in UI. |
| Recovery sent | Replace form with message and Change email action; resend only after service-provided cooldown. No countdown unless actual retry time exists. |
| Social providers | Planned only: Google, GitHub, Apple. Task 2 renders none. Future default order Google then GitHub; Apple only if supported. At most two visible, full-width neutral buttons with names. Enabled allowlist from real service; omit unsupported providers instead of dead buttons. No OAuth popup simulation. |

Password policy is unresolved until the auth ADR. UI must accept paste, autofill and long passphrases; never impose a guessed complexity score or arbitrary short maximum. In available signup, render the returned minimum/maximum and other enforceable requirements before entry, keep requirements visible, update unmet items only after blur/submit. If policy cannot load, creation is unavailable with a recoverable service notice; guest remains active. Sign-in checks only presence and contract payload bounds, never signup rules against existing passwords.

## Fields, validation and focus

- Email: visible label, `type=email`, `inputmode=email`, `autocomplete=username` for sign-in and `email` for signup/recovery, `autocapitalize=none`, spellcheck off. Trim surrounding whitespace on submission; preserve case/display and let service own normalization. No domain typo correction or network availability check.
- Password: `current-password` / `new-password` autocomplete, mask by default. Visibility toggle is `type=button`, “Show password”/“Hide password”, `aria-pressed`, ≥44px target; preserve selection/caret/focus. Clear password on mode switch and successful completion; never persist or log it.
- Keep email in panel memory when switching modes; clear passwords, request errors and touched state. Switch tabs leaves focus on the selected tab; do not auto-focus keyboard on page load. Recovery activation focuses its heading (`tabindex=-1`); Back restores Forgot password trigger. Returning from a provider cancellation restores its button and entered email.
- Initial fields show no errors. Validate touched fields on blur; after first failed submit, revalidate affected fields during edits with ~150ms debounce. Submit validates all and focuses first invalid input. Do not disable submit simply because a pristine form is empty; show specific errors when submitted.
- Inline error below each field, text + icon, `aria-invalid` and `aria-describedby`; no tooltip-only errors. Form-level auth/network error above fields below tabs, announced once. Do not shake or shift unrelated layout; reserve one short helper line and allow additional error text to grow.
- Enter submits only the active form, including password field; composing IME text must not trigger submission. Tabs/visibility/social/guest use explicit non-submit types or links. Tab semantics: Left/Right + Home/End, Enter/Space activate (manual activation), roving tab stop; each panel labeled by selected tab.

## State contract

| State | Surface / action | Feedback and next action |
|---|---|---|
| Default | Opaque fields on surface-2, strong boundary; primary filled; secondary outlined | Labels and contextual helper text visible. |
| Hover | Slight surface/border change, no floating card or glow | Pointer only; no hidden controls. |
| Focus | 3px focus ring, 3px offset; focus-within on composite field | Separate from danger border and visible in both themes. |
| Pressed | Darken/tint action surface; optional 1px translate for buttons only | No geometry/width change. |
| Disabled | Native disabled for unavailable submit/loading controls; neutral text still legible | Reason beside control; guest never disabled by auth failure. Task 2 unavailable branch has no submit. |
| Loading | Real request only; primary label “Signing in…” / “Creating account…” / “Sending…”; 14px spinner occupies reserved icon slot | Form `aria-busy`; prevent duplicate requests and mode/provider switching; fields read-only, focus retained. No percentage/progress fiction. Guest remains available and cancels/abandons the request safely. |
| Validation error | Field-specific text, danger boundary | Keep values; first invalid field focused on submit. Clear only resolved errors. |
| Authentication rejected | “We couldn’t sign you in with those details.” | Do not reveal account existence. Keep email, clear password, focus error summary; recovery and guest remain usable. |
| Network / service error | “Unable to connect. Try again.”; distinguish rate-limit with actual retry guidance | Preserve values in memory; enable retry; no automatic credential retry. Provider cancellation is neutral status. |
| Success | Service-confirmed status, one polite announcement | Verified session: navigate safe return destination or `/home`. Signup verification: message, not workspace success. No confetti. |
| Unavailable | Current-release guest panel described above | No network, credentials, providers or session writes. |

Security gate: real service handles validation, CSRF, origin, quotas, sessions, verification/recovery and server-derived authorization. Redirect targets must resolve to same-origin allowlisted application paths, reject scheme-relative/external URLs and control characters; fallback `/home`. No auth/session tokens or user IDs in localStorage. Authentication never automatically uploads/merges local progress, bookmarks or Library bytes. Account linking requires the separately approved review/export/conflict/consent workflow.

## Guest behavior and journey

Guest is normal application use, not a temporary anonymous server account. Clicking the link enters `/home` without writing a session, clearing records or showing an onboarding modal. Existing browser records remain active; returning visitors see their existing Home state. Fresh users see existing deterministic starting recommendations. Header Browse lessons enters `/learn` directly; map's View knowledge atlas enters `/atlas` directly. Existing deep links bypass the public landing and remain public.

Disclosure appears before navigation, not as a consent gate. Guest local progress/bookmarks and Library work through existing adapters; storage failures retain existing feature feedback. Local data depends on the browser/device, has no cloud backup or sync, and full offline reload is not guaranteed. AI's public-content provider behavior is separately disclosed in AI; guest entry grants no permission for private transmission. Do not describe guest data as encrypted, permanent or server-private.

```text
Open / → read identity + meaningful graph → entry panel
    auth unavailable → Continue as guest → /home → Learn / Practice / Explore …
    Browse lessons → /learn (no account gate)
    future auth available → sign in / create / recover → actual service response
        verified session → safe destination; verification/recovery → truthful status
Any current feature deep link → that feature directly, preserving local state
```

## Routing decision (proposal for Task 2, no routes changed here)

| Model | Migration / deep links / search | Public entry, guest, SEO and future auth |
|---|---|---|
| A: `/` landing, `/app/*` workspace | High cost if all features are prefixed: route registry, content links, search projections, bookmarks, aliases and hundreds of Learn paths need redirect/parity work. If `/app` is only a Home alias, it is functionally model C with a less descriptive name. | Clear public root but prefix alone provides no auth security; unnecessary migration now. |
| B: `/` workspace; `/welcome`, `/login`, `/signup` | Lowest root migration cost; feature links untouched; root shell must still be separated for public paths. | `/welcome` can be marketed, but opening the site root still skips the requested public front door. First-visit localStorage redirects add flash and unpredictable bookmark behavior. |
| **C: `/` landing; `/home` workspace Home; feature paths unchanged** | Move only Home composition and Home/brand/breadcrumb metadata references. Preserve `/learn/*`, `/topics/*`, `/practice/*`, `/problems/*`, `/atlas`, `/library/*`, `/assistant`, `/search`, all legacy aliases and stored IDs. No `/app` namespace rewrite. | Root is an indexable public introduction, guest has deterministic link, and public learning pages remain crawlable. Future private routes get server authorization separately. **Recommended.** |

Migration contract for Task 2:

1. Preserve current Home content as `/home`, including creator footer. Workspace brand/Home navigation and Home breadcrumbs point `/home`; landing brand stays `/`. Explicit context controls, not global search-and-replace.
2. Existing `/` bookmarks now reach the public entry with a visible guest continuation; root cannot both remain the old workspace and become landing. This is the deliberate compatibility change. No automatic root redirect/cookie/localStorage gate. Add no `/welcome`, `/login`, `/signup` aliases in Task 2.
3. Keep all feature deep links and Search destinations unchanged; verify legacy Learn aliases and Library/bookmark records. Do not rewrite persisted hrefs. Future return destinations cannot be trusted without validation.
4. Public root has new descriptive metadata; workspace `/home` has Home metadata. Document both in `lib/routes.ts`, capabilities, route tests and relevant architecture notes during implementation. Deploy with existing Next server/build conventions; no middleware, account cookie or hosting reconfiguration.
5. Rollback restores previous root composition and removes new `/home`/shell gate; no storage migration to reverse. Leave a `/home` compatibility redirect to `/` if it was publicly released before rollback. Task 1 performs none of these steps.

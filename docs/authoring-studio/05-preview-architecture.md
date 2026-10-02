# 05 — Canonical unsaved lesson preview (Milestone E)

G activation: Save persists the editor's canonical candidate, never this presentation model. Successful canonical readback resets preview/validation snapshots; failed Save preserves draft and current preview staleness. Preview remains unsaved/read-only and side-effect-free. Historical E boundary below is retained; see09 for persistence.

Baseline: `3b7cc33`, `atlas-v2`. Implementation contract recorded before code. Canonical content remains read-only; no temporary content file, persisted preview ID, Save or writer.

Status: implemented in Milestone E. Validation, no-write/side-effect and production HTTP evidence is recorded in [06 QA](06-qa.md); independent visual/keyboard review remains manual because an isolated browser is unavailable.

## Actual learner pipeline and effects

`app/learn/[subject]/[page]/page.tsx` resolves trusted subject/lesson/body → client `LessonWorkspace` → `LearnSubjectWorkspace` and `LessonBlockRenderer` → `CopyCodeBlock` / `ExampleRunner`. All 16 blocks render React-escaped text; there is no Markdown/raw HTML renderer or syntax-highlighting package in this v2 pipeline.

| Boundary | Current behavior | Author-preview policy |
|---|---|---|
| Route/server | Canonical registry/body selection, static route metadata | Existing lesson identity retained; unsaved manifest/body supplied in memory after validation. No new learner route or Search entry. |
| LessonWorkspace | AtlasProvider hooks; mount emits lesson-started; button emits lesson-completed | Never mount in Studio. Keep normal learner lifecycle/actions unchanged in the learner wrapper. |
| BookmarkButton | AtlasProvider toggles persisted bookmarks | Omit from shared preview surface; no mock provider or fake write callback. |
| LearnSubjectWorkspace / sidebar | Curriculum navigation, drawer, storage-backed collapse and scroll; reads completion evidence | Not mounted in preview. Studio explorers retain their own existing dirty navigation protection. |
| Pager / breadcrumb / right rail | Learner Previous/Next, Concept/Problem links, Atlas AI link | Pager and AI actions omitted. Canonical relationship links in content open an explicit new tab, no prefetch; Studio draft remains alive. Normal learner links unchanged. |
| Content blocks | Pure presentation except Example/Copy controls; imported whole body/manifest registries | Inject selected render resources from server; remove registry imports from renderer. Use the same block implementation in both modes. |
| ExampleRunner | Local editable source/result; Run creates BrowserPracticeRunner/QuickJS worker; copy/reset/playground links | Same presentation, read-only source; Run/Reset disabled, no Worker/runtime instantiated, canonical playground opens new tab. Copy remains explicit clipboard-only. |
| Shell/providers | Learner Atlas/Search/Library/selection translator can persist or derive learning context | Existing exact /studio shell exclusion remains. Only root theme/locale and transient draft state; no learner services or AI request. |

Progress evidence is also the source of Continue Learning/history/mastery. Not mounting its provider/workspace prevents all of these writes, plus goals/plans. No analytics emitter exists in the lesson content surface. Library, Search projection and AI context are separate consumers; preview never updates/imports their services. Opening a canonical link explicitly in another tab has ordinary learner behavior in that tab, not preview evidence.

## One renderer, clean presentation boundary

`LessonContentSurface` is extracted from the existing LessonWorkspace article/header/body/skeleton JSX. Both normal Learn and author preview use this exact component, existing `LessonBlockRenderer`, existing ExampleRunner and shared CSS. Learner-only actions and pagers are composed as slots by LessonWorkspace, not copied into Studio.

Introduce a small typed `LearnRenderEnvironment` (`learner` default / `author-preview`) controlling only content locale, safe outgoing-link behavior and Example execution/editing. The preview never mounts stateful learner controls; the mode is not a replacement authorization layer. Empty VI fields use shared English fallback, without translation or promotion. Studio chrome explains fallback and unsaved/canonical-equivalent distinction. Theme comes from existing root tokens.

`LessonRenderContext` and `LessonRenderResources` are canonical presentation projections: selected subject/section labels; referenced public Examples, reference display fields and related lesson labels/routes. No separate lesson schema or persisted model. One pure projection helper is used by normal server routes and preview. CopyCodeBlock becomes a leaf with a compatibility re-export to avoid importing Exercise/Atlas hooks through presentation. No entire registry/body catalog in the Studio client graph.

## Request, validation and renderability

`POST /api/studio/preview` performs read-only preparation. Reuse D's exact dev+flag, loopback Host/Origin, JSON, streamed 1 MiB, rate limit and no-store/noindex contract. Accept only subjectId/lessonId/draft, not a trusted report or URL/file target. Always validate the exact submitted draft against request-scoped canonical context; do not rely on a browser's current/stale report. Return a structured report plus a canonical presentation model, or report plus null when blocked. Shared response parsers protect client rendering; malformed input/service failures are controlled.

Shared `renderable` policy differs from `canPersistInFuture`: all ERRORs continue to block future Save. Preview alone permits the explicit presence/completeness codes (`COMPLETE_MISSING_BODY`, `COMPLETE_MISSING_SUBSTANCE`, `COMPLETE_MISSING_OBJECTIVES`, `COMPLETE_SUMMARY_EMPTY`, `COMPLETE_REVIEW_DATE_EMPTY`, `BLOCK_CONTENT_EMPTY`) when shape is valid. Empty typed text/body can render honestly. Every other ERROR fails closed, including unknown/duplicate IDs, malformed blocks, invalid identity/route/curriculum/Example configuration, tables and bounds. No unresolved records are silently omitted. Warnings/Info never block preview. D/build validation rules are unchanged; one shared renderability policy refines D's earlier conservative all-error gate.

Resolve unique referenced records only; cap each projected resource collection at 200 and the serialized preview response at 2 MiB. Linked Example source is public and included only when referenced, never private Problem solutions. Resource overflow is a controlled service limit, not a truncated misleading preview.

## Client surface and staleness

Edit / Preview modes occupy the selected editor region; no forced browser tab, iframe, device frames or split at a 350 px reading width. In preview mode the editor panel spans the Studio grid, with shared article reading width around 880 px and existing lesson CSS. Editor form stays mounted while hidden, preserving local block/picker state. No lesson layout CSS copy; Studio styles affect chrome/container only, not content controls.

Explicit Preview / Refresh submits a cloned candidate. The report/model and exact submitted structural fingerprint are stored separately from the draft. Server SHA-256 candidate/context fingerprints bind preparation to canonical values; the client verifies the returned candidate matches the submitted structure. Edits mark old preview outdated, reset/selection clears it. Abort/sequence guards prevent A's response from replacing B or claiming to render a new draft. Locale changes are local presentation only and do not write preferences. Preview never mutates/normalizes the editor object.

Preparing, empty, blocked, service failure and rendering failure have distinct states. A component error boundary contains render bugs without losing the draft; generic error UI must not leak authored content/stack traces. Counts/issues identify author mistakes, not system failures. Back to editor remains reachable and keyboard accessible.

## Verification / future gates

Tests must cover real Python/DSA/rich-code/reference/SKELETON fixtures; unsaved content, shared DOM fidelity, all 16 variants, locale and literal HTML/code safety; policy warnings/nonpersistable safe preview versus structural rejection; request/production guards/bounds; draft isolation, exact fingerprints/stale/races/reset; unchanged canonical hashes/Search projections and actual storage adapters (evidence/bookmarks/navigation/goals/plans/Practice/Library) with no preview writes. Normal learner evidence/completion/bookmark/QuickJS/link behavior stays enabled and regression-tested. Browser visual/keyboard review is only claimed if an isolated browser is available.

Future F/G Save persists the validated editor draft, never the render projection. Save must revalidate exact current draft/fresh disk revisions under its own write boundary and reject all ERRORs even when preview is allowed. No write/security/atomicity guarantees are implemented by E. Full learner sidebar/rail, live refresh, device simulation and canonical/draft diff remain out of scope.

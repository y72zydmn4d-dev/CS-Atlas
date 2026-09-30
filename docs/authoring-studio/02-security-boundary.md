# 02 — Studio security boundary

## Implemented in Milestone A

| Boundary | Guarantee / implementation |
|---|---|
| Availability | Exact `NODE_ENV === "development"` AND `AUTHORING_STUDIO_ENABLED === "true"`. Missing, false,1,TRUE,whitespace and test/production environments fail closed. Server-only flag; no browser override. |
| Request | Root `proxy.ts` matches **only** `/studio/:path*` and returns404/no-store/noindex before rendering when disabled. Necessary because the shared root loading boundary otherwise streams a soft404. No learner/API/asset routing changes. |
| Defense in depth | `app/studio/page.tsx`, every loader and both content-reader entry points independently enforce the same guard. Production build constant-folds the development branch out; direct production HTTP tests remain mandatory. Proxy is not the sole authorization boundary. |
| I/O | `lib/studio/*.server.ts` uses `server-only`; Node route; canonical literal module imports are server-owned. No fs/path browser import, generic file API, arbitrary dynamic import or requested filesystem path. |
| IDs | Bounded ASCII canonical ID grammar plus subject/lesson registry membership and ownership. Unknown/path-shaped/cross-subject IDs never read a body. Source declarations are display-only, never interpreted as filesystem paths. |
| Data minimization | Overview/subjects/curriculum contain only metadata projections. Body import occurs only on valid lesson selection; only selected body is rendered. No private solutions, broad content/index barrel or external service. |
| Rendering | All fields/block payloads render as escaped React text, including `<script>` input. No raw HTML, eval, shell/server execution or embedded runtime. Inspector does not mount LessonWorkspace/ExampleRunner or emit learning events. |
| Mutation | **None.** No API routes, Server Actions, fs writes, autosave, Git commands, revision/write plan or authoring buttons. `/api/studio` and `/api/studio/write-file` do not exist. |

Run on loopback; this is a local development utility, not admin authentication. Root theme/locale providers are reused. Exact /studio bypasses WorkspaceProvidersShell: the learner AppShell/Search imports content/index and its monolithic body module, so mounting it would violate narrow startup loading and initialize unrelated learning-data services. All existing learner paths/providers retain their behavior. Studio owns main/skip/header utilities, not a competing theme. The owner must not expose an enabled development server publicly. A has no remote administration model.

Malformed selections in enabled dev call `notFound`; root streaming can produce HTTP200 with a Next404 interrupt. They never render Studio data. Disabled environments are hard404 at the request boundary, including query/child-route variants.

## Explicitly not implemented / future gates

Read-only ID rejection is **not** a tested filesystem containment implementation. No writer exists to certify symlink/hard-link/TOCTOU defense, atomicity/recovery, stale-write protection or strict Origin checks. Implement/test the exact [03 file contract](03-content-file-contract.md) before F/G; production guards must cover every future endpoint/action internally, not merely proxy/navigation.

Current TS body storage is monolithic: first valid selected-body import initializes nine trusted bodies/examples/references/quizzes on the server. It does not import them on overview/curriculum or send all bodies to the browser. Per-body source granularity/JSON cutover is intentionally deferred to F.

Tests: unavailable loaders/readers reject before content access; disabled route before loader/request wait; proxy production flag=true and route matcher exclusions; registry ownership/unknown/traversal IDs; escaped malicious inspection text; no inspection progress writes. Full mutation adversarial fixture gates remain unimplemented.

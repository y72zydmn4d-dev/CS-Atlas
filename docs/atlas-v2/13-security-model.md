# Security and Privacy Model

## Current assets and trust boundaries

Assets include Gemini credentials, authored/private reference solutions, future hidden tests, learner source code/drafts, Library files/extracted text/notes, progress/profile data, saved URLs, and server availability. Current trust boundaries are browser storage, Next.js server/API handlers, Google Gemini, arbitrary public websites contacted for link preview, and the QuickJS WASM interpreter in a disposable browser Worker.

Current strengths include server-only Gemini/reference modules, no `NEXT_PUBLIC_` key convention, public-content-only assistant context, bounded API bodies, safe link-preview URL/IP/redirect controls, local Library document storage, safe text rendering, and code execution isolated from the Next process. Current limits include no authentication/authorization, in-process rate limiting, local editable scores, and no independent QuickJS sandbox audit.

## Threat actors and misuse

Assume malicious or compromised clients, prompt injection embedded in code/documents/web metadata, malformed uploads, SSRF attempts, account/object-ID guessing after auth exists, quota/CPU abuse, provider compromise/retention, dependency supply-chain attacks, and sandbox escape attempts. Browser-local records are not trusted merely because the app wrote them earlier.

## Required controls by boundary

| Boundary | Required controls |
|---|---|
| Browser input/storage | Runtime validation; safe text rendering; no trust in local verdict/owner/role; content-size bounds; recoverable schema migration. |
| Library import/extraction | File size/signature/type checks; parser timeout and output caps; preserve original on extraction failure; no macro/script execution; never log contents. |
| Link preview | HTTP(S) only; reject credentials/local/private/reserved IPs and unsafe ports; DNS rebinding defense by pinning checked address; validate every redirect; cap hops, headers, bytes, time; shared quotas before public deployment. |
| App/API | Server-only secrets; body/content-type/schema validation; origin/CSRF controls; authentication plus object-level authorization; rate/cost quotas; response no-store for private data; safe normalized errors. |
| Gemini/provider | Key server-only; explicit source context; minimum necessary data; bounded timeout/output/cost; no raw prompts/source/documents in logs by default; provider data-retention review. |
| Search | Filter by principal before returning private result/snippet; avoid public indexing of Library body; authorization test each endpoint and suggestion path. |
| Remote judge | Separate service and hardened ephemeral sandbox; no app credentials/network/host mounts/shared state; strict OS-level resource caps; secret tests; independent security review; kill switch. |
| Remote user data | Session-derived owner; per-object auth; encryption/backup/export/delete policy; migration and conflict tests; audit access without payload logging. |

## Authorization model (future)

Roles are not currently implemented. When accounts arrive, start with a small principal model: anonymous/local browser scope, authenticated owner, and trusted service identity. Public authored content is readable. Every Library/progress/profile/submission record is owner-private by default. Admin/content-author permissions are separate from learner ownership. A service worker/judge worker receives narrow job-scoped credentials only if unavoidable, with short expiry and no access to Library or general user tables.

Test direct object references, list filters, exports, downloads, AI context selection, search suggestions, and mutation endpoints for cross-owner access. Authorization decisions belong on the server even if client navigation hides controls.

## Data classification and handling

- **Public:** reviewed concepts, lessons, public problem statements/cases, public resources.
- **Personal:** progress, goals, profile preferences, bookmarks, Library metadata/notes, AI personalization context.
- **Sensitive user content:** original files, extracted text, selected source code, private submissions. Minimize transfer/retention and tightly scope access.
- **Secrets:** API keys, session tokens, service credentials, hidden test suites. Never send to browser or general logs.

Set retention per class before remote rollout. User deletion must specify backups, caches, chunks, embeddings, and judge source retention. Data export should be portable and should not include service secrets or other users' data.

## Online judge non-negotiable

Untrusted source never executes inside the main application server process. The browser QuickJS runner remains bounded, public-only and clearly labeled. Remote judge code runs only in a separately operated, independently reviewed isolation service. No hidden tests or server-only reference solutions enter client bundles. See `08-online-judge-architecture.md` for detailed controls and enablement gates.

## AI/Library non-negotiable

Current assistant reads only public Atlas content. Library files/extracted text are not sent to Gemini. Future Library/RAG use requires a separate explicit user action and per-source authorization; saved, indexed, or related documents do not imply consent. Retrieved document text is untrusted prompt data. AI output cannot change official content, learner progress, or judge verdict without a separately validated and user-confirmed workflow.

## Security lifecycle

Threat model each new external integration and data flow. Review dependencies, secrets/config, rate/cost limits, error/log policy, data retention, and authorization before public deployment. Provide vulnerability reporting and incident contacts when public accounts/judging launch. Judge requires independent review and an operational kill switch. Security issues are release blockers unless an explicitly accountable owner accepts a documented residual risk.

## Migration path

**Current state:** local-first app with three limited server API surfaces and no user auth/backend database.

**Proposed state:** explicit data classification, principal-based authorization, bounded service boundaries, privacy-preserving operations, and isolated judge.

**Migration path:** preserve existing defenses; add auth before remote personal data; replace process-local quotas before scaling; run authorization tests as each API appears; review provider data flow before adding selected code/progress/Library context; gate judge Submit on independent isolation evidence.

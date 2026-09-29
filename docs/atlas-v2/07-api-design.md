# API Design

## Current APIs

Three Next.js Node route handlers exist:

| Endpoint | Current behavior | Important current limit |
|---|---|---|
| `POST /api/ai/ask` | Bounded JSON question/locale; retrieves public Atlas excerpts; Gemini call server-side | No auth; process-local 12/min cap; public content only |
| `POST /api/practice/feedback` | Validates problem/language/code/verdict/case IDs; explicit Gemini feedback request | No auth; process-local 8/min cap; client-reported results are untrusted; no Library access |
| `POST /api/library/link-preview` | Fetches metadata from a validated public HTTP(S) URL with DNS/IP/redirect/time/size restrictions | No auth; process-local limits; Node runtime required; contacts target website |

There is no general REST/GraphQL backend, account API, persistence API, judge submission endpoint, or generated OpenAPI contract.

## API principles

- Route handlers are transport adapters: validate request, resolve session and authorization, enforce limits/idempotency, invoke a use case, map domain errors, return a typed response.
- Use resource/action names with explicit versions when wire contracts need incompatible change. Existing local routes need not be renamed without a concrete compatibility need.
- Enforce authentication and object-level authorization server-side for every remote user-owned resource. Never accept a client owner ID as authority.
- Validate body size before JSON parsing; validate content type, object shape, enum values, string lengths, nested arrays, and referenced IDs. Reject unknown sensitive fields where ambiguity creates risk.
- Bound provider calls with absolute timeouts, output limits, retries only when idempotent, and stable normalized errors. Do not expose provider stack traces or raw upstream bodies.
- Return `Cache-Control: no-store` for private, AI, user state, and submission responses. Public authored content may use cache only with a clear version/invalidation policy.
- Apply shared/durable rate limits before public release. Process-local arrays are not deployment-safe across workers or restarts.
- Use CSRF/origin protections appropriate to the selected cookie/token model. Validate forwarded host information only at a trusted edge; do not trust arbitrary proxy headers.
- Add request correlation IDs and privacy-safe audit metadata, never raw Library text/source code/secrets in routine logs.

## Proposed endpoint families

These are conceptual contracts; exact URL versioning and serialization follow M1/M2 API conventions. They do not imply an auth or database vendor.

| Capability | Resource shape | Access |
|---|---|---|
| Concepts | list/get Concept; query typed relations/neighborhood | Public authored data, bounded query |
| Learn | get course, ordered items, lesson/revision, reference | Public authored data |
| Exercises | list/get exercise; optionally record an attempt/completion | Public read; user attempt write if remote progress exists |
| Problems | list/get problem revision; public tests/editorial by visibility | Public subset only; hidden suite inaccessible to browser |
| Submissions | create, get status/result, cancel | Authenticated owner; idempotency and quotas; code retention policy |
| Roadmaps/mind maps | list/get authored view and version | Public authored data |
| Library | list/create/update/delete metadata, upload/download blob, export/import | Owner-scoped; local mode can remain browser repository |
| Progress/plans | read/append evidence, update goals/plans/mastery override | Owner-scoped; append idempotency and audit |
| AI | request typed task with selected context refs and consent | Authenticated/limited; provider key server-only; per-source authorization |
| Search | query visible public + owner's private metadata | Public plus owner-filtered data; no cross-user leakage |

## Example contracts

Concept neighborhood request:

```json
{
  "conceptId": "stable-concept-id",
  "relationTypes": ["PREREQUISITE_OF", "RELATED_TO"],
  "direction": "both",
  "depth": 1,
  "limit": 40,
  "locale": "en"
}
```

Submission creation (future; code is data and must be queued to isolated service):

```json
{
  "problemId": "binary-search",
  "problemVersion": 2,
  "languageId": "javascript",
  "source": "function solve(input) { ... }",
  "idempotencyKey": "client-generated-unique-token"
}
```

The response should be `queued` with submission ID. Later status/result responses distinguish `queued`, `running`, `finished`, `failed`, `cancelled`; finished verdict is one of AC/WA/TLE/MLE/RE/CE with service-measured resource metadata and test visibility-safe summary. Do not return hidden input/expected output.

## Stable error contract

Use safe error codes such as `invalid-request`, `unauthenticated`, `forbidden`, `not-found`, `conflict`, `rate-limit`, `quota-exceeded`, `unsupported-language`, `version-mismatch`, `temporarily-unavailable`, and `internal`. Include field-level validation details only when safe. Distinguish provider unavailable from learner-code Runtime Error and from application failure.

## Current-to-target migration

**Current state:** three bespoke route handlers with useful bounded request checks, but process-local limits and no auth.

**Proposed state:** route handlers call feature application services with shared validation/error/auth policies, and external service APIs remain behind adapters.

**Migration path:** define API error/request helpers without changing behavior; add auth only when identity is selected; replace per-process quotas before public deployment; introduce new endpoints per milestone; keep current endpoint payloads compatible or version them with client migration.

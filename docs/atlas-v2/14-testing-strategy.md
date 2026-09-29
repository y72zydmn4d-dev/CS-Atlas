# Testing Strategy

## Current setup

The repository uses Vitest with jsdom, Testing Library, `fake-indexeddb`, shared `tests/setup.ts`, and path aliases. Suites cover content, graph/Atlas, Practice, Library, Gemini context/UI, search, localization, progress, visualizer and workspace interactions. Existing tests include real QuickJS WASM execution of public/reference test fixtures and negative capability/limit checks. Browser production QA is described in `docs/STATUS.md`, but no browser E2E framework is declared in package dependencies. ESLint, strict TypeScript, Vitest, and Next production build are available npm scripts.

## Test layers

1. **Pure domain/unit:** ID normalization, relation semantics, graph projection, progress math, problem version/comparator, search ranking, locale fallback, and URL/file validation.
2. **Registry/content contract:** unique IDs/slugs, valid relations/citations/routes, locale status, problem refs/public test validity, content maturity, and old-to-new mapping completeness.
3. **Repository/migration:** localStorage corrupt/quota behavior; IndexedDB transaction atomicity, v1/v2 migration, metadata/blob consistency, export/import, idempotence and recovery. Future remote repository tests verify owner filters and concurrency.
4. **API/service integration:** malformed/oversized bodies, safe errors, origin/session/CSRF, authorization, rate limits, idempotency, provider timeout/output, and no-store behavior. Mock external provider boundaries deterministically.
5. **Feature component workflows:** keyboard palette, map/list parity, localization/theme, loading/error/empty states, import/read/delete, language capability labeling, consent paths, and navigation.
6. **Execution security:** current QuickJS Worker tests remain public-only and verify bounded runtime, no host capabilities, cancellation/termination, and reference solution parity. Future judge gets separate API/queue contracts, adversarial sandbox tests, isolation review evidence, and operations/kill-switch exercises.
7. **Browser/system:** production smoke flows at mobile/desktop, locale/theme, graph/list, import/read, search, Practice Worker, and server route behavior. Add repeatable E2E tooling only when justified and approved; current docs of manual QA do not substitute for automated release checks.
8. **Build/release:** lint, strict typecheck, unit/integration suite, production build, route artifact inspection, server/client bundle boundary checks, and deployment artifact validation.

## Required tests by migration type

- **Canonical IDs:** every existing topic/domain/practice/reference relationship maps once; aliases resolve; all current route slugs remain reachable or redirect; no orphan progress/Library relation in mapping fixture.
- **Graph changes:** roadmap prerequisite ordering, mind-map semantics not treated as prereqs, `/atlas` map/list entity parity, cross-domain edges, deterministic IDs and keyboard list access.
- **Content schema:** discriminated block render coverage, citation/reference validation, localized/partial metadata and safe rendering of text.
- **Persistence:** existing local records survive migration, failures are recoverable, export is complete, no silent deletion, browser quota/restricted storage behavior.
- **Auth:** every remote user-owned get/list/search/export/download/update/delete is tested against a second principal; caller-supplied owner IDs cannot bypass scope.
- **AI:** verify only selected sources reach provider; no Library payload on public ask; consent, source provenance, prompt injection, output bounds, provider timeout, and cost/rate behavior.
- **Judge:** source never reaches main process execution APIs; private test stays server-side; malformed job/runtime outage maps to system state; resource limits are enforced by isolated service and independently tested.
- **UX:** keyboard-only flows, focus restore, accessible labels, reduced motion, both themes/locales, 375/390px mobile and desktop widths, text overflow and no horizontal page overflow.

## Fixture and test-data policy

Use synthetic or public educational content. Do not commit `.env.local`, credentials, real learner source, Library files, extracted personal text, or hidden tests. Server-only reference fixtures are allowed only when required and must remain outside browser imports. Test bundle assertions should fail if private references or secrets enter client assets.

## Quality gate

For implementation handoff, run:

```text
npm run lint
npm run typecheck
npm test
npm run build
```

Also run focused browser/security/integration checks required by the changed subsystem. Build scripts prepare a generated QuickJS loader; verify its byte-for-byte pinning and deployment inclusion. Do not install dependencies unless authorized. Record test gaps and environment-dependent failures instead of implying checks passed.

## M0 scope

M0 changes documentation only. No application build or implementation test is required to prove code behavior; final verification focuses on changed-file scope, doc links/claims, milestone dependency consistency, and clean diff constraints. Do not run the build if it would modify generated Practice assets as a side effect.

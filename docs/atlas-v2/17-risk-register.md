# Risk Register

Ratings are initial M0 planning assessments, not measured incident probabilities. Reassess likelihood/impact at each milestone. Owners are role descriptions until the project assigns named owners.

| ID | Risk | Likelihood / impact | Mitigation and gate | Owner |
|---|---|---|---|---|
| R1 | Untrusted user code reaches the main application server or escapes a future judge sandbox | Medium / Critical | Non-negotiable no-execution-in-Next rule; separate service, no credentials/network/host mounts, hard limits, independent isolation review, kill switch; block Submit until evidence exists. | Judge/service security owner |
| R2 | Existing IDs/routes or browser data are lost during canonical model/account migration | High / High | Stable ID map/aliases, export/import, idempotent backfill, counts/parity fixtures, rollback, preserve old adapters through cutover. | Domain/data migration owner |
| R3 | Private Library text, selected code, or progress is transmitted to AI without meaningful consent | Medium / Critical | Source allowlist, explicit per-action consent, owner authorization, minimal excerpts, no default logs, provider policy review, negative tests. | AI/privacy owner |
| R4 | Cross-user data exposure after authentication/search/sync is introduced | Medium / Critical | Session-derived owner scope; object-level authorization on every query/download/export; two-principal adversarial tests; privacy review before launch. | Identity/API owner |
| R5 | Public browser-test success is confused with secure AC or hidden-test result | High / High | Preserve scope/provenance labels; separate PracticeRunner from JudgeClient; no hidden cases in browser; versioned submission result contract. | Practice/Judge owner |
| R6 | Roadmap, mind-map and `/atlas` semantics collapse into one graph and corrupt educational meaning | Medium / High | Separate view schemas and validators; typed canonical relations; classify current edges; regression tests for ordering vs conceptual association. | Knowledge model owner |
| R7 | User progress/mastery becomes misleading or opaque | Medium / High | Separate completion, attempts, judged evidence and mastery; publish evidence/model/version; user correction; avoid fake history and opaque score. | Learning analytics owner |
| R8 | Static content/search imports cause client bundle/build/performance growth | Medium / Medium | Measure chunks and route payloads; lazy/route-scoped projections; split search documents from full lesson bodies; performance budget in M14. | Web performance owner |
| R9 | API abuse/provider costs or per-process rate limiting fail under multi-instance hosting | High / High | Authentication where appropriate, shared durable quotas, provider budget alerts, request/token ceilings, edge controls and load tests before public hosting. | Platform/API owner |
| R10 | Migration creates duplicate/stale curriculum or relation records with inconsistent translations/provenance | Medium / High | One canonical ID registry, validators, source review, mapping coverage, locale completeness status, duplicate reports, provenance checks. | Content/domain owner |
| R11 | Library blob, metadata, extracted text, derived chunks and deletion state diverge | Medium / High | Independent versioned artifacts, checksums, transactional/recoverable delete, rebuild state, deletion propagation and export/restore test. | Library/data owner |
| R12 | New navigation/redesign removes existing useful workflows or accessibility | Medium / High | Preserve route aliases; baseline current journeys; keyboard/list alternative; responsive/theme/locale tests; user review per shell milestone. | Product/UI owner |
| R13 | Unreviewed database/auth/provider choice creates lock-in or privacy obligations | Medium / Medium | ADR before adoption; requirements and operations review; use interfaces only where valuable; defer vendor choice until milestone needs are known. | Architecture owner |
| R14 | Local browser storage quota/corruption makes user data appear saved but unrecoverable | Medium / Medium | Explicit save/error states, export/import, checksums/version migrations, quota tests, do not treat local-only data as backup. | Client storage owner |
| R15 | Dependency/build artifact drift changes QuickJS runtime or exposes server-only code | Low / Critical | Pin loader and preserve byte-for-byte; lockfile review, generated asset checksum, client bundle scan, server-only import tests and build verification. | Release/security owner |

## Top 10 release attention items

The top ten by combined impact and likelihood are R1-R10. R11-R15 remain tracked; R11 rises before remote Library/RAG, R13 before any vendor selection, and R15 is continuously checked because it concerns execution/security boundaries.

## Review cadence

Review this register at M1 scope approval, M2 ID mapping, M6 judge enablement, M9/M11 personal data/account launch, M12 Library AI context, and M14 release audit. Each accepted risk needs an accountable owner, rationale, mitigation, and expiry/review date. “Future work” is not mitigation for a risk attached to an enabled capability.

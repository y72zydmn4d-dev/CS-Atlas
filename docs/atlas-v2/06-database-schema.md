# Persistence and Database Schema Plan

## Current persistence

There is no application server database. Current persisted records are browser-local:

- `localStorage` via `lib/storage.ts`: sidebar/library view/theme/locale/translation preference, topic progress, bookmarks, topic exercise status, and versioned Practice attempts/drafts/completions.
- IndexedDB via `lib/library/repository.ts`: `items` metadata (schema version 2) and `files` Blob values, keyed by the Library item ID. Metadata indexes support updated time and duplicate lookup by URL/fingerprint/hash.
- Authored content and Practice problem definitions live in TypeScript registries. Search and graph models are derived in memory.

These records are user-editable, origin/device-scoped, and not cloud backups or authoritative scores. The current Library repository migrates schema v1 metadata on read; invalid records can be discarded. Future remote sync must not silently inherit these destructive assumptions.

## Technology decision

No database, ORM, authentication service, object store, migration runner, queue, or database client exists in the repository. Do not select one in M0. M2-M11 first establish entity ownership, IDs, authorization, import/export, deletion, sync/conflict and retention requirements. A relational store is a plausible fit for canonical entities, relations, users, and evidence, but needs/product operations decide whether it is needed. Binary object storage and metadata persistence are separate decisions.

## Logical schema (technology-neutral)

Suggested tables/collections after product and identity decisions:

| Logical record | Key constraints and indexes |
|---|---|
| `concept` | Stable primary ID; unique current slug; deprecated/merged state; localized payload/version kept separately or structured by the selected store. |
| `concept_alias` | `(alias, locale/type)` lookup; target concept foreign key; unique active alias policy. |
| `concept_relation` | Stable ID; source/target concept foreign keys; type, direction, provenance, review state; indexes by source/type and target/type; type-specific duplicate/cycle validation. |
| `lesson` / `lesson_revision` | Stable lesson ID; immutable revision/version; locale payload; citation/provenance; status and reviewer. |
| `course` / `course_item` | Course identity; ordered items; item kind/ref; unique order within course and valid referenced content. |
| `exercise` / `exercise_revision` | Stable ID and contract version; prompt/feedback/rubric; concept/lesson link records. |
| `problem` / `problem_revision` | Stable problem ID/version; public metadata; language support; public tests separate from private test references; editorial/solution visibility. |
| `roadmap` / `roadmap_node` / `roadmap_edge` | View identity/version and scope; node concept ref nullable for structural nodes; layout/order fields; edges scoped to the roadmap. |
| `mind_map` / `mind_map_node` / `mind_map_edge` | Separate view and edge model; node concept ref nullable; independent view semantics. |
| `resource` / `resource_concept` | Public resource/source/provenance, URL safety policy, canonical concept relation. |
| `library_item` | Owner foreign key if remote; metadata, extraction status/version, type, timestamps, schema version; owner/time and owner/type indexes. |
| `library_blob` | Opaque object key, owner/item relation, checksum, byte length, media type, encryption/storage metadata; binary bytes outside relational rows when scale/runtime warrants. |
| `library_relation` | Owner/item plus typed entity ID/kind/relation; unresolved legacy reference support; authorization always follows item owner. |
| `learning_event` | Owner, event type, canonical target, source version, occurred-at, idempotency key; indexes by owner/time and owner/target. |
| `user_mastery` | Owner/concept composite key; estimate, evidence count/window, confidence, model version, optional manual override and timestamp. |
| `study_plan` / `study_plan_item` / `goal` | Owner and timezone; schedule/version/status; stable item references; no public visibility by default. |
| `submission` / `judge_event` | Owner, problem revision, language/source reference, queue state and timestamps; source retention/access policy; append-only verdict events. Hidden test data remains in isolated judge storage/service. |
| `search_document` | Rebuildable projection keyed by entity/revision/locale/visibility scope; never authoritative. Private Library documents are separately scoped. |
| `ai_job` / `ai_context_ref` (only if needed) | Owner, task, selected source references/versions, consent/action state, provider/model metadata, expiry; avoid storing raw prompt/context by default. |

## Schema and lifecycle conventions

- Keep schema shape version separate from content/problem contract version.
- Use explicit created/updated timestamps and stable IDs. Use UTC instants plus explicit user timezone for schedules.
- Prefer soft deprecation/merge for public Concepts to preserve references. User deletes and retention obligations require explicit semantics.
- Use foreign keys or equivalent referential validation for canonical relations; preserve dangling user-import references as unresolved values where data retention matters.
- Store large binaries separately from metadata. Use checksums and measured size limits; do not assume the application database is a file store.
- Every user-owned table/collection carries owner identity or derives it through a parent relation that is checked on every access.
- Avoid storing extracted text, chunks, embeddings, or generated AI summaries as canonical item data. Keep them versioned derived artifacts with deletion propagation.
- Judge submissions need an explicit source-code retention period and access control. Private tests never join ordinary app query paths.

## Migration and rollback

Before a remote schema exists, implement browser export/import for user records and fixture migrations. For each local schema migration: read old record, validate, transform, write the new form without deleting the original until success, record recoverable error state, and test quota/full-storage behavior. For account linking, deduplicate by explicit user choice; do not silently merge different browser accounts.

For remote migration, create a dry-run ID mapping and counts; dual-read or shadow-compare where feasible; use idempotent backfill batches; pause writes or use version cursors for final cutover; retain rollback snapshots; verify counts, relation closure, blobs/checksums, owner authorization, and export; only then deprecate old writes. Current device data must remain exportable and usable if remote service is unavailable.

## Migration path

**Current state:** localStorage and IndexedDB only; no database vendor commitment.

**Proposed state:** repositories hide storage; logically separate authored knowledge, user records, binary files, derived indexes, and judge data.

**Migration path:** keep browser repositories through M1-M5; define concepts/relations in M2; M9/M11 settle account and sync semantics; choose storage per workload after those decisions; migrate with export, owner mapping, parity, and rollback.

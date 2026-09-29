# Progress, Mastery, and Study Plans

## Current state

`lib/storage.ts` stores topic progress (`not-started`, `in-progress`, `completed`), topic exercise state, bookmarks, and Practice state in versioned localStorage keys. `AtlasProvider` supplies progress/bookmark/exercise actions. `lib/progress.ts` sanitizes topic status and computes a simple average using weights 0, 0.5, and 1. Practice separately records up to 40 public attempts, per-language drafts, and versioned completion IDs. `/progress` combines Practice progress and a topic dashboard. The home recommendation is deterministic: resume an in-progress topic, otherwise choose an unfinished topic with satisfied prerequisites in registry order.

These are useful local signals, not a complete mastery model, chronological activity log, cloud record, or verified judge score.

## Target concepts

- **Learning event:** evidence such as lesson opened/completed, exercise attempted/solved, problem submission verdict, user reflection, or resource reviewed. It references a canonical Concept and source revision and has an occurrence timestamp.
- **Current progress state:** a projection of relevant events/user choices for quick views. It can be recomputed or corrected.
- **Mastery:** an estimate supported by explicit evidence, model/version, confidence and recency; user can inspect and correct it. Completion must not equal mastery.
- **Goal:** user-chosen target with scope/time window and status.
- **Study plan:** ordered/scheduled intentions, timezone, due dates and optional generated recommendations. Recommendation acceptance remains an explicit user action.
- **Activity:** user-facing aggregation of events, with privacy and retention policy.

## Event and projection contracts

An event should include a stable event ID/idempotency key, owner scope, event type, target entity type/ID, optional source content/problem version, timestamp, and safe structured evidence. Store source code or raw document text in a separate restricted store with explicit retention, never in general progress events. Remote records derive owner from the authenticated session.

Recommended separation:

1. Record evidence with source and version.
2. Build progress projections by feature (lesson, exercise, problem) and Concept.
3. Compute mastery only through a documented model; version algorithm and expose evidence summary.
4. Keep user override/“I know this” distinct from inferred estimate.
5. Generate study plan suggestions from allowed evidence and prerequisites; persist only after user acceptance.

## Initial mastery policy

Do not ship a single opaque numerical mastery score as soon as events exist. First collect transparent completion/attempt evidence and define how each event contributes, decays, conflicts, and is corrected. A Practice public-test pass is evidence of public cases only. A remote AC is evidence for a specific problem revision. Reading a page is not proof of concept mastery. Self-report is useful but distinct from judged performance.

## Migration of local state

- Keep current storage keys readable until a tested migration has exported/snapshotted local values.
- Map topic IDs to Concept IDs with an explicit mapping table; preserve bookmark hrefs or redirect targets.
- Map `ExerciseBlock` IDs and Practice problem/version/test IDs separately; do not conflate solved status with completed topic status.
- Map Practice attempts as local-public evidence with provenance `browser-public`; never upgrade verdict scope during migration.
- Preserve timestamps where known. Do not fabricate historical events from aggregate state; mark imported snapshots with migration time/source.
- Make migration repeatable/idempotent and keep a recovery export if quota/write fails.

## Interfaces and privacy

`LearningProgressService` exposes owner-scoped read projection, append event, update explicit user status/override, list goals/plans, and accept plan suggestion. Browser adapter can satisfy the same interface for local mode. Remote queries are owner-scoped and covered by authorization tests. Export/delete includes events and projections according to retention policy. Progress/mastery is personal data and must not be sent to AI/search by default.

## Migration path

**Current state:** useful local status maps, versioned Practice history, derived percentage and deterministic recommendation.

**Proposed state:** event-backed, concept-linked progress projections, transparent evidence-based mastery, explicit study plans/goals.

**Migration path:** M2 identifies concepts; M4/M5 define evidence events; M8 adds graph views; M9/M11 settle user identity/sync; M10 migrates local values and introduces projections one feature at a time. Keep aggregate-only records honest rather than synthesizing history.

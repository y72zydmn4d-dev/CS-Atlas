# 04 — Authoritative canonical validation (Milestone D)

## Implemented contract

Canonical files remain read-only. No Preview, Save, creation, writer, migration or curriculum mutation. POST `/api/studio/validation` is a **read-only computation** accepting an unsaved draft, not a mutation operation. No file target, client validation result or executable source is accepted.

Pure `lib/domain/learn-validation/` owns unknown-input parsing, structured diagnostics and per-lesson canonical rules. The existing `validateLearnPlatform` build facade reuses the same parser/rules for every manifest/body pair; its broader subject/group/alias checks remain intact. Studio loads request-scoped canonical metadata/registry membership and validates one candidate. No competing Studio rule table or client-authoritative verdict.

### Six layers

1. Strict unknown-input shape: canonical manifest + nullable body; supported keys, enums, numbers, localized strings and all16 block variants. Reconstruct typed records; never cast malformed payloads to the union.
2. Metadata/domain: nonempty English title/description, stable canonical ID/slug syntax, positive whole minutes/order/version, review date validity, unique block IDs, meaningful required payloads and consistent table/comparison widths.
3. Registry relationships: Concepts, Exercises, public Problems, Examples, categorized LearnReference items and v2 Lessons. Unknown/duplicate IDs remain in input and produce issues. Cross-subject links remain legal; there is no invented language compatibility or Concept role exclusion.
4. Curriculum: subject/section ownership and single placement, route collision/reserved surfaces, contiguous array/order agreement and derived Previous/Next. Existing Studio identity/slug/ownership/order/source/version cannot be changed to masquerade as a different record. Aliases remain untouched.
5. Status policy: PLANNED/SKELETON allow absent body; empty added block content is nonblocking quality guidance, but malformed shape, invalid IDs and inconsistent tables always block. PARTIAL without meaningful body warns. COMPLETE requires body, summary, review date, objectives and substantive paragraph/definition/code/syntax or a valid nonempty existing Example. Heading/output/link-only bodies are not substantive. No arbitrary block-count/education score. Missing examples/exercises warns; absent references informs. Body without a declared source is not an error for transient authoring: future writer must derive association, not trust source input.
6. Semantic integrity: prerequisites are directed dependencies (M0 DAG contract); iterative bounded traversal checks cycles reachable from the replaced lesson, including self/two/multi-node cycles. Related links are associations and may be cyclic; self-links are invalid. Reference item must belong to its real subject/category inventory. Example static runtime must be canonical and QuickJS requires JavaScript; never execute code.

### Issue/report model

Version1 reports carry `status`, `hasErrors`, `canPersistInFuture`, `renderable`, severity counts and structured issues (`code`, severity, message, canonical path, optional entity/block/relationship/related ID). ERROR means integrity/policy failure; WARNING is nonblocking authoring guidance; INFO is context. `canPersistInFuture` is only content eligibility, **not authorization or an implemented Save guarantee**. Diagnostics currently use canonical English messages; EN/VI UI labels explicitly identify this.

Paths mirror the real DTO: `lesson.title.en`, `lesson.conceptIds[1]`, `content.blocks[4].language`, `content.blocks[2].referenceIds[0]`. No imaginary metadata/objectives or flattened relationship fields. Codes are stable uppercase machine identifiers; messages are not test/API identity.

| Rule family | Representative stable codes |
|---|---|
| Structure/bounds | INVALID_STRUCTURE, INVALID_ENUM, UNSUPPORTED_FIELD, UNKNOWN_BLOCK_TYPE, FIELD_LIMIT_EXCEEDED, ISSUE_LIMIT_REACHED |
| Metadata/identity | LESSON_TITLE_EMPTY, LESSON_DESCRIPTION_EMPTY, LESSON_ID_INVALID, LESSON_SLUG_INVALID/RESERVED, POSITIVE_INTEGER_REQUIRED, BODY_VERSION_INVALID, REVIEW_DATE_INVALID, IMMUTABLE_LESSON_FIELD, IMMUTABLE_BODY_VERSION |
| Blocks | BLOCK_ID_INVALID, DUPLICATE_BLOCK_ID, BLOCK_CONTENT_EMPTY, CODE_LANGUAGE_INVALID, TABLE_ROW_WIDTH_INVALID, TABLE_COLUMNS_REQUIRED, DUPLICATE_OBJECTIVE |
| Registries | UNKNOWN_<ROLE>_ID, DUPLICATE_<ROLE>_ID, REFERENCE_CATEGORY_INVALID, EXAMPLE_CONFIGURATION_INVALID, SELF_LESSON_RELATIONSHIP |
| Curriculum | UNKNOWN_SUBJECT_ID, UNKNOWN_SECTION_ID, CURRICULUM_IDENTITY_INVALID, SECTION_ORDER_INVALID, LESSON_ORDER_INVALID, LESSON_ROUTE_COLLISION, PREREQUISITE_CYCLE |
| Status/quality | COMPLETE_MISSING_BODY/SUBSTANCE/OBJECTIVES, COMPLETE_SUMMARY_EMPTY, COMPLETE_REVIEW_DATE_EMPTY, PARTIAL_BODY_THIN, NO_EXAMPLE, NO_PRACTICE, NO_REFERENCE |

Difficulty/translation/runtime/callout vocabularies are runtime constants in their existing owning contracts, with unchanged union values; no Studio enum universe. Title/description English are required for learner fallback; declaring complete translation without Vietnamese metadata is an ERROR (TRANSLATION_FIELD_MISSING), not automatic translation certification.

Server SHA-256 fingerprints bind parsed canonical values plus the request-scoped registry/selected persisted content context. This is not a disk revision, signature or reusable authorization ticket. The UI associates each response with the exact submitted structural draft fingerprint and reset token; edits mark it stale immediately. Aborted/outdated requests cannot display a current verdict. Reset/selection cancels and clears the report. No semantic normalization/auto-fix: strings/order/unknown IDs remain unchanged; normalization only reconstructs the canonical fields/omits absent optional properties.

### Safety / bounds

Guard runs before parsing/imports: development AND explicit flag only. Exact loopback same-origin Origin required for POST; cross-site/same-site Fetch Metadata rejected. Compare direct loopback Host/Origin/port, never forwarded host; Next dev can reconstruct an internal localhost URL. JSON only, streamed request≤1MiB, fixed local-worker rate limit, no-store/noindex responses and controlled malformed/service errors. Limits shared with parser:200 blocks,20,000 code characters,20,000 localized prose/output characters,200 list/relationship/row entries,32 columns,200-char IDs,120-char language labels. No arbitrary nesting or unknown keys. Issues capped at500 with an explicit blocking limit diagnostic, never silently pass. Oversized malformed IDs/keys are not repeated into issue context; response context is bounded.

Learn syntax language is canonically an unrestricted display string, separate from Practice's Python/JavaScript runtime registry. Require a nonempty bounded token; do not invent a new enum. Example runtime validation uses the existing canonical runtime contract. Plain prose/code remains React-escaped text; literal `<script>`, `javascript:` and `onclick=` are valid educational text. Unsupported raw-HTML blocks/attributes are structural errors, not substring censorship. No execution, HTML renderer, fs/path, shell or provider boundary is introduced.

Module snapshots remain trusted Next dev imports; request context is rebuilt and no custom permanent registry cache exists. Manual TS module edits require Next HMR/reload. Revisioned disk freshness belongs to F; this report cannot certify files not refreshed by dev HMR. Health scans at J may reuse the engine but must explicitly load/scan bodies; active validation does not scan428 bodies.

## Future gates

E may use `renderable` plus authoritative validation and must reuse the real learner renderer without evidence side effects. F/G MUST revalidate the exact current draft against fresh canonical state under the write lock, reject all ERRORs and stale revisions, and validate the resulting graph/write plan. Never trust a browser-provided report/hash/valid:true. Writer path/atomicity/security guarantees are not implemented here.

## Known boundaries

All16 editable blocks have structural/domain/registry validation. No read-only editable variant is silently skipped. Full subject/group/quiz registry unknown-input schemas and writer graph freshness/parity remain F/K; no subject/quiz draft exists in D. Educational depth/review accuracy and full translated-body editorial coverage cannot be certified by these simple presence checks. Syntax languages remain display strings (no new execution enum). Click-to-focus and a validation shortcut are deferred; paths/block IDs are available now. No repository-wide scan. Existing build additionally checks persisted COMPLETE source declarations; a new transient body cannot author its source path, so future writer must derive that association and validate the resulting graph.

## QA

Evidence is maintained in06-QA and PROGRESS: real authored/SKELETON records, every block shape, COMPLETE policy, registries/duplicates/cycles, build agreement, no-write hashes, request bounds/guards and dirty/stale/reset/race workflows. Browser-only focus/contrast/HMR checks remain explicitly manual when no safe browser is available.

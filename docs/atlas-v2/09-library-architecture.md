# Personal Library Architecture

## Current behavior and boundary

The Library is a browser-local personal resource manager. `lib/library/types.ts` defines versioned metadata, file/link kinds, extraction status, relations, query/search records, and `LibraryRepository`. `lib/library/repository.ts` is the only IndexedDB owner and stores metadata and Blob values separately. Import validates size/format/signatures, duplicate hashes/fingerprints/URLs, extracts capped text for supported files, and preserves unsupported attachments. PDF.js, Mammoth, previews, notes/tags, relations, and object URL cleanup are already implemented.

The server link-preview route contacts user-selected public URLs after safe URL/IP/redirect checks. File contents and extracted text remain in the browser. Current Gemini APIs do not read Library content. Relations currently target domains/topics/algorithms/techniques/projects/modules.

## Responsibilities and boundaries

- **Metadata repository:** item title, type, MIME/format, source URL, tags, notes, timestamps, extraction state, checksums, relationships, and optional collection membership.
- **Binary repository/storage:** original bytes, size/checksum, local blob key or future object key, encryption/storage metadata. Delete must coordinate metadata and binary lifecycle.
- **Extraction service:** parser selection, signature checks, timeout/cap, output text status, parser/version metadata. It does not own the source Blob and never executes embedded code/scripts.
- **Search projection:** local bounded text/metadata indexing today; future text chunks/semantic vectors are derived and separately versioned.
- **UI:** import, reader, note/tag/collection management, relation picker, export/delete. It uses repository/service contracts, never IndexedDB directly.
- **AI context:** separate opt-in selection/authorization boundary. Merely saving, extracting, or indexing a document grants no permission to transmit it.

## Future entities and interfaces

`LibraryItem` is user-owned and may be local-only or synced. A file item references a binary object; a link item references an HTTP(S) URL. `LibraryRelation` points to a stable canonical entity ID but does not make the item an official atlas Resource. Notes and collections should be distinct records if independent sharing/sync/versioning is needed.

Potential interfaces:

```ts
interface LibraryRepository {
  list(ownerScope: OwnerScope, query?: LibraryQuery): Promise<LibraryItem[]>;
  get(ownerScope: OwnerScope, id: LibraryItemId): Promise<LibraryItem | null>;
  create(ownerScope: OwnerScope, input: CreateLibraryItemInput): Promise<LibraryItem>;
  update(ownerScope: OwnerScope, id: LibraryItemId, patch: UpdateLibraryItemInput): Promise<LibraryItem>;
  remove(ownerScope: OwnerScope, id: LibraryItemId): Promise<void>;
  export(ownerScope: OwnerScope): Promise<LibraryExport>;
}
```

Keep browser-local implementation and current contract working while the remote owner model is decided. Do not expose `ownerScope` as a caller-asserted user identity; remote adapter derives principal from trusted session.

## RAG-compatible without RAG coupling

The source item and its user-authored metadata remain authoritative. Any future extracted text, normalized pages, chunks, embeddings, OCR, summaries, and retrieval indexes are derived artifacts containing source item ID, source checksum/version, extractor/model version, locale, creation time, and deletion state. They can be deleted/rebuilt without losing the file or metadata. Use a job interface if extraction becomes expensive; keep current bounded local extraction where appropriate.

Before any document content leaves the browser, require a specific user action that names/indicates the selected item and explains provider/destination/use. Persist only the consent/audit reference needed by policy; do not turn global “AI enabled” into blanket Library access. Context assembly must enforce item ownership, selected relation/page range, excerpt caps, deletion status, provider policy, and prompt-injection treatment. Retrieved document instructions are untrusted data.

## Security and privacy requirements

- Validate file size, signature/type, URL scheme, relation IDs, extracted text size, imported/exported metadata, and preview image URLs at every boundary.
- Render text as text. Never inject imported HTML, execute macros/scripts/code, or log full extracted text.
- Restrict link-preview SSRF paths and rate; keep safe redirect validation. Do not proxy arbitrary images without a separate abuse/size/cache policy.
- Remote sync requires per-item owner authorization, encryption/transport and at-rest policy, deletion propagation to blobs/chunks/embeddings/backups, export format, and retention.
- AI/RAG requests require explicit per-request authorization and no hidden background upload/indexing.
- Handle quota/storage failures with retained source state and visible recoverable errors; never report an import as saved before metadata/blob transaction succeeds.

## Migration path

**Current state:** IndexedDB items/files; metadata schema v2 with v1 read migration; local capped extraction and search; relation types use existing entity IDs.

**Proposed state:** repository interfaces separate local/remote metadata and binary backends; canonical relations; extraction and optional AI-derived artifacts separate from storage.

**Migration path:** preserve the current repository and local item IDs; add canonical ID mapping/unresolved legacy relations; implement export/import and failure recovery; decide accounts/object store only in M9/M11; add remote sync behind adapter; build optional ingestion after AI consent and deletion policy. RAG is not required for Library usability.

## Local policy decisions (2026-09-30)

| Concern | Current decision | Remote prerequisite |
| --- | --- | --- |
| Identity/ownership | Every record is private to the current browser profile. The repository exposes a fixed `local-browser` owner scope; callers cannot supply a user ID. | Select auth/session policy and derive the principal at the server boundary. |
| Encryption | No application-layer encryption claim. IndexedDB inherits browser profile and device protections. | Document transport, object-store encryption, key ownership, and recovery before sync. |
| File/quota | Maximum 25 MiB per file and ten files per import; total capacity is browser-managed. Quota failures are surfaced as recoverable `quota` errors and no success is reported before the metadata/blob transaction commits. | Define per-owner quota, reservation, abuse limits, and billing posture. |
| Delete/retention | Local delete removes metadata and its Blob in one transaction. Records persist until explicit delete or browser/site-data clearing; there is no backup retention claim. | Define propagation to blobs, derived artifacts, backups, and a bounded restoration window. |
| Export/import | Versioned metadata JSON excludes original bytes and extracted private text. Restored file records explicitly require re-import. | Define encrypted/full-data export, portability, and audit requirements. |
| Conflict/sync | No remote sync, so no hidden last-write-wins behavior. Offline local mode is authoritative for this release. | Approve conflict keys, version vectors or revision checks, observable sync states, and rollback. |
| Privacy/AI | Notes, files, extracted text, relations, and collections are private. Saving/extracting does not authorize provider transmission. | Per-request item selection, destination disclosure, owner authorization, and deletion enforcement. |

Remote repository adapters are intentionally deferred: cloud sync and accounts are not approved. The new owner contracts must not be mistaken for authentication. `lib/library/ingestion.ts` defines only source-bound extraction jobs/artifacts; it has no embeddings, vector store, provider call, or canonical-content write capability.

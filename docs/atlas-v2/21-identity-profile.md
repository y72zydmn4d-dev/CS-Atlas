# Identity and local Profile decision

## Decision

Accounts and remote identity are deferred. The current product is useful without a server account, and no approved requirement yet justifies collecting identity, operating account recovery, or synchronizing private learning/Library data. The active Profile is therefore an anonymous record owned by the current browser profile with private visibility. It has no public URL, display name, email, avatar, follower graph, or client-asserted owner ID.

Locale, theme, and shell preferences remain independent browser preferences. Progress, bookmarks, Exercise attempts, goals, study plans, evidence events, and public Practice history are private local learning data. The Profile exports these through a versioned JSON contract and can explicitly delete them. Library metadata/files and their export/delete flows remain separate so a learning reset cannot silently destroy documents. Export does not imply a backup service.

## Account policy if revisited

Provider selection requires a separate approved ADR covering session storage/rotation, CSRF posture, authorization, account verification, recovery, MFA posture, abuse response, privacy notice, export/delete SLAs, retention/backups, telemetry, incident ownership, and provider exit/migration. Authentication alone will not authorize user records; every server repository must derive the owner from a trusted session and test cross-owner denial.

Existing anonymous data must never be silently claimed, overwritten, or uploaded after sign-in. Linking will require an explicit review screen that identifies this browser's local datasets, previews conflicts and counts, lets the user choose keep-local/import/skip per dataset, creates a rollback export, and reports partial failures. Library bytes require separate consent. Until that workflow and server-side ownership tests exist, there is no remote profile or sync adapter.

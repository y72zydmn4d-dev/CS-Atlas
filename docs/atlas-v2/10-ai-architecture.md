# Atlas AI Architecture

## Current capability

`/assistant` sends a user question and locale to `POST /api/ai/ask`. `lib/ai/context.ts` retrieves a bounded set of public Atlas excerpts from static content. `lib/ai/gemini.ts` is server-only and calls Google Generative Language API with `GEMINI_API_KEY`; the provider key is not a browser variable. Answers render as plain text and list Atlas source links. The API validates request bounds/origin and uses an in-process rate limiter. No auth or durable cost limit exists.

Practice feedback is a separate explicit-click endpoint. The user-selected problem/code and reported public case context may be sent to Gemini. Client verdicts are treated as untrusted; AI cannot alter runner state. No Library file/text, progress, or bookmark context is accepted by current assistant routes.

## Target responsibility

Atlas AI is an orchestration layer that can answer learning questions using selected context from the current page, canonical Concept, Lesson, Problem, selected code, Roadmap, progress/mastery, and Library/RAG. It is not a canonical content store, judge, authorization provider, or automatic mutator of user data.

Subsystem contracts:

- **Task API:** typed task such as explain, hint, debug, review, quiz, exercise draft, summarize, recommend. Validate task-specific bounds and outputs.
- **Context selection:** explicit references to source entity IDs and versions; authorization and opt-in policy per source type; relevance and size budgets.
- **Context provider:** resolves permitted public/user-owned source references to sanitized excerpts. It does not scan arbitrary stores.
- **Prompt assembler:** separates trusted system policy from untrusted source text/code and labels provenance; applies injection-resistance instructions and output policy.
- **Provider adapter:** server-only credentials, provider timeouts, normalized errors, cost/token ceilings, provider policy and no-store response handling.
- **Response/provenance:** answer text, source references, uncertainty/status, task ID. Model-written citations are not accepted as proof; server-issued source references must resolve to supplied context.
- **Evaluation:** task-specific quality, grounding, privacy, injection, output and cost tests; monitoring minimizes prompt retention.

## Context-source policy

| Context | Default behavior |
|---|---|
| Current public page / Concept / Lesson / Problem | May be offered as public context after bounded server-side resolution; identify source/version. |
| Selected code | Include only on an explicit action such as debug/review; code is untrusted input and may contain secrets. Warn/avoid logging. |
| Roadmap | Include selected visible node/path only; do not infer mastery from visual membership. |
| Progress/mastery | Include only if user requests personalized guidance and records are available under their ownership; treat as sensitive learning profile. |
| Library item/RAG | Excluded by default. Require a separate explicit action for the selected item/context and destination/provider. Enforce ownership and deletion status. |
| Hidden tests/reference solutions | Never include in model context. |

## Privacy, safety, and operational rules

- Keep provider credentials server-only. Reject client attempts to choose arbitrary provider URLs/models unless explicitly allowlisted.
- Enforce auth and per-user quotas for public hosting; shared durable limits and budget controls replace process-local caps.
- Send the minimum context necessary; cap bytes/tokens and output size. Prefer ephemeral context assembly and avoid raw prompt logging/retention by default.
- Treat user prompt, selected code, Library text, and retrieved chunks as adversarial untrusted data. Context cannot override system policy or trigger tool execution.
- Do not expose tools/actions that mutate bookmarks, progress, plans, content, or code without explicit confirmation and a typed authorized action.
- Provider error, refusal, no-context, timeout, and malformed output states remain distinct in UX.
- AI output is not an official solution, test verdict, mastery update, or factually verified citation unless a separate validation process establishes it.
- Review provider data-processing/retention terms before adding private or personal sources.

## RAG separation

Library source metadata and original files remain usable with no AI dependency. Future ingestion records are derived and versioned by file checksum, extractor, chunker, embedding model, and source locale. They link back to an item and page/offset provenance. Delete/replace invalidates associated chunks/indexes. Semantic retrieval is a later capability decision, not a prerequisite for document storage.

## Migration path

**Current state:** public Atlas retrieval and Gemini adapter are implemented; Library excluded; no AI jobs/history/account controls.

**Proposed state:** typed task/context/provider interfaces, per-source authorization and consent, durable quotas, response provenance, evaluation suite.

**Migration path:** preserve current public Q&A as the first adapter; wrap retrieval and request limits in services; add auth/cost controls for public hosting; add one context source at a time after source ownership rules; only then consider Library ingestion/RAG. No AI system implementation is part of M0.

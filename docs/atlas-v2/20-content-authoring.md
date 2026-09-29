# Content authoring and review

## Ownership

Canonical curriculum is authored in `content/`, never inside route or page components. Topics remain the compatibility source during this migration. `content/lessons.ts` projects each topic into stable Lesson, block, reference, example, and runtime-capability records without copying lesson prose. Canonical Concept IDs are the cross-feature anchors.

Every Lesson projection records its source topic, content version, review date, cited source IDs, translation status, and content maturity. A block always declares English availability; Vietnamese availability is recorded only when a matching reviewed translation block exists. References must resolve through `content/sources.ts`, and citations stay attached to the claim-bearing block.

## Review maturity

- `Foundation`: correct orientation and prerequisites, but not a complete teaching sequence.
- `Developing`: meaningful structured coverage that still has known depth or review gaps.
- `Detailed`: substantial treatment with examples and exercises, pending reference-level review.
- `Reference-quality`: reviewed sequence with objectives, worked examples, exercises, and sources.

Maturity is editorial evidence, not a score inferred from block count. Translation status is independent of maturity; fallback English does not make Vietnamese complete.

## Change workflow

1. Add or revise structured blocks and stable block IDs in the owning `content/` module.
2. Preserve the topic and Lesson IDs; bump the topic revision for semantic content changes.
3. Add reusable sources to `content/sources.ts` and attach citations to the relevant blocks.
4. Update Vietnamese content separately and mark its honest review status.
5. Run content validation, the content/renderer tests, strict typecheck, lint, and the production build.
6. Review route parity, Concept relations, citations, code capability labels, and the rendered lesson before handoff.

Large imported or generated datasets must enter a future reviewable proposal/diff workflow. They must not be inserted into page components or automatically promoted from a user's Library. Existing code blocks are syntax-highlighted examples only: their derived playground records explicitly declare `runtime: none` and `availability: unavailable` until an approved browser runtime is introduced.

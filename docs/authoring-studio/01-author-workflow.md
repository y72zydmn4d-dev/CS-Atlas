# 01 — Studio workflow

## Implemented: Milestones A/B (canonical source read-only, transient drafts)

Start an explicitly enabled, loopback-only development server:

```sh
AUTHORING_STUDIO_ENABLED=true npm run dev -- --hostname 127.0.0.1
```

Open `/studio` directly. There is deliberately no learner-navigation entry. Restart the server after changing enablement. `next start`/production is unavailable regardless of the flag.

1. **Overview:** real manifest subject/section/lesson totals and all four declared lesson statuses. COMPLETE is a declaration, not a new content-quality certification. Validation is **not scanned**.
2. **Subjects:** search EN/VI titles, IDs or category; filter subject status. Select a subject to load its curriculum metadata. Per-subject sections/lessons/COMPLETE totals come from the canonical manifests.
3. **Curriculum:** native expandable sections in canonical order; search lessons/sections, filter lesson status or section. SKELETON filter identifies current authoring debt without inventing a second queue/order.
4. **Editor:** select a lesson to load only its manifest and actual body (or real absence). Expand Saved identity and relationships to inspect immutable IDs/slug/ownership/order/source and Concept/Exercise/Problem/prerequisite IDs. Edit title/description, positive whole minutes, canonical difficulty/status/translation enums, body summary and author-supplied review date. EN/VI authoring buttons are separate from UI locale; changing one language does not copy/translate the other. Draft COMPLETE/translation claims are explicitly unvalidated, never published.
5. **Body:** a skeleton begins clean with `content:null`. Start transient body explicitly creates a local canonical-shaped body (`version:1`, empty review date/summary/blocks); it does not create a file or promote status. Add objectives as an actual objectives block, not duplicated top-level metadata. Edit/add/remove/up/down objectives and list items; edit/add/remove/up/down/duplicate/collapse blocks. Code/output remain text, never executed.
6. **Discard protection:** Modified draft means selected canonical records differ structurally; manually reverting returns Matches saved source. Reset draft requires confirmation. Switching lesson/subject/Overview/Home/Learn while dirty offers only Discard draft and continue / Cancel. Filters, collapse and language controls never discard the draft. Ctrl/Cmd+S prevents browser Save Page and explains repository Save is unavailable.
7. **Open learner lesson:** opens saved canonical Learn, not the unsaved draft. That normal learner route has ordinary progress behavior; Studio never records evidence or executes examples.

Selections live in `/studio?subject=<canonical-id>&lesson=<canonical-id>`. Studio-only guarded native anchors use full-document navigation with no prefetch, so history/refresh participate in the dirty-only `beforeunload` warning. No router history interception/sentinel or learner routing change. This trades SPA selection speed/filter preservation for conservative draft safety. Browser prompts require user activation and are browser-controlled; mobile/browser shutdown can suppress them. There is no draft recovery/persistence. UI uses existing locale/theme controls; copied VI values are not represented as reviewed translations.

Desktop/laptop≥1100px uses three bounded scrolling panels with sticky filter/editor headers; narrower tablet stacks editor below explorers. Mobile stacks panels and recommends desktop. Form labels, reorder buttons and native modal support keyboard access; no drag dependency. Studio keeps main/skip/Home/root theme/locale, without learner Search/learning-data services or new persistence.

## Transient conversion boundary

`lib/studio/draft.ts`: `toAuthoringDraft()` deep-clones canonical `LessonManifest` + nullable `LearnLessonContent`. Separate baseline/draft copies share no mutable source references. `toCanonicalCandidate()` returns an isolated identical canonical shape without UI properties; it is not authoritative validation or a persistence API. `draftFingerprint()` sorts object keys, omits absent optional undefined, and preserves array order, prose/code whitespace and body absence. Only the selected draft is compared; baseline fingerprint is memoized. This is not a disk revision/stale-write guarantee.

Editable/addable payloads: paragraph, objectives, heading (H2/H3), list, definition, syntax, code, output, callout (all five canonical tones), table, comparison, complexity. Common optional title/reorder/duplicate/remove/collapse controls support all16 variants with stable local block IDs. Example/Exercise/Reference/Related IDs stay read-only and these four are not in Add block until C provides valid registry selection. Learn syntax language is an unrestricted canonical string, not Practice runtime metadata or a new enum. Table cells/term/code/output/complexity strings remain language-neutral. Adding/removing columns maintains row width; no raw arrays/HTML/WYSIWYG.

## Still deferred

Repository Save/Create/curriculum Reorder, authoritative validation, real learner preview, relationship pickers, storage migration and writer are unavailable; no pretend actions. No filesystem/localStorage autosave, persisted parallel record, generic API/action, execution or Git UI command.

**Next: C only — canonical relationship pickers.** Reuse this draft/session/editor. D validation; E no-evidence real-renderer preview; F safe storage/write foundation; G–K persistence/organization per [03](03-content-file-contract.md). Historical M0 mention of Save/Discard/Cancel is not a B feature: B deliberately has no Save action.

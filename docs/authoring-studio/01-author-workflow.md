# 01 — Studio workflow

## Implemented: Milestone A (read-only)

Start an explicitly enabled, loopback-only development server:

```sh
AUTHORING_STUDIO_ENABLED=true npm run dev -- --hostname 127.0.0.1
```

Open `/studio` directly. There is deliberately no learner-navigation entry. Restart the server after changing enablement. `next start`/production is unavailable regardless of the flag.

1. **Overview:** real manifest subject/section/lesson totals and all four declared lesson statuses. COMPLETE is a declaration, not a new content-quality certification. Validation is **not scanned**.
2. **Subjects:** search EN/VI titles, IDs or category; filter subject status. Select a subject to load its curriculum metadata. Per-subject sections/lessons/COMPLETE totals come from the canonical manifests.
3. **Curriculum:** native expandable sections in canonical order; search lessons/sections, filter lesson status or section. SKELETON filter identifies current authoring debt without inventing a second queue/order.
4. **Inspector:** select a lesson to load its manifest and actual body (or real absence). View IDs, route slug, ownership/order, duration/difficulty/status/translation, Concept/Exercise/Problem/prerequisite IDs, source declaration, body summary/version/review date and expandable block payloads.
5. **Open learner lesson:** use the real canonical Learn link. That normal learner route has ordinary progress behavior; inspection itself does not record learning evidence or execute examples.

Selections live in `/studio?subject=<canonical-id>&lesson=<canonical-id>`. Browser Back/Forward and refresh work; filters are transient UI state. Selection links disable prefetch to avoid fetching unselected bodies. Interface uses the existing locale/theme controls; copied VI content is explicitly not presented as reviewed translation.

Desktop uses three bounded, independently scrolling panels with sticky filter/inspector headers. Laptop/tablet stacks inspection below the explorers; mobile stacks panels and recommends desktop. Native controls/links/details remain keyboard accessible. Studio has its own main/skip link, Home link, existing locale switcher and root theme/locale providers; it does not mount the learner sidebar/Search/learning-data services. No Studio-specific browser persistence.

## Not implemented in A

No editor, dirty state, Save/Create/Reorder, preview, validation operation, relationship picker, new content, storage migration or repository writer. No disabled buttons pretending these features work. Inspecting block JSON is **not** a replacement learner renderer.

**Next: B only.** Introduce transient drafts using canonical fields, metadata/objectives/16 supported block controls and unsaved-change handling. Still no disk writes. C adds relationship pickers; D authoritative validation; E actual no-evidence renderer preview; F safe storage/write foundation; G–K expose/test persistence and organization per [03](03-content-file-contract.md).

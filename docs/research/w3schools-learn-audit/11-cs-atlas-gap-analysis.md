# CS-Atlas gap analysis

## Current strengths to preserve

- Canonical Concept identity and typed relations.
- Existing topic block renderer, citations, content maturity and localization status.
- Server-first App Router routes with tested client islands.
- Local Exercise, Problem/Practice, QuickJS Worker and evidence systems.
- Separate Roadmap, Mind Map and Atlas semantics.
- Unified deterministic search and controlled public Atlas AI context.
- Route compatibility, local persistence, accessibility and theme foundations.

## Current Learn gaps

| Area | Current state | Required change |
| --- | --- | --- |
| Catalog | Flat list of projected topic lessons | Grouped subject catalog with truthful status |
| Subject identity | Domain filter over lessons | Typed subject manifest with sections/surfaces |
| Curriculum | Domain topic order only | Subject-scoped section/lesson navigation |
| Lesson layout | Article + right TOC | Curriculum + readable article + optional right rail |
| Content schema | Strong academic blocks, narrow tutorial variants | Add syntax/output/table/runnable/best-practice/reference blocks |
| Examples | Derived from worked/code blocks | First-class reusable Example records |
| Runtime | Existing lesson code explicitly non-runnable | Capability-aware QuickJS examples; honest unsupported states |
| Exercises | Global Exercise catalog and embedded blocks | Subject/chapter projections and inline canonical checkpoints |
| Quiz | No subject quiz manifest | Evidence-backed section/subject quiz groups |
| Reference | Source citations, no learner reference catalog | Typed dense Reference records and routes |
| Search | Concepts/topics/exercises/problems | Add Subject/Section/Lesson/Reference projections |
| Progress | Legacy topic status plus learning events | Derive subject completion from lesson/exercise/quiz evidence |
| AI | Public Concept context | Add bounded subject/section/lesson/heading context contract |
| Routes | `/learn/[lesson]` | Subject routes plus deterministic legacy aliases |

## Architectural constraint

The overhaul must extend `lib/domain/learn.ts`, existing content/evidence/search/AI adapters and canonical Concept IDs. It must not create a disconnected curriculum database, progress store or second concept registry.


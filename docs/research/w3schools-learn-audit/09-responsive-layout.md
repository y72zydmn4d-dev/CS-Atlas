# Responsive layout study

## Verified structural behavior

- Global navigation, subject navigation, article, activity controls and footer are distinct regions.
- The desktop subject curriculum is persistent and lesson-scoped.
- Public tutorial guidance describes a top-menu-triggered curriculum drawer on small screens.
- Editor routes expose source/result orientation switching.
- Study-plan material claims desktop, tablet and smartphone access.

Live viewport inspection was unavailable, so precise breakpoints, animation, drawer focus trapping and sticky offsets were not verified.

## Atlas responsive specification

| Range | Curriculum | Article | Right rail |
| --- | --- | --- | --- |
| wide desktop (target ≥ 1280px) | sticky 250–290px column | readable center, roughly 720–820px prose | optional 210–250px |
| laptop/tablet landscape | collapsible/sticky narrow column or drawer | primary flexible column | hidden or popover |
| mobile (target < 760px) | labelled drawer with focus return | full width | folded into article controls |

These are Atlas design targets, not copied measurements. The global app sidebar and tutorial sidebar must never permanently compete on a narrow screen. Tables/code use contained horizontal scrolling; editor controls wrap without becoming unreachable; previous/next stays discoverable without covering content.


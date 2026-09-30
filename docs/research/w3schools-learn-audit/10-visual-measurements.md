# Visual measurement notes

## Measurement limitation

A render-capable browser and computed-style inspection were unavailable, and direct HTTP access returned `403`. Therefore this audit does not claim current W3Schools pixel measurements. No dimensions were inferred from screenshots or copied CSS.

## Structural observations suitable for design calibration

- Two stacked global navigation layers precede tutorial content.
- Subject navigation is visually narrower than the main lesson column.
- Main prose remains materially narrower than the full workspace.
- Example/code surfaces use stronger separation and more internal padding than ordinary paragraphs.
- Reference tables use compact row density.
- Previous/next controls are prominent enough to support serial reading.
- Subject sidebar rows are compact enough to expose many chapters per viewport.

## Atlas starting targets to validate manually

| Element | Atlas target |
| --- | --- |
| Curriculum width | 264px |
| Main readable measure | 72–80 characters; max article region about 800px |
| Right rail | 224px |
| Workspace gap | 24–32px |
| Sidebar row | 34–40px minimum; 44px touch target on mobile |
| Body line height | 1.65–1.75 |
| Code font size | 13–14px |
| Code/example padding | 16–20px |
| Dense reference row | 40–48px |
| Mobile switch | around 760px, validated against content rather than device names |
| Right-rail collapse | around 1180px |

These values belong to the CS-Atlas design system and must be adjusted through responsive browser QA. They are not W3Schools measurements.


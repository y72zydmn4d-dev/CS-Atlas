/** Decorative field only: no concept data, interaction, hydration or layout ownership. */
function AuroraField() {
  return <div className="landing-aurora-field">
    <span className="landing-aurora landing-aurora-indigo" />
    <span className="landing-aurora landing-aurora-cyan" />
  </div>;
}

function ScientificContours() {
  return <g className="landing-atmosphere-contours" fill="none">
    <g className="landing-contour-primary">
      <path d="M-240 280 C220 220 330 390 140 550 S-180 690 240 860" />
      <path d="M-270 324 C172 266 272 410 104 554 S-198 712 196 890" />
      <path d="M-296 370 C124 312 214 432 68 560 S-220 734 152 920" />
      <path d="M1780 116 C1400 120 1204 280 1410 424 S1800 532 1560 782" />
    </g>
    <g className="landing-contour-secondary">
      <path d="M1810 164 C1450 160 1270 300 1450 438 S1836 558 1604 814" />
      <path d="M1840 212 C1500 204 1334 324 1490 452 S1870 582 1648 846" />
    </g>
  </g>;
}

function SparsePointField() {
  return <g className="landing-atmosphere-points">
    <circle cx="160" cy="770" r="1" />
    <circle className="landing-point-echo" cx="1474" cy="300" r="1.4" />
    <circle className="landing-point-secondary" cx="1538" cy="696" r="1.1" />
    <circle className="landing-point-secondary" cx="76" cy="470" r=".8" />
  </g>;
}

export function LandingAtmosphere() {
  return <div className="landing-atmosphere" aria-hidden="true">
    <AuroraField />
    <svg className="landing-atmosphere-geometry" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" focusable="false">
      <ScientificContours />
      <SparsePointField />
    </svg>
  </div>;
}

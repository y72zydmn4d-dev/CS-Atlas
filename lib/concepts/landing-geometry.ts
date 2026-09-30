/** Geometry belongs to the landing view, never the canonical relation registry. */
export type LandingPoint = readonly [number, number];
export type LandingSide = "top" | "right" | "bottom" | "left";
export interface LandingRoute {
  sourceSide: LandingSide;
  targetSide: LandingSide;
  // Two cubic controls, or two joined cubics: control/control/join/control/control.
  controls: readonly LandingPoint[];
}
export interface LandingBox { center: LandingPoint; width: number; height: number; scale?: LandingPoint }
export interface LandingCurve { start: LandingPoint; controls: readonly [LandingPoint, LandingPoint]; end: LandingPoint }

function port(box: LandingBox, side: LandingSide, arrow: boolean): LandingPoint {
  const gap = (6 + (arrow ? 3 : 0)) * (box.scale?.[side === "top" || side === "bottom" ? 1 : 0] ?? 1);
  const [x,y] = box.center;
  switch (side) {
    case "top": return [x,y-box.height/2-gap];
    case "bottom": return [x,y+box.height/2+gap];
    case "left": return [x-box.width/2-gap,y];
    case "right": return [x+box.width/2+gap,y];
  }
}

export function landingCurves(source: LandingBox, target: LandingBox, route: LandingRoute, arrow: boolean): LandingCurve[] {
  const start = port(source,route.sourceSide,false);
  const end = port(target,route.targetSide,arrow);
  const [first,second,join,third,fourth] = route.controls;
  if (!first || !second) throw new Error("Landing curve requires control points");
  if (join && third && fourth) return [
    { start, controls: [first,second], end: join },
    { start: join, controls: [third,fourth], end },
  ];
  return [{ start, controls: [first,second], end }];
}

export function landingCurvePath(curves: LandingCurve[]): string {
  return curves.map((curve,index) => `${index === 0 ? `M ${curve.start.join(" ")} ` : ""}C ${curve.controls[0].join(" ")} ${curve.controls[1].join(" ")} ${curve.end.join(" ")}`).join(" ");
}

/** CSS-pixel label boxes converted into the SVG's coordinate space. */
export function landingBox(center: LandingPoint, size: LandingPoint, viewport: LandingPoint, reference: LandingPoint): LandingBox {
  const scale: LandingPoint = [reference[0]/viewport[0],reference[1]/viewport[1]];
  return { center, width: size[0]*scale[0], height: size[1]*scale[1], scale };
}

import { describe, expect, it } from "vitest";
import { knowledgePreview } from "@/content/landing/knowledge-preview";
import { landingDimensions, type LandingLayout } from "@/lib/concepts/landing-projection";
import { landingBox, landingCurves, landingCurvePath, type LandingPoint } from "@/lib/concepts/landing-geometry";

describe("landing relationship geometry", () => {
  for (const [layout,actualWidth] of [["wide",880],["wide",848],["wide",768],["compact",552],["tablet",440]] as const) {
    for (const envelope of ["reserved","short","mixed"] as const) {
      it(`keeps ${layout}/${actualWidth}/${envelope} curves clear of label rectangles`, () => {
        const reference = landingDimensions[layout];
        const nodes = knowledgePreview.nodes.flatMap((node) => {
          const point = node[layout];
          if (!point) return [];
          const tall = envelope === "reserved" || envelope === "mixed" && node.id === "topic:ml-fundamentals";
          const size: LandingPoint = [layout === "wide" ? node.rank === "anchor" ? 164 : 148 : layout === "compact" ? 140 : 128,tall ? layout === "wide" && node.rank === "anchor" ? 72 : 64 : node.rank === "anchor" ? 56 : 48];
          return [{ id:node.id, box:landingBox(point,size,[actualWidth,reference[1]],reference) }];
        });
        for (const relation of knowledgePreview.relations) {
          const source = nodes.find((node) => node.id === relation.source);
          const target = nodes.find((node) => node.id === relation.target);
          const route = relation.routes[layout as LandingLayout];
          if (!source || !target || !route) continue;
          const curves = landingCurves(source.box,target.box,route,relation.type === "PREREQUISITE_OF");
          expect(landingCurvePath(curves)).not.toMatch(/NaN|Infinity|\b[HV]\b/);
          for (const curve of curves) for (let step=0;step<=100;step++) {
            const t=step/100, u=1-t;
            const point = [0,1].map((axis) => u**3*curve.start[axis] + 3*u*u*t*curve.controls[0][axis] + 3*u*t*t*curve.controls[1][axis] + t**3*curve.end[axis]);
            expect(point[0]).toBeGreaterThanOrEqual(12);
            expect(point[0]).toBeLessThanOrEqual(reference[0]-12);
            expect(point[1]).toBeGreaterThanOrEqual(12);
            expect(point[1]).toBeLessThanOrEqual(reference[1]-12);
            for (const {id,box} of nodes) {
              const intersects = Math.abs(point[0]-box.center[0]) < box.width/2+5*(box.scale?.[0] ?? 1) && Math.abs(point[1]-box.center[1]) < box.height/2+5;
              expect(intersects,`${relation.source}→${relation.target} crosses ${id} at ${point}`).toBe(false);
            }
          }
        }
      });
    }
  }
  it("scales label widths and clearance into SVG units without altering text size", () => {
    const box = landingBox([100,100],[164,72],[880,360],[800,360]);
    expect(box.width).toBeCloseTo(164/1.1);
    expect(box.height).toBe(72);
  });
});

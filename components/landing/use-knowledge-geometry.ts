"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/types";
import type { LandingLayout } from "@/lib/concepts/landing-projection";
import type { LandingPoint } from "@/lib/concepts/landing-geometry";

interface LayoutMeasurement { viewport: LandingPoint; sizes: Record<string, LandingPoint> }

/** One observer; measurements only on resize/text reflow, never on animation frames. */
export function useKnowledgeGeometry(locale: Locale) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [measurements, setMeasurements] = useState<Partial<Record<LandingLayout, LayoutMeasurement>>>({});
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || typeof ResizeObserver === "undefined") return;
    function measure() {
      if (!layer) return;
      const next: Partial<Record<LandingLayout, LayoutMeasurement>> = {};
      for (const layout of ["wide","compact","tablet"] as const) {
        const element = layer.querySelector<HTMLElement>(`.knowledge-${layout}`);
        if (!element || !element.offsetWidth || !element.offsetHeight) continue;
        const sizes: Record<string, LandingPoint> = {};
        for (const node of element.querySelectorAll<HTMLElement>("[data-concept]")) {
          if (node.dataset.concept) sizes[node.dataset.concept] = [node.offsetWidth,node.offsetHeight];
        }
        next[layout] = { viewport: [element.offsetWidth,element.offsetHeight], sizes };
      }
      setMeasurements((previous) => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(layer);
    for (const node of layer.querySelectorAll(".knowledge-node")) observer.observe(node);
    return () => observer.disconnect();
  }, [locale]);
  return { layerRef, measurements };
}

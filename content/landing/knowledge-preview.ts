import type { LandingPresentation } from "@/lib/concepts/landing-projection";

// Editorial coordinates and canonical selectors only; never duplicate Concept metadata.
export const knowledgePreview: LandingPresentation = {
  nodes: [
    { id: "topic:programming-fundamentals", rank: "anchor", wide: [112,42], compact: [86,36] },
    { id: "topic:complexity-analysis", rank: "supporting", wide: [290,42], compact: [280,36] },
    { id: "topic:arrays", rank: "supporting", wide: [468,42] },
    { id: "topic:ml-fundamentals", rank: "anchor", wide: [686,42], compact: [468,36], tablet: [280,42] },
    { id: "topic:python", rank: "subject", wide: [112,148], compact: [86,128], tablet: [86,42] },
    { id: "topic:recursion", rank: "supporting", wide: [290,148] },
    { id: "topic:dynamic-programming", rank: "advanced", wide: [468,148] },
    { id: "topic:neural-networks", rank: "supporting", wide: [686,148], compact: [468,128], tablet: [468,42] },
    { id: "topic:linear-algebra", rank: "anchor", wide: [112,268], compact: [86,224], tablet: [86,178] },
    { id: "topic:multivariable-calculus", rank: "supporting", wide: [290,268] },
    { id: "topic:optimization", rank: "supporting", wide: [468,268], compact: [280,224], tablet: [280,178] },
    { id: "topic:gradient-descent", rank: "supporting", wide: [686,268], compact: [468,224], tablet: [468,178] },
  ],
  relations: [
    { source: "topic:programming-fundamentals", target: "topic:complexity-analysis", type: "PREREQUISITE_OF" },
    { source: "topic:programming-fundamentals", target: "topic:recursion", type: "PREREQUISITE_OF" },
    { source: "topic:complexity-analysis", target: "topic:arrays", type: "PREREQUISITE_OF" },
    { source: "topic:complexity-analysis", target: "topic:dynamic-programming", type: "PREREQUISITE_OF" },
    { source: "topic:recursion", target: "topic:dynamic-programming", type: "PREREQUISITE_OF" },
    { source: "topic:python", target: "topic:ml-fundamentals", type: "PREREQUISITE_OF" },
    { source: "topic:ml-fundamentals", target: "topic:neural-networks", type: "PREREQUISITE_OF" },
    { source: "topic:linear-algebra", target: "topic:neural-networks", type: "PREREQUISITE_OF" },
    { source: "topic:linear-algebra", target: "topic:optimization", type: "PREREQUISITE_OF" },
    { source: "topic:multivariable-calculus", target: "topic:optimization", type: "PREREQUISITE_OF" },
    { source: "topic:optimization", target: "topic:gradient-descent", type: "PREREQUISITE_OF" },
    { source: "topic:python", target: "topic:programming-fundamentals", type: "RELATED_TO" },
    { source: "topic:gradient-descent", target: "topic:neural-networks", type: "RELATED_TO" },
  ],
};

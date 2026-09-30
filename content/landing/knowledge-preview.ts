import type { LandingPresentation } from "@/lib/concepts/landing-projection";
import type { LandingPoint, LandingRoute, LandingSide } from "@/lib/concepts/landing-geometry";

function route(sourceSide: LandingSide, targetSide: LandingSide, ...controls: LandingPoint[]): LandingRoute { return { sourceSide,targetSide,controls }; }

// Editorial coordinates and canonical selectors only; never duplicate Concept metadata.
export const knowledgePreview: LandingPresentation = {
  nodes: [
    { id: "topic:programming-fundamentals", rank: "anchor", focal: true, wide: [100,48], compact: [86,44] },
    { id: "topic:complexity-analysis", rank: "supporting", wide: [296,44], compact: [280,44] },
    { id: "topic:arrays", rank: "supporting", wide: [478,76] },
    { id: "topic:ml-fundamentals", rank: "anchor", focal: true, wide: [690,80], compact: [468,52], tablet: [220,44] },
    { id: "topic:python", rank: "anchor", wide: [104,162], compact: [86,138], tablet: [76,48] },
    { id: "topic:recursion", rank: "supporting", wide: [280,156] },
    { id: "topic:dynamic-programming", rank: "bridge", wide: [464,200] },
    { id: "topic:neural-networks", rank: "bridge", wide: [690,210], compact: [468,150], tablet: [364,64] },
    { id: "topic:linear-algebra", rank: "anchor", wide: [104,288], compact: [86,236], tablet: [76,184] },
    { id: "topic:multivariable-calculus", rank: "supporting", wide: [282,270] },
    { id: "topic:optimization", rank: "supporting", wide: [464,312], compact: [280,232], tablet: [220,180] },
    { id: "topic:gradient-descent", rank: "supporting", wide: [684,316], compact: [468,236], tablet: [364,188] },
  ],
  relations: [
    { source: "topic:programming-fundamentals", target: "topic:complexity-analysis", type: "PREREQUISITE_OF", routes: { wide: route("right","left",[198,24],[200,24]), compact: route("right","left",[178,24],[188,24]) } },
    { source: "topic:programming-fundamentals", target: "topic:recursion", type: "PREREQUISITE_OF", routes: { wide: route("bottom","top",[100,112],[280,96]) } },
    { source: "topic:complexity-analysis", target: "topic:arrays", type: "PREREQUISITE_OF", routes: { wide: route("right","left",[388,44],[390,76]) } },
    { source: "topic:complexity-analysis", target: "topic:dynamic-programming", type: "PREREQUISITE_OF", routes: { wide: route("bottom","top",[296,106],[464,132]) } },
    { source: "topic:recursion", target: "topic:dynamic-programming", type: "PREREQUISITE_OF", routes: { wide: route("right","left",[378,156],[363,200]) } },
    { source: "topic:python", target: "topic:ml-fundamentals", type: "PREREQUISITE_OF", routes: { wide: route("top","bottom",[104,106],[406,116],[560,124],[608,126.5],[646,168]), compact: route("top","bottom",[86,94],[368,90]), tablet: route("bottom","bottom",[76,112],[220,112]) } },
    { source: "topic:ml-fundamentals", target: "topic:neural-networks", type: "PREREQUISITE_OF", routes: { wide: route("bottom","top",[666,136],[666,154]), compact: route("bottom","top",[452,98],[452,102]), tablet: route("bottom","bottom",[220,104],[364,122]) } },
    { source: "topic:linear-algebra", target: "topic:neural-networks", type: "PREREQUISITE_OF", routes: { wide: route("top","left",[164,214],[352,196],[380,236],[408,276],[552,268]), compact: route("right","left",[184,200],[184,168]), tablet: route("top","bottom",[76,120],[364,130]) } },
    { source: "topic:linear-algebra", target: "topic:optimization", type: "PREREQUISITE_OF", routes: { wide: route("bottom","left",[196,346],[324,346]), compact: route("right","left",[178,264],[190,264]), tablet: route("top","top",[76,118],[220,120]) } },
    { source: "topic:multivariable-calculus", target: "topic:optimization", type: "PREREQUISITE_OF", routes: { wide: route("right","left",[376,270],[368,312]) } },
    { source: "topic:optimization", target: "topic:gradient-descent", type: "PREREQUISITE_OF", routes: { wide: route("right","left",[548,340],[580,338]), compact: route("right","left",[364,260],[380,260]), tablet: route("top","top",[220,120],[364,122]) } },
    { source: "topic:python", target: "topic:programming-fundamentals", type: "RELATED_TO", routes: { wide: route("top","bottom",[80,108],[80,102]), compact: route("top","bottom",[70,94],[70,88]) } },
    { source: "topic:gradient-descent", target: "topic:neural-networks", type: "RELATED_TO", routes: { wide: route("top","bottom",[716,278],[720,248]), compact: route("top","bottom",[480,196],[480,188]), tablet: route("top","bottom",[388,138],[388,114]) } },
  ],
};

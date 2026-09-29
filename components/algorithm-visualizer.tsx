"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useI18n } from "@/components/locale-provider";

interface VizFrame { values?: number[]; active?: number[]; excluded?: number[]; found?: number[]; visited?: string[]; current?: string; caption: string; }

function binaryFrames(): VizFrame[] {
  const values = [3, 7, 11, 18, 24, 31, 42, 56, 73]; const target = 42; const frames: VizFrame[] = [{ values, caption: `Search for ${target} in a sorted array.` }]; let lo = 0, hi = values.length - 1;
  while (lo <= hi) { const mid = Math.floor((lo + hi) / 2); frames.push({ values, active: [mid], excluded: values.map((_, i) => i).filter((i) => i < lo || i > hi), caption: `Inspect index ${mid}: ${values[mid]}. Active range is [${lo}, ${hi}].` }); if (values[mid] === target) { frames.push({ values, found: [mid], excluded: values.map((_, i) => i).filter((i) => i !== mid), caption: `Found ${target} at index ${mid}.` }); break; } if (values[mid] < target) lo = mid + 1; else hi = mid - 1; }
  return frames;
}
function mergeFrames(): VizFrame[] {
  const start = [38, 12, 45, 7, 29, 18, 52, 24]; const frames: VizFrame[] = [{ values: start, caption: "Start with eight unsorted values." }]; let width = 1; const current = [...start];
  while (width < current.length) { for (let left = 0; left < current.length; left += width * 2) { const mid = Math.min(left + width, current.length); const right = Math.min(left + width * 2, current.length); const merged = [...current.slice(left, mid), ...current.slice(mid, right)].sort((a,b) => a-b); current.splice(left, right-left, ...merged); frames.push({ values: [...current], active: Array.from({length:right-left},(_,i)=>left+i), caption: `Merge sorted runs [${left}, ${mid}) and [${mid}, ${right}).` }); } width *= 2; }
  frames.push({ values: current, found: current.map((_,i)=>i), caption: "All runs are merged; the array is sorted." }); return frames;
}
const graphNodes = [{id:"A",x:14,y:50},{id:"B",x:37,y:20},{id:"C",x:37,y:78},{id:"D",x:64,y:15},{id:"E",x:64,y:51},{id:"F",x:85,y:76}];
const graphEdges = [["A","B"],["A","C"],["B","D"],["B","E"],["C","E"],["E","F"]];
function bfsFrames(): VizFrame[] { return [{ visited: [], caption: "Begin at A with an empty visited set." },{ visited:["A"],current:"A",caption:"Visit A; enqueue B and C."},{visited:["A","B"],current:"B",caption:"Visit B; enqueue D and E."},{visited:["A","B","C"],current:"C",caption:"Visit C; E is already discovered."},{visited:["A","B","C","D"],current:"D",caption:"Visit D; it has no unseen neighbors."},{visited:["A","B","C","D","E"],current:"E",caption:"Visit E; enqueue F."},{visited:["A","B","C","D","E","F"],current:"F",caption:"Visit F. Breadth-first traversal is complete."}]; }

export function AlgorithmVisualizer({ type }: { type: "binary-search" | "bfs" | "merge-sort" }) {
  const { t } = useI18n();
  const frames = useMemo(() => type === "binary-search" ? binaryFrames() : type === "bfs" ? bfsFrames() : mergeFrames(), [type]);
  const [index, setIndex] = useState(0); const [playing, setPlaying] = useState(false); const [speed, setSpeed] = useState(700); const timer = useRef<ReturnType<typeof setInterval> | null>(null); const frame = frames[index];
  const next = useCallback(() => setIndex((current) => { if (current >= frames.length - 1) { setPlaying(false); return current; } return current + 1; }), [frames.length]);
  useEffect(() => { if (!playing) return; timer.current = setInterval(next, speed); return () => { if (timer.current) clearInterval(timer.current); }; }, [next, playing, speed]);
  const title = type === "binary-search" ? t("visualizer.binaryTitle") : type === "bfs" ? t("visualizer.bfsTitle") : t("visualizer.mergeTitle");
  return <section id="visualization" className={`visualizer visualizer-${type}`} aria-label={t("visualizer.aria", { title })}>
    <div className="visualizer-header"><h3>{title}</h3><span className="chip">{t("visualizer.step", { current: index + 1, total: frames.length })}</span></div>
    <div className="viz-step-track" aria-hidden="true"><span style={{ transform: `scaleX(${(index + 1) / frames.length})` }} /></div>
    <div className="visualizer-stage">{type === "bfs" ? <div className="graph-viz">{graphEdges.map(([a,b]) => { const from=graphNodes.find(n=>n.id===a)!;const to=graphNodes.find(n=>n.id===b)!;const dx=to.x-from.x,dy=to.y-from.y;const length=Math.sqrt(dx*dx+dy*dy);const traversed=Boolean(frame.visited?.includes(a)&&frame.visited?.includes(b));const active=frame.current===b;return <span key={`${a}${b}`} className={`graph-viz-line ${traversed?"traversed":""} ${active?"active":""}`} style={{left:`${from.x}%`,top:`${from.y}%`,width:`${length}%`,transform:`rotate(${Math.atan2(dy,dx)*180/Math.PI}deg)`}}/>})}{graphNodes.map((node)=><span key={node.id} className={`graph-viz-node ${frame.visited?.includes(node.id)?"visited":""} ${frame.current===node.id?"active":""}`} style={{left:`${node.x}%`,top:`${node.y}%`}}>{node.id}</span>)}</div> : <div className="array-bars">{frame.values?.map((value,i)=><span key={i} className={`array-bar ${frame.active?.includes(i)?"active":""} ${frame.excluded?.includes(i)?"excluded":""} ${frame.found?.includes(i)?(type==="merge-sort"?"sorted":"found"):""}`} style={{height:`${40 + value*1.7}px`}}><span>{value}</span></span>)}</div>}</div>
    <div key={`${type}-${index}`} className="step-caption" aria-live="polite">{frame.caption}</div>
    <div className="viz-controls"><button className="viz-button" onClick={() => setPlaying((value)=>!value)} aria-label={playing?t("visualizer.pause"):t("visualizer.play")} aria-pressed={playing}>{playing?<Pause size={16}/>:<Play size={16}/>}</button><button className="viz-button" onClick={next} disabled={index===frames.length-1} aria-label={t("visualizer.next")}><SkipForward size={16}/></button><button className="viz-button" onClick={()=>{setPlaying(false);setIndex(0)}} aria-label={t("visualizer.reset")}><RotateCcw size={16}/></button><label>{t("visualizer.speed")} <input type="range" min="250" max="1250" step="250" value={1500-speed} onChange={(event)=>setSpeed(1500-Number(event.target.value))}/></label></div>
  </section>;
}

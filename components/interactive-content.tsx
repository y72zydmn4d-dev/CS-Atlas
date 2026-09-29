"use client";

import { useState } from "react";
import { Check, Clipboard, Lightbulb, RotateCcw } from "lucide-react";
import type { ExerciseBlock } from "@/lib/types";
import { useAtlas } from "@/components/atlas-provider";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/locale-provider";
import { conceptIdForTopic } from "@/lib/domain/concepts";

export function CopyCodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();
  return <div className="rich-code"><div className="rich-code-header"><span>{language}</span><button onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }} aria-label={t("actions.copy")}>{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? t("actions.copied") : t("actions.copy")}</button></div><pre className="code-block"><code>{code}</code></pre></div>;
}

export function ExercisePanel({ topicId, block }: { topicId: string; block: ExerciseBlock }) {
  const { exercises, setExerciseStatus, recordLearningEvent } = useAtlas();
  const { t } = useI18n();
  const [updated, setUpdated] = useState(false);
  const progressId = `${topicId}:${block.id}`;
  const status = exercises[progressId] ?? "not-attempted";
  const updateStatus = (next: typeof status) => {
    setExerciseStatus(progressId, next);
    if (next !== "not-attempted") {
      recordLearningEvent({ type: next === "solved" ? "exercise-solved" : "exercise-attempted", conceptId: conceptIdForTopic(topicId), source: "browser-local" });
    }
    setUpdated(false);
    requestAnimationFrame(() => setUpdated(true));
    window.setTimeout(() => setUpdated(false), 520);
  };
  return <section id={block.id} className={cn("exercise-card", status === "solved" && "solved", updated && "status-updated")} aria-labelledby={`${block.id}-title`}>
    <div className="exercise-heading"><div><span className="exercise-type">{block.exerciseType} · {block.difficulty} · ≈ {block.estimatedMinutes} {t("common.minutes")}</span><h3 id={`${block.id}-title`}>{block.title}</h3></div><select className={cn("status-select", status === "solved" && "completed", status === "attempted" && "in-progress")} value={status} onChange={(event) => updateStatus(event.target.value as typeof status)} aria-label={`${block.title} ${t("status.learning")}`}><option value="not-attempted">{t("status.notAttempted")}</option><option value="attempted">{t("status.attempted")}</option><option value="solved">{t("status.solved")}</option></select></div>
    <p>{block.prompt}</p>
    {block.constraints?.length ? <ul>{block.constraints.map((value) => <li key={value}>{value}</li>)}</ul> : null}
    {block.starterCode && <CopyCodeBlock code={block.starterCode} language={block.language ?? "text"} />}
    <details className="exercise-disclosure"><summary><Lightbulb size={15} />{t("common.hints", { count: block.hints.length })}</summary><ol>{block.hints.map((hint) => <li key={hint}>{hint}</li>)}</ol></details>
    <details className="exercise-disclosure solution"><summary><Check size={15} />{t("common.solution")}</summary><p>{block.solution}</p><p className="solution-explanation">{block.explanation}</p></details>
    {status !== "not-attempted" && <button className="button-ghost reset-exercise" onClick={() => setExerciseStatus(progressId, "not-attempted")}><RotateCcw size={13} />{t("actions.resetExercise")}</button>}
  </section>;
}

"use client";

import Link from "next/link";
import { CheckCircle2, ChevronLeft, CircleHelp, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useAtlas } from "@/components/atlas-provider";
import { useI18n } from "@/components/locale-provider";
import type { Exercise, ExerciseResult } from "@/lib/domain/exercises";
import { evaluateExerciseResponse } from "@/lib/domain/exercises";

function progressId(exerciseId: string) {
  return exerciseId.replace(/^exercise:/, "");
}

export function ExerciseWorkspace({ exercise }: { exercise: Exercise }) {
  const { locale, t } = useI18n();
  const { exercises, exerciseAttempts, setExerciseStatus, recordExerciseAttempt, recordLearningEvent } = useAtlas();
  const [response, setResponse] = useState("");
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [visibleHints, setVisibleHints] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);
  const attempts = exerciseAttempts.filter((attempt) => attempt.exerciseId === exercise.id && attempt.exerciseVersion === exercise.version);
  const status = exercises[progressId(exercise.id)] ?? "not-attempted";

  const record = (nextResult: ExerciseResult) => {
    const saved = recordExerciseAttempt({ exerciseId: exercise.id, exerciseVersion: exercise.version, result: nextResult, hintCount: visibleHints });
    setSaveFailed(!saved);
    const solved = nextResult === "correct" || nextResult === "self-reported";
    setExerciseStatus(progressId(exercise.id), solved ? "solved" : "attempted");
    recordLearningEvent({
      type: solved ? "exercise-solved" : "exercise-attempted",
      conceptId: exercise.conceptIds[0],
      source: "browser-local",
      sourceVersion: exercise.version,
      target: { type: "exercise", id: exercise.id },
    });
  };

  const check = () => {
    const nextResult = evaluateExerciseResponse(exercise, response);
    setResult(nextResult);
    record(nextResult);
  };

  const assessment = exercise.assessment;
  return <div className="exercise-workspace">
    <Link className="text-link" href="/exercises"><ChevronLeft size={14} />{t("exercise.title")}</Link>
    <header className="page-header exercise-workspace-header"><div><p className="kicker">{exercise.mode} · {exercise.difficulty} · {exercise.estimatedMinutes} {t("common.minutes")}</p><h1>{exercise.title[locale]}</h1><p className="lede">{exercise.prompt[locale]}</p></div></header>
    <div className="exercise-workspace-grid">
      <main className="exercise-response-panel">
        {assessment.kind === "multiple-choice" && <fieldset className="exercise-options"><legend>{t("exercise.answer")}</legend>{assessment.options.map((option) => <label key={option.id}><input type="radio" name={exercise.id} value={option.id} checked={response === option.id} onChange={(event) => setResponse(event.target.value)} /><span>{option.text[locale]}</span></label>)}</fieldset>}
        {assessment.kind === "exact-answer" && <label className="form-field"><span>{assessment.inputLabel[locale]}</span><input value={response} onChange={(event) => setResponse(event.target.value)} aria-label={assessment.inputLabel[locale]} /></label>}
        {assessment.kind === "self-directed" && <p className="exercise-boundary"><CircleHelp size={17} />{t("exercise.executionUnavailable")}</p>}
        {assessment.kind === "self-directed" ? <button className="button-primary" onClick={() => { setResult("self-reported"); record("self-reported"); }}><CheckCircle2 size={16} />{t("planner.complete")}</button> : <button className="button-primary" disabled={!response.trim()} onClick={check}><CheckCircle2 size={16} />{t("exercise.check")}</button>}
        {result && <section className={`exercise-feedback ${result}`} aria-live="polite"><strong>{result === "correct" ? t("exercise.correct") : result === "incorrect" ? t("exercise.incorrect") : t("exercise.ungraded")}</strong>{assessment.kind !== "self-directed" && <p>{assessment.feedback[locale]}</p>}</section>}
        {saveFailed && <p className="form-error" role="alert">{t("planner.saveFailed")}</p>}
      </main>
      <aside className="exercise-workspace-aside"><section><h2><Lightbulb size={17} />{t("common.hints", { count: exercise.hints.length })}</h2>{visibleHints ? <ol>{exercise.hints.slice(0, visibleHints).map((hint, index) => <li key={index}>{hint[locale]}</li>)}</ol> : <p>{t("exercise.executionUnavailable")}</p>}{visibleHints < exercise.hints.length && <button className="button-secondary" onClick={() => setVisibleHints((count) => count + 1)}><Lightbulb size={14} />{t("common.hints", { count: visibleHints + 1 })}</button>}</section><section><h2>{t("concept.learn")}</h2><Link className="text-link" href={`/learn/${exercise.lessonId.replace(/^lesson:/, "")}`}>{exercise.lessonId.replace(/^lesson:/, "")}</Link></section><section><h2>{t("exercise.attempts", { count: attempts.length })}</h2><p>{status === "solved" ? t("status.solved") : status === "attempted" ? t("status.attempted") : t("status.notAttempted")}</p></section></aside>
    </div>
  </div>;
}

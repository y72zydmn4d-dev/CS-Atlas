"use client";

import Link from "next/link";
import { ArrowRight, BrainCircuit, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/locale-provider";
import type { AtlasSource } from "@/lib/ai/context";
import type { AtlasAiTask } from "@/lib/domain/ai";

const exampleKeys = ["assistant.exampleGradient", "assistant.exampleSearch", "assistant.exampleTransformers"] as const;
const modes: Array<{ task: AtlasAiTask; label: "assistant.modeAsk" | "assistant.modeExplain" | "assistant.modeTutor" | "assistant.modeHint" | "assistant.modeDebug" | "assistant.modeReview" | "assistant.modeQuiz" | "assistant.modeGenerateExercise" | "assistant.modeSummarize" | "assistant.modeStudyPlan" }> = [
  { task: "ask", label: "assistant.modeAsk" }, { task: "explain", label: "assistant.modeExplain" }, { task: "tutor", label: "assistant.modeTutor" }, { task: "hint", label: "assistant.modeHint" }, { task: "debug", label: "assistant.modeDebug" }, { task: "review", label: "assistant.modeReview" }, { task: "quiz", label: "assistant.modeQuiz" }, { task: "generate-exercise", label: "assistant.modeGenerateExercise" }, { task: "summarize", label: "assistant.modeSummarize" }, { task: "study-plan", label: "assistant.modeStudyPlan" },
];

export function AtlasAssistant({ configured, contextConceptId, contextLabel }: { configured: boolean; contextConceptId?: string; contextLabel?: string }) {
  const { locale, t } = useI18n();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<AtlasSource[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<AtlasAiTask>("ask");
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  async function ask(value: string) {
    const trimmed = value.trim();
    if (!configured || trimmed.length < 3 || loading) return;
    controller.current?.abort();
    controller.current = new AbortController();
    setQuestion(trimmed);
    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);
    try {
      const response = await fetch("/api/ai/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: trimmed, locale, task, ...(contextConceptId ? { contextConceptId } : {}) }), signal: controller.current.signal });
      const result: { answer?: string; sources?: AtlasSource[]; error?: string } = await response.json();
      if (!response.ok || !result.answer) throw new Error(result.error || "unavailable");
      setAnswer(result.answer);
      setSources(result.sources ?? []);
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return;
      const code = cause instanceof Error ? cause.message : "unavailable";
      setError(code === "rate-limit" ? t("assistant.rateLimit") : code === "no-context" ? t("assistant.noContext") : code === "authentication" || code === "not-configured" ? t("assistant.authError") : t("assistant.error"));
    } finally { setLoading(false); }
  }

  return <>
    <header className="page-header"><div><p className="kicker"><BrainCircuit size={14} /> {t("assistant.kicker")}</p><h1>{t("assistant.title")}</h1><p className="lede">{t("assistant.lede")}</p></div></header>
    <section className="assistant-panel" aria-label={t("assistant.title")}>
      <div className="assistant-intro"><span className="catalog-card-icon"><BrainCircuit size={19} /></span><div><strong>{t("assistant.grounded")}</strong><p>{t("assistant.groundedBody")}</p></div></div>
      {contextLabel && <p className="assistant-context" role="status">{t("assistant.context", { concept: contextLabel })}</p>}
      {!configured && <div className="assistant-notice" role="status">{t("assistant.notConfigured")}</div>}
      {configured && !answer && !loading && <div className="assistant-examples"><span>{t("assistant.try")}</span>{exampleKeys.map((key) => <button key={key} type="button" onClick={() => { const example = t(key); setQuestion(example); void ask(example); }}>{t(key)}<ArrowRight size={14} /></button>)}</div>}
      {loading && <p className="assistant-loading" role="status">{t("assistant.thinking")}</p>}
      {error && <p className="assistant-error" role="alert">{error}</p>}
      {answer && <div className="assistant-response" aria-live="polite"><span className="eyebrow">{t("assistant.answer")}</span><div className="assistant-answer">{answer}</div>{sources.length > 0 && <div className="assistant-sources"><h2>{t("assistant.sources")}</h2><p>{t("assistant.sourcesHint")}</p><ul>{sources.map((source, index) => <li key={`${source.type}:${source.id}`}><span>[{index + 1}]</span><Link href={source.href}>{source.title} <ArrowRight size={13} /></Link><small>{t(`assistant.type${source.type}`)}</small></li>)}</ul></div>}</div>}
      <form className="assistant-form" onSubmit={(event) => { event.preventDefault(); void ask(question); }}><label htmlFor="atlas-task">{t("assistant.mode")}</label><select id="atlas-task" value={task} onChange={(event) => setTask(event.target.value as AtlasAiTask)} disabled={!configured || loading}>{modes.map((mode) => <option key={mode.task} value={mode.task}>{t(mode.label)}</option>)}</select><label htmlFor="atlas-question">{t("assistant.question")}</label><div><textarea id="atlas-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={t("assistant.placeholder")} maxLength={2000} rows={3} disabled={!configured || loading} /><button className="button-primary" type="submit" disabled={!configured || loading || question.trim().length < 3}><Send size={16} />{t("assistant.ask")}</button></div></form>
    </section>
    <p className="assistant-privacy">{t("assistant.privacy")}</p>
  </>;
}

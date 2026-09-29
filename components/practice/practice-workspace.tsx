"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Code2, Play, RotateCcw, Sparkles, Square } from "lucide-react";
import { algorithmById, techniqueById, topicById } from "@/content";
import { useI18n } from "@/components/locale-provider";
import { useOptionalAtlas } from "@/components/atlas-provider";
import { conceptIdForAlgorithm } from "@/lib/domain/concepts";
import { localizeTopic } from "@/i18n/content";
import { storage } from "@/lib/storage";
import { BrowserPracticeRunner } from "@/lib/practice/runner";
import { practiceDraftKey, practiceLanguageById, practiceLanguages } from "@/lib/practice/languages";
import { PRACTICE_LIMITS, type JudgeResult, type PracticeLanguage, type PracticeProblem, type PracticeState } from "@/lib/practice/types";

export function PracticeWorkspace({ problem, aiConfigured }: { problem: PracticeProblem; aiConfigured: boolean }) {
  const { locale, t } = useI18n();
  const atlas = useOptionalAtlas();
  const [language, setLanguage] = useState<PracticeLanguage>("python");
  const [code, setCode] = useState(problem.starters.python);
  const [state, setState] = useState<PracticeState>({ schemaVersion: 2, preferredLanguage: "python", attempts: [], drafts: {} });
  const [ready, setReady] = useState(false); const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [saveFailed, setSaveFailed] = useState(false); const [recovered, setRecovered] = useState(false);
  const [versionChanged, setVersionChanged] = useState(false);
  const [reflection, setReflection] = useState(""); const [rubric, setRubric] = useState<number[]>([]);
  const [offline, setOffline] = useState(false); const [aiBusy, setAiBusy] = useState(false);
  const [aiAnswer, setAiAnswer] = useState(""); const [aiError, setAiError] = useState(false);
  const runner = useRef<BrowserPracticeRunner | null>(null);
  const abort = useRef<AbortController | null>(null);
  const aiAbort = useRef<AbortController | null>(null);
  const latestDraft = useRef({ language, draft: { version: problem.version, code, reflection, rubric } });
  useEffect(() => { latestDraft.current = { language, draft: { version: problem.version, code, reflection, rubric } }; }, [language, problem.version, code, reflection, rubric]);

  useEffect(() => {
    const loaded = storage.loadPractice();
    const preferred = loaded.state.preferredLanguage;
    const draft = loaded.state.drafts[practiceDraftKey(problem.id, preferred)];
    // Hydrate browser-only drafts after the server and initial client render agree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loaded.state); setRecovered(loaded.recovered); setLanguage(preferred);
    setCode(draft?.code ?? problem.starters[preferred]); setReflection(draft?.reflection ?? ""); setRubric(draft?.rubric ?? []);
    setVersionChanged(Boolean(draft && draft.version !== problem.version));
    setReady(true); runner.current = new BrowserPracticeRunner();
    const connection = () => setOffline(!navigator.onLine);
    connection(); window.addEventListener("online", connection); window.addEventListener("offline", connection);
    return () => { abort.current?.abort(); aiAbort.current?.abort(); window.removeEventListener("online", connection); window.removeEventListener("offline", connection); };
  }, [problem.id, problem.version, problem.starters]);

  useEffect(() => {
    if (!ready) return;
    const persist = () => {
      const current = storage.loadPractice().state;
      const saved = storage.savePractice({ ...current, preferredLanguage: language, drafts: { ...current.drafts, [practiceDraftKey(problem.id, language)]: latestDraft.current.draft } });
      setSaveFailed(!saved);
    };
    const timer = window.setTimeout(persist, 400);
    window.addEventListener("pagehide", persist);
    return () => { window.clearTimeout(timer); window.removeEventListener("pagehide", persist); };
  }, [code, reflection, rubric, ready, problem.id, language]);

  useEffect(() => {
    if (!ready) return;
    return () => { const current = storage.loadPractice().state; const latest = latestDraft.current; storage.savePractice({ ...current, preferredLanguage: latest.language, drafts: { ...current.drafts, [practiceDraftKey(problem.id, latest.language)]: latest.draft } }); };
  }, [ready, problem.id]);

  const changeCode = (next: string) => { setCode(next); setResult(null); setAiAnswer(""); };
  const selectLanguage = (next: PracticeLanguage) => {
    if (next === language || busy) return;
    const current = storage.loadPractice().state;
    const updated: PracticeState = { ...current, preferredLanguage: next, drafts: { ...current.drafts, [practiceDraftKey(problem.id, language)]: latestDraft.current.draft } };
    storage.savePractice(updated); setState(updated); setLanguage(next);
    const nextDraft = updated.drafts[practiceDraftKey(problem.id, next)];
    setCode(nextDraft?.code ?? problem.starters[next]); setReflection(nextDraft?.reflection ?? ""); setRubric(nextDraft?.rubric ?? []);
    setVersionChanged(Boolean(nextDraft && nextDraft.version !== problem.version)); setResult(null); setAiAnswer("");
  };
  const run = async () => {
    if (!runner.current || busy || language !== "javascript") return;
    setBusy(true); setAiAnswer(""); setResult(null); abort.current = new AbortController();
    try {
      const outcome = await runner.current.run(problem, code, abort.current.signal);
      if (abort.current.signal.aborted) { setResult(outcome); return; }
      setResult(outcome);
      for (const algorithmId of problem.algorithmIds) {
        atlas?.recordLearningEvent({ type: "problem-public-run", conceptId: conceptIdForAlgorithm(algorithmId), source: "browser-public", sourceVersion: problem.version });
      }
      const current = storage.loadPractice().state;
      const next: PracticeState = { ...current, preferredLanguage: language, drafts: { ...current.drafts, [practiceDraftKey(problem.id, language)]: latestDraft.current.draft }, attempts: [...current.attempts, { id: crypto.randomUUID(), problemId: problem.id, problemVersion: problem.version, language, code, createdAt: new Date().toISOString(), result: outcome }].slice(-PRACTICE_LIMITS.maxAttempts) };
      setState(next); setSaveFailed(!storage.savePractice(next));
    } catch { setResult({ verdict: "unavailable", tests: [], durationMs: 0, scope: "public" }); }
    finally { setBusy(false); }
  };
  const askHint = async () => {
    if (aiBusy) return; setAiBusy(true); setAiError(false); aiAbort.current = new AbortController();
    try {
      const response = await fetch("/api/practice/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, signal: aiAbort.current.signal, body: JSON.stringify({ problemId: problem.id, language, code, locale, verdict: result?.verdict ?? "not-run", failedTestIds: result?.tests.filter((test) => test.verdict !== "accepted").map((test) => test.testId) ?? [] }) });
      if (!response.ok) throw new Error("feedback"); const data = await response.json();
      setAiAnswer(typeof data.answer === "string" ? data.answer : "");
    } catch { if (!aiAbort.current.signal.aborted) setAiError(true); } finally { setAiBusy(false); }
  };
  const history = state.attempts.filter((attempt) => attempt.problemId === problem.id).toReversed();
  const verdictLabel = (verdict: JudgeResult["verdict"]) => verdict === "accepted" ? t("practice.publicAccepted") : t(`practice.${verdict}`);
  if (!ready) return <p className="panel" role="status">{t("practice.loading")}</p>;
  return <>
    <Link className="text-link" href="/practice"><ArrowLeft size={14} />{t("practice.back")}</Link>
    <header className="page-header practice-heading"><div><p className="kicker">{t("practice.mode")}</p><h1>{problem.title[locale]}</h1><p className="lede">{problem.summary[locale]}</p><div className="doc-meta"><span className="chip">{t(`practice.${problem.difficulty}`)}</span><span className="chip">{t("practice.version", { version: problem.version })}</span><span className="chip">{t("practice.tests", { count: problem.tests.length })}</span></div></div></header>
    {(recovered || versionChanged || offline) && <div className="practice-notice" role="status"><p>{recovered && t("practice.recovered")} {versionChanged && t("practice.versionChanged")} {offline && t("practice.offline")}</p></div>}
    <nav className="practice-jump" aria-label={t("common.onThisPage")}><a href="#practice-statement">{t("practice.statement")}</a><a href="#practice-editor-panel">{t("practice.editor")}</a>{result && <a href="#practice-result-panel">{t("practice.results")}</a>}</nav>
    <div className="practice-workspace">
      <div className="practice-reading stack" id="practice-statement">
        <section className="panel"><h2>{t("practice.statement")}</h2><p>{problem.statement[locale]}</p><h3>{t("practice.contract")}</h3><p className="practice-contract">{problem.contract[locale]}</p><h3>{t("practice.constraints")}</h3><ul>{problem.constraints.map((text, index) => <li key={index}>{text[locale]}</li>)}</ul></section>
        <section className="panel"><h2>{t("practice.examples")}</h2>{problem.tests.map((test, index) => <details className="practice-example" key={test.id} open={index === 0}><summary>{index + 1}. {test.label[locale]}</summary><small>{t("practice.input")}</small><pre>{JSON.stringify(test.input, null, 2)}</pre><small>{t("practice.expected")}</small><pre>{JSON.stringify(test.expected)}</pre><p>{test.explanation[locale]}</p></details>)}</section>
        <section className="panel"><h2>{t("practice.hints")}</h2>{problem.hints.map((hint, index) => <details className="practice-example" key={index}><summary>{t("practice.hint", { number: index + 1 })}</summary><p>{hint[locale]}</p></details>)}<details className="practice-example"><summary>{t("practice.complexity")}</summary><p>{problem.complexity[locale]}</p></details></section>
      </div>
      <div className="practice-coding stack">
        <section className="panel practice-editor-panel" id="practice-editor-panel">
          <div className="panel-header">
            <label htmlFor="practice-code"><Code2 size={17} /> {t("practice.editor")}</label>
            <label className="practice-language-field" htmlFor="practice-language"><span>{t("practice.language")}</span><select id="practice-language" value={language} disabled={busy} onChange={(event) => selectLanguage(event.target.value as PracticeLanguage)}>{practiceLanguages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          </div>
          <textarea id="practice-code" className="practice-editor" value={code} disabled={busy} onChange={(event) => changeCode(event.target.value)} onKeyDown={(event) => { if (language === "javascript" && (event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); void run(); } }} maxLength={PRACTICE_LIMITS.codeCharacters} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-describedby="practice-editor-help practice-runtime-help" />
          <p id="practice-editor-help" className="practice-help">{language === "python" ? t("practice.pythonEditorHelp") : t("practice.editorHelp")}</p>
          <p id="practice-runtime-help" className={language === "python" ? "practice-runtime-note" : "practice-help"}>{language === "python" ? t("practice.pythonUnavailable") : t("practice.javascriptRuntime")}</p>
          <div className="practice-run-actions"><button className="button-primary" disabled={busy || !code.trim() || language !== "javascript"} onClick={() => void run()} title={language === "python" ? t("practice.pythonUnavailable") : undefined}><Play size={16} />{busy ? t("practice.running") : t("practice.run")}</button>{busy && <button className="button-secondary" onClick={() => abort.current?.abort()}><Square size={14} />{t("practice.cancel")}</button>}<button className="button-secondary" disabled aria-describedby="practice-judge-boundary">{t("practice.submit")}</button><button className="button-secondary" disabled={busy} onClick={() => { if (window.confirm(t("practice.resetConfirm"))) changeCode(problem.starters[language]); }}><RotateCcw size={14} />{t("practice.reset")}</button></div>
          <p className="practice-help" aria-live="polite">{saveFailed ? t("practice.saveFailed") : t("practice.saved")}</p>{language === "javascript" && <p className="practice-help">{t("practice.limits")}</p>}<p id="practice-judge-boundary" className="practice-help">{t("practice.boundary")}</p>
        </section>
        {result && <section className="panel practice-results" id="practice-result-panel" aria-live="polite"><div className="panel-header"><h2>{t("practice.results")}</h2><strong className={`practice-verdict ${result.verdict}`}>{verdictLabel(result.verdict)}</strong></div><p>{t("practice.runCount", { passed: result.tests.filter((test) => test.verdict === "accepted").length, total: problem.tests.length, ms: result.durationMs })}</p>{result.verdict === "runtime-error" && <p>{t("practice.runtimeHelp")}</p>}{result.verdict === "unavailable" && <p>{t("practice.unavailableHelp")}</p>}{problem.tests.map((test) => { const actual = result.tests.find((entry) => entry.testId === test.id); return <details className="practice-example" key={test.id} open={actual?.verdict === "wrong-answer"}><summary>{test.label[locale]} <span>{actual ? t(`practice.${actual.verdict}`) : t("practice.notRun")}</span></summary><small>{t("practice.expected")}</small><pre>{JSON.stringify(test.expected)}</pre><small>{t("practice.actual")}</small><pre>{actual?.actual === undefined ? "—" : JSON.stringify(actual.actual)}</pre><p>{test.explanation[locale]}</p></details>; })}</section>}
        {result?.verdict === "unavailable" && result.diagnostic && <p className="form-error" role="alert">{result.diagnostic}</p>}
        <section className="panel"><h2>{t("practice.review")}</h2><div className="practice-knowledge">{problem.topicIds.map((id) => { const topic = topicById.get(id); return topic ? <Link className="text-link" key={id} href={`/topics/${topic.slug}`}>{localizeTopic(topic, locale).title}</Link> : null; })}{problem.algorithmIds.map((id) => { const item = algorithmById.get(id); return item ? <Link className="text-link" key={`a:${id}`} href={`/algorithms/${item.slug}`}>{item.name}</Link> : null; })}{problem.techniqueIds.map((id) => { const item = techniqueById.get(id); return item ? <Link className="text-link" key={`t:${id}`} href={`/techniques/${item.slug}`}>{item.name}</Link> : null; })}</div></section>
        {problem.rubric && <section className="panel practice-rubric"><h2>{t("practice.rubric")}</h2><p>{t("practice.rubricHelp")}</p>{problem.rubric.map((text, index) => <label key={index}><input type="checkbox" checked={rubric.includes(index)} onChange={(e) => setRubric(e.target.checked ? [...rubric, index] : rubric.filter((n) => n !== index))} /><span>{text[locale]}</span></label>)}<label className="form-field"><span>{t("practice.reflection")}</span><textarea rows={6} maxLength={5_000} value={reflection} onChange={(e) => setReflection(e.target.value)} /></label></section>}
        {aiConfigured && <section className="panel"><h2>{t("practice.aiLabel")}</h2><p className="practice-help">{t("practice.aiConsent")}</p><button className="button-secondary" disabled={aiBusy || busy || offline} onClick={() => void askHint()}><Sparkles size={15} />{aiBusy ? t("practice.aiBusy") : t("practice.ai")}</button>{aiError && <p role="alert">{t("practice.aiError")}</p>}{aiAnswer && <p className="practice-ai-answer">{aiAnswer}</p>}</section>}
        <section className="panel"><h2>{t("practice.history")}</h2>{history.length ? history.map((attempt) => <details className="practice-example" key={attempt.id}><summary><span>{verdictLabel(attempt.result.verdict)}</span><small>{practiceLanguageById.get(attempt.language)?.label} · {new Date(attempt.createdAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")} · v{attempt.problemVersion}</small></summary><pre>{attempt.code}</pre><button className="button-secondary" disabled={busy} onClick={() => { if (window.confirm(t("practice.restoreConfirm"))) { selectLanguage(attempt.language); changeCode(attempt.code); } }}>{t("practice.restore")}</button></details>) : <p>{t("practice.historyEmpty")}</p>}</section>
      </div>
    </div>
  </>;
}

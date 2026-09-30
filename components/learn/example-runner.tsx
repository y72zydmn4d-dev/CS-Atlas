"use client";

import Link from "next/link";
import { Copy, ExternalLink, Play, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import type { LearnExample } from "@/lib/domain/learn-platform";
import { BrowserPracticeRunner } from "@/lib/practice/runner";
import type { JudgeResult, PracticeProblem } from "@/lib/practice/types";
import { useI18n } from "@/components/locale-provider";

function expectedValue(output?: string) {
  if (output === undefined) return null;
  try { return JSON.parse(output) as null | boolean | number | string | Array<null | boolean | number | string>; }
  catch { return output; }
}

export function ExampleRunner({ example }: { example: LearnExample }) {
  const { locale } = useI18n();
  const [source, setSource] = useState(example.starterSource);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const runner = useRef<BrowserPracticeRunner | null>(null);
  const canRun = example.runtime === "browser-quickjs" && example.language === "javascript";

  async function run() {
    if (!canRun || busy) return;
    runner.current ??= new BrowserPracticeRunner();
    const problem: PracticeProblem = {
      id: `learn-example:${example.id}`,
      version: 1,
      kind: "dsa",
      title: example.title,
      summary: example.description,
      difficulty: example.difficulty === "hard" ? "medium" : example.difficulty,
      domainId: "data-structures-algorithms",
      topicIds: [], algorithmIds: [], techniqueIds: [],
      statement: example.description,
      contract: { en: "Export a solve(input) function.", vi: "Export a solve(input) function." },
      constraints: [{ en: "This run uses one visible authored example.", vi: "Lần chạy này sử dụng một ví dụ công khai." }],
      starters: { javascript: example.starterSource, python: example.starterSource },
      tests: [{ id: "example", label: example.title, input: example.input ?? null, expected: expectedValue(example.expectedOutput), explanation: example.description }],
      hints: [example.description, { en: "Preserve the solve(input) contract.", vi: "Giữ nguyên hợp đồng solve(input)." }, { en: "Reset to compare with the authored version.", vi: "Đặt lại để so sánh với phiên bản gốc." }],
      complexity: { en: "This example run reports behavior, not a hidden-test verdict.", vi: "Lần chạy ví dụ không phải là kết quả kiểm thử ẩn." },
      comparator: "exact",
    };
    setBusy(true); setResult(null);
    try { setResult(await runner.current.run(problem, source)); }
    catch { setResult({ verdict: "unavailable", tests: [], durationMs: 0, scope: "public" }); }
    finally { setBusy(false); }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(source); setCopied(true); window.setTimeout(() => setCopied(false), 1200); }
    catch { setCopied(false); }
  }

  const actual = result?.tests[0]?.actual;
  return <section className="learn-example" aria-labelledby={`${example.id}-title`}>
    <header><div><p>EXAMPLE · {example.language}</p><h3 id={`${example.id}-title`}>{example.title[locale]}</h3><span>{example.description[locale]}</span></div><span className={`learn-runtime runtime-${example.runtime}`}>{canRun ? "Browser QuickJS" : "Runtime unavailable"}</span></header>
    <label className="sr-only" htmlFor={`${example.id}-source`}>Example source</label><textarea id={`${example.id}-source`} className="learn-example-editor" value={source} onChange={(event) => { setSource(event.target.value); setResult(null); }} spellCheck={false} autoCapitalize="off" autoCorrect="off" maxLength={20_000} />
    <div className="learn-example-actions"><button className="button-primary" type="button" disabled={!canRun || busy || !source.trim()} onClick={() => void run()}><Play size={15} />{busy ? "Running…" : "Run"}</button><button className="button-secondary" type="button" onClick={() => { setSource(example.starterSource); setResult(null); }}><RotateCcw size={14} />Reset</button><button className="button-secondary" type="button" onClick={() => void copy()}><Copy size={14} />{copied ? "Copied" : "Copy"}</button><Link className="button-secondary" href="/practice"><ExternalLink size={14} />Open Playground</Link></div>
    {!canRun && <p className="learn-runtime-note" role="note">{locale === "vi" ? "Ví dụ vẫn có thể chỉnh sửa và sao chép. CS-Atlas chưa có runtime an toàn cho ngôn ngữ này." : "The example remains editable and copyable. CS-Atlas does not yet have an approved runtime for this language."}</p>}
    <div className="learn-example-output" aria-live="polite"><strong>{result ? result.verdict === "accepted" ? "Output" : "Result" : "Expected output"}</strong><pre>{result ? actual === undefined ? result.verdict : JSON.stringify(actual) : example.expectedOutput ?? "—"}</pre>{result && <small>{result.durationMs} ms · visible example only</small>}</div>
  </section>;
}

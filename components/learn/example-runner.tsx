"use client";

import { Copy, ExternalLink, Play, RotateCcw } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { LearnExample } from "@/lib/domain/learn-platform";
import type { BrowserPracticeRunner } from "@/lib/practice/runner";
import type { JudgeResult, PracticeProblem } from "@/lib/practice/types";
import { LessonLink, useLearnRenderEnvironment } from "@/components/learn/learn-render-environment";
import { lessonText } from "@/lib/domain/learn-rendering";

function expectedValue(output?: string) {
  if (output === undefined) return null;
  try { return JSON.parse(output) as null | boolean | number | string | Array<null | boolean | number | string>; }
  catch { return output; }
}

export function ExampleRunner({ example }: { example: LearnExample }) {
  const { locale, mode } = useLearnRenderEnvironment();
  const instanceId = useId();
  const titleId = `${example.id}-${instanceId}-title`;
  const sourceId = `${example.id}-${instanceId}-source`;
  const preview = mode === "author-preview";
  const [source, setSource] = useState(example.starterSource);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const runner = useRef<BrowserPracticeRunner | null>(null);
  const canRun = !preview && example.runtime === "browser-quickjs" && example.language === "javascript";

  async function run() {
    if (!canRun || busy) return;
    setBusy(true); setResult(null);
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
    try {
      const { BrowserPracticeRunner } = await import("@/lib/practice/runner");
      runner.current ??= new BrowserPracticeRunner();
      setResult(await runner.current.run(problem, source));
    }
    catch { setResult({ verdict: "unavailable", tests: [], durationMs: 0, scope: "public" }); }
    finally { setBusy(false); }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(source); setCopied(true); window.setTimeout(() => setCopied(false), 1200); }
    catch { setCopied(false); }
  }

  const actual = result?.tests[0]?.actual;
  return <section className="learn-example" aria-labelledby={titleId}>
    <header><div><p>EXAMPLE · {example.language}</p><h3 id={titleId}>{lessonText(example.title, locale)}</h3><span>{lessonText(example.description, locale)}</span></div><span className={`learn-runtime runtime-${example.runtime}`}>{preview ? "Author preview · static" : canRun ? "Browser QuickJS" : "Runtime unavailable"}</span></header>
    <label className="sr-only" htmlFor={sourceId}>Example source</label><textarea id={sourceId} className="learn-example-editor" value={source} readOnly={preview} onChange={(event) => { setSource(event.target.value); setResult(null); }} spellCheck={false} autoCapitalize="off" autoCorrect="off" maxLength={20_000} />
    <div className="learn-example-actions"><button className="button-primary" type="button" disabled={!canRun || busy || !source.trim()} onClick={() => void run()}><Play size={15} />{busy ? "Running…" : "Run"}</button><button className="button-secondary" type="button" disabled={preview} onClick={() => { setSource(example.starterSource); setResult(null); }}><RotateCcw size={14} />Reset</button><button className="button-secondary" type="button" onClick={() => void copy()}><Copy size={14} />{copied ? "Copied" : "Copy"}</button><LessonLink className="button-secondary" href="/practice"><ExternalLink size={14} />Open Playground</LessonLink></div>
    {!canRun && <p className="learn-runtime-note" role="note">{preview ? locale === "vi" ? "Xem trước chỉ hiển thị mã và kết quả đã biên soạn; không chạy mã hay ghi tiến độ." : "Preview displays authored source and expected output only; no execution or learning evidence." : locale === "vi" ? "Ví dụ vẫn có thể chỉnh sửa và sao chép. CS-Atlas chưa có runtime an toàn cho ngôn ngữ này." : "The example remains editable and copyable. CS-Atlas does not yet have an approved runtime for this language."}</p>}
    <div className="learn-example-output" aria-live="polite"><strong>{result ? result.verdict === "accepted" ? "Output" : "Result" : "Expected output"}</strong><pre>{result ? actual === undefined ? result.verdict : JSON.stringify(actual) : example.expectedOutput ?? "—"}</pre>{result && <small>{result.durationMs} ms · visible example only</small>}</div>
  </section>;
}

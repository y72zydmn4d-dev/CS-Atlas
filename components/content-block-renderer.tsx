"use client";

import { AlertTriangle, BookOpen, CheckCircle2, Lightbulb, Quote, Sigma } from "lucide-react";
import type { Citation, ContentBlock, Topic } from "@/lib/types";
import { sourceById } from "@/content/sources";
import { CopyCodeBlock, ExercisePanel } from "@/components/interactive-content";
import { useI18n } from "@/components/locale-provider";

function Citations({ citations }: { citations?: Citation[] }) {
  const { t } = useI18n();
  if (!citations?.length) return null;
  return <footer className="block-citations" aria-label={t("common.sources")}>{citations.map((citation) => { const source = sourceById.get(citation.sourceId); if (!source) return null; const label = [source.title, citation.locator].filter(Boolean).join(" · "); return source.url ? <a key={`${citation.sourceId}-${citation.locator ?? "source"}`} href={source.url} target="_blank" rel="noreferrer"><BookOpen size={13} />{label}</a> : <span key={`${citation.sourceId}-${citation.locator ?? "source"}`}><BookOpen size={13} />{label}</span>; })}</footer>;
}

function Block({ block, topicId }: { block: ContentBlock; topicId: string }) {
  const { t } = useI18n();
  if (block.type === "exercise") return <ExercisePanel topicId={topicId} block={block} />;
  return <section className={`doc-section content-block block-${block.type}`} id={block.id}>
    <h2>{block.title}</h2>
    {block.type === "paragraph" && <><p>{block.body}</p>{block.bullets && <ul>{block.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}</>}
    {block.type === "learning-objectives" && <ul className="objective-list">{block.objectives.map((item) => <li key={item}><CheckCircle2 size={16} />{item}</li>)}</ul>}
    {block.type === "definition" && <div className="definition-box"><span className="definition-term">{block.term}</span>{block.notation && <code>{block.notation}</code>}<p>{block.definition}</p></div>}
    {block.type === "intuition" && <><p>{block.body}</p>{block.analogy && <blockquote><Quote size={17} />{block.analogy}</blockquote>}</>}
    {block.type === "key-idea" && <><p>{block.body}</p><ul>{block.points.map((point) => <li key={point}>{point}</li>)}</ul></>}
    {block.type === "theorem" && <div className="theorem-box"><strong>{t("common.statement")}</strong><p>{block.statement}</p><strong>{t("common.proofSketch")}</strong><p>{block.proofSketch}</p></div>}
    {block.type === "derivation" && <><p>{block.introduction}</p><ol className="derivation-steps">{block.steps.map((step, index) => <li key={`${block.id}-${index}`}><code>{step.expression}</code><p>{step.explanation}</p></li>)}</ol><p className="block-conclusion">{block.conclusion}</p></>}
    {block.type === "formula" && <div className="formula-box"><Sigma size={20} /><code>{block.expression}</code><p>{block.description}</p><dl>{block.terms.map((term) => <div key={term.symbol}><dt>{term.symbol}</dt><dd>{term.meaning}</dd></div>)}</dl></div>}
    {block.type === "worked-example" && <div className="worked-example"><p className="example-problem">{block.problem}</p><ol>{block.steps.map((step, index) => <li key={`${block.id}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.explanation}</p>{step.formula && <code className="example-formula">{step.formula}</code>}{step.code && <CopyCodeBlock code={step.code} language="python" />}</div></li>)}</ol><p className="block-conclusion">{block.conclusion}</p></div>}
    {block.type === "step-by-step" && <ol className="step-list">{block.steps.map((step, index) => <li key={`${block.id}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></li>)}</ol>}
    {block.type === "code" && <><CopyCodeBlock code={block.code} language={block.language} /><div className="code-explanation">{block.explanation.map((item) => <div key={item.lines}><code>{item.lines}</code><p>{item.body}</p></div>)}</div></>}
    {block.type === "complexity" && <><div className="complexity-grid"><div className="complexity-card"><span>{t("common.time")}</span><strong>{block.time}</strong></div><div className="complexity-card"><span>{t("common.space")}</span><strong>{block.space}</strong></div></div><p>{block.analysis}</p>{block.cases && <div className="case-list">{block.cases.map((item) => <div key={item.name}><strong>{item.name}</strong><code>{item.complexity}</code><span>{item.reason}</span></div>)}</div>}</>}
    {block.type === "comparison" && <div className="comparison-scroll"><table className="comparison-table"><thead><tr><th>{t("common.approach")}</th>{block.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{block.rows.map((row) => <tr key={row.label}><th>{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}-${index}`}>{value}</td>)}</tr>)}</tbody></table></div>}
    {block.type === "common-mistakes" && <div className="mistake-list">{block.mistakes.map((item) => <article key={item.mistake}><AlertTriangle size={17} /><div><h3>{item.mistake}</h3><p>{item.consequence}</p><span><strong>{t("common.correction")}</strong> {item.correction}</span></div></article>)}</div>}
    {block.type === "applications" && <div className="application-grid">{block.applications.map((item) => <article key={item.name}><h3>{item.name}</h3><p>{item.description}</p></article>)}</div>}
    {block.type === "callout" && <div className={`callout ${block.tone}`}>{block.tone === "warning" ? <AlertTriangle size={18} /> : <Lightbulb size={18} />}<p>{block.body}</p></div>}
    {block.type === "further-reading" && <><p>{block.body}</p><ul className="source-list">{block.sourceIds.map((id) => { const source = sourceById.get(id); return source ? <li key={id}>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : source.title}<span>{[source.authors?.join(", "), source.publisher, source.year].filter(Boolean).join(" · ")}</span></li> : null; })}</ul></>}
    <Citations citations={block.citations} />
  </section>;
}

export function ContentBlockRenderer({ topic }: { topic: Topic }) {
  return <>{topic.content.map((block) => <Block key={block.id} block={block} topicId={topic.id} />)}</>;
}

"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Info, Lightbulb } from "lucide-react";
import { CopyCodeBlock } from "@/components/copy-code-block";
import { LessonLink, useLearnRenderEnvironment } from "@/components/learn/learn-render-environment";
import { lessonText, type LessonRenderResources } from "@/lib/domain/learn-rendering";
import { ExampleRunner } from "@/components/learn/example-runner";
import type { LearnLessonBlock } from "@/lib/domain/learn-platform";

export function LessonBlockRenderer({ blocks, resources }: { blocks: LearnLessonBlock[]; resources: LessonRenderResources }) {
  const { locale } = useLearnRenderEnvironment();
  const learnExampleById = new Map(resources.examples.map((item) => [item.id, item]));
  const learnReferenceById = new Map(resources.references.map((item) => [item.id, item]));
  const learnLessonById = new Map(resources.lessons.map((item) => [item.id, item]));
  return <>{blocks.map((block) => {
    if (block.type === "example") {
      const example = learnExampleById.get(block.exampleId);
      return example ? <div id={block.id} key={block.id}><ExampleRunner example={example} /></div> : null;
    }
    if (block.type === "heading") return block.level === 2 ? <h2 id={block.id} key={block.id}>{lessonText(block.text, locale)}</h2> : <h3 id={block.id} key={block.id}>{lessonText(block.text, locale)}</h3>;
    if (block.type === "code" || block.type === "syntax") return <section className={`learn-block block-${block.type}`} id={block.id} key={block.id}>{block.title && <h2>{lessonText(block.title, locale)}</h2>}{block.type === "code" && block.caption && <p>{lessonText(block.caption, locale)}</p>}<CopyCodeBlock code={block.code} language={block.language} /></section>;
    if (block.type === "output") return <section className="learn-block block-output" id={block.id} key={block.id}><h2>{(block.title ? lessonText(block.title, locale) : undefined) ?? "Output"}</h2><pre>{block.output}</pre></section>;
    if (block.type === "callout") return <aside className={`learn-callout tone-${block.tone}`} id={block.id} key={block.id}>{block.tone === "warning" || block.tone === "common-mistake" ? <AlertTriangle size={17} /> : block.tone === "tip" ? <Lightbulb size={17} /> : <Info size={17} />}<div><strong>{(block.title ? lessonText(block.title, locale) : undefined) ?? block.tone.replace("-", " ").toLocaleUpperCase()}</strong><p>{lessonText(block.body, locale)}</p></div></aside>;
    if (block.type === "objectives") return <section className="learn-block learn-objectives" id={block.id} key={block.id}><h2>{(block.title ? lessonText(block.title, locale) : undefined) ?? (locale === "vi" ? "Mục tiêu học tập" : "Learning objectives")}</h2><ul>{block.items.map((item, index) => <li key={index}><CheckCircle2 size={15} />{lessonText(item, locale)}</li>)}</ul></section>;
    if (block.type === "paragraph") return <section className="learn-block" id={block.id} key={block.id}>{block.title && <h2>{lessonText(block.title, locale)}</h2>}<p>{lessonText(block.body, locale)}</p></section>;
    if (block.type === "definition") return <section className="learn-block learn-definition" id={block.id} key={block.id}><h2>{(block.title ? lessonText(block.title, locale) : undefined) ?? block.term}</h2><div><strong>{block.term}</strong><p>{lessonText(block.body, locale)}</p></div></section>;
    if (block.type === "list") {
      const Tag = block.ordered ? "ol" : "ul";
      return <section className="learn-block" id={block.id} key={block.id}>{block.title && <h2>{lessonText(block.title, locale)}</h2>}<Tag>{block.items.map((item, index) => <li key={index}>{lessonText(item, locale)}</li>)}</Tag></section>;
    }
    if (block.type === "table") return <section className="learn-block" id={block.id} key={block.id}>{block.title && <h2>{lessonText(block.title, locale)}</h2>}<div className="learn-table-scroll" tabIndex={0}><table><thead><tr>{block.columns.map((column, index) => <th key={index} scope="col">{lessonText(column, locale)}</th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}><code>{cell}</code></th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div></section>;
    if (block.type === "comparison") return <section className="learn-block" id={block.id} key={block.id}>{block.title && <h2>{lessonText(block.title, locale)}</h2>}<div className="learn-table-scroll" tabIndex={0}><table><thead><tr><th scope="col">Item</th>{block.columns.map((column, index) => <th key={index} scope="col">{lessonText(column, locale)}</th>)}</tr></thead><tbody>{block.rows.map((row) => <tr key={row.label.en}><th scope="row">{lessonText(row.label, locale)}</th>{row.values.map((value, index) => <td key={index}>{lessonText(value, locale)}</td>)}</tr>)}</tbody></table></div></section>;
    if (block.type === "complexity") return <section className="learn-block learn-complexity" id={block.id} key={block.id}><h2>{(block.title ? lessonText(block.title, locale) : undefined) ?? "Complexity"}</h2><div><span><small>TIME</small><strong>{block.time}</strong></span><span><small>SPACE</small><strong>{block.space}</strong></span></div><p>{lessonText(block.body, locale)}</p></section>;
    if (block.type === "exercise") return <section className="learn-block learn-inline-exercise" id={block.id} key={block.id}><p className="learn-section-label">CHECKPOINT</p><h2>{locale === "vi" ? "Luyện tập ngay" : "Practice now"}</h2><p>{locale === "vi" ? "Bài tập này sử dụng bản ghi Exercise chuẩn và hệ thống bằng chứng hiện có." : "This checkpoint uses the canonical Exercise record and existing evidence system."}</p><LessonLink className="button-primary" href={`/exercises/${block.exerciseId}`}>Open exercise <ArrowRight size={15} /></LessonLink></section>;
    if (block.type === "references") return <section className="learn-block" id={block.id} key={block.id}><h2>{locale === "vi" ? "Tài liệu tham khảo" : "Reference links"}</h2><div className="learn-reference-links">{block.referenceIds.map((id) => { const item = learnReferenceById.get(id); return item ? <LessonLink key={id} href={`/learn/${item.subjectId}/reference/${item.slug}`}><code>{item.signature ?? item.name}</code><span>{lessonText(item.description, locale)}</span><ArrowRight size={14} /></LessonLink> : null; })}</div></section>;
    if (block.type === "related") return <section className="learn-block" id={block.id} key={block.id}><h2>{locale === "vi" ? "Học tiếp và luyện tập" : "Continue and practice"}</h2><div className="learn-related-links">{block.lessonIds.map((id) => { const item = learnLessonById.get(id); return item ? <LessonLink key={id} href={`/learn/${item.subjectId}/${item.slug}`}>Lesson · {lessonText(item.title, locale)}<ArrowRight size={14} /></LessonLink> : null; })}{block.problemIds.map((id) => <LessonLink key={id} href={`/problems/${id}`}>Problem · {id.replaceAll("-", " ")}<ArrowRight size={14} /></LessonLink>)}</div></section>;
    return null;
  })}</>;
}

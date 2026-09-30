"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAtlas } from "@/components/atlas-provider";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useI18n } from "@/components/locale-provider";
import { ExampleRunner } from "@/components/learn/example-runner";
import { learnExamples, learnQuizQuestionById, learnReferenceById } from "@/content/learn/lesson-content";
import { learnLessonById } from "@/content/learn/registry";
import { exerciseById } from "@/content/exercises";
import type { SubjectManifest } from "@/lib/domain/learn-platform";

export type LearnSurface = "exercises" | "examples" | "quiz" | "reference";

export function SubjectSurface({ subject, surface }: { subject: SubjectManifest; surface: LearnSurface }) {
  const { locale } = useI18n();
  const [query, setQuery] = useState("");
  const title = surface[0].toLocaleUpperCase() + surface.slice(1);
  return <div className="page learn-surface-page"><Breadcrumbs items={[{ label: "Learn", href: "/learn" }, { label: subject.title[locale], href: `/learn/${subject.slug}` }, { label: title }]} /><header className="page-header"><div><p className="kicker">{subject.title[locale]} · {surface}</p><h1>{subject.title[locale]} {title}</h1><p className="lede">{surface === "reference" ? "Compact lookup records are separate from the teaching sequence." : surface === "exercises" ? "Practice is grouped by curriculum chapter and resolves to canonical Atlas Exercise records." : surface === "quiz" ? "Original section checks feed the existing local learning evidence system." : "Reusable authored examples connect back to lessons and canonical Concepts."}</p></div><Link className="button-secondary" href={`/learn/${subject.slug}`}>Subject home</Link></header><label className="learn-surface-search"><Search size={16} /><span className="sr-only">Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${surface}...`} /></label>{surface === "exercises" && <ExerciseSurface subject={subject} query={query} />}{surface === "examples" && <ExampleSurface subject={subject} query={query} />}{surface === "quiz" && <QuizSurface subject={subject} />}{surface === "reference" && <ReferenceSurface subject={subject} query={query} />}</div>;
}

function ExerciseSurface({ subject, query }: { subject: SubjectManifest; query: string }) {
  const { locale } = useI18n();
  const atlas = useAtlas();
  const groups = subject.exerciseGroups.map((group) => ({ ...group, exercises: group.exerciseIds.map((id) => exerciseById.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item)).filter((item) => !query.trim() || `${item.title[locale]} ${item.prompt[locale]}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())) })).filter((group) => group.exercises.length);
  if (!groups.length) return <EmptySurface text="No subject-specific Exercise records are published yet. The curriculum remains visible, but Atlas does not present empty practice as complete." />;
  return <div className="learn-surface-groups">{groups.map((group) => <section key={group.id}><header><h2>{group.title[locale]}</h2><span>{group.exercises.filter((exercise) => atlas.exercises[exercise.id.replace("exercise:", "")] === "solved").length} / {group.exercises.length}</span></header><div className="learn-surface-list">{group.exercises.map((exercise) => <Link key={exercise.id} href={`/exercises/${exercise.id}`}><span>{atlas.exercises[exercise.id.replace("exercise:", "")] === "solved" ? <CheckCircle2 size={15} /> : exercise.difficulty}</span><div><strong>{exercise.title[locale]}</strong><small>{exercise.mode} · {exercise.estimatedMinutes} min</small></div><ArrowRight size={15} /></Link>)}</div></section>)}</div>;
}

function ExampleSurface({ subject, query }: { subject: SubjectManifest; query: string }) {
  const { locale } = useI18n();
  const examples = useMemo(() => learnExamples.filter((example) => example.subjectId === subject.id && (!query.trim() || `${example.title[locale]} ${example.description[locale]} ${example.language}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))), [locale, query, subject.id]);
  return examples.length ? <div className="learn-example-directory">{examples.map((example) => <ExampleRunner key={example.id} example={example} />)}</div> : <EmptySurface text="No matching authored examples are available for this subject." />;
}

function QuizSurface({ subject }: { subject: SubjectManifest }) {
  const { locale } = useI18n();
  const atlas = useAtlas();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Set<string>>(new Set());
  if (!subject.quizGroups.length) return <EmptySurface text="No reviewed quiz group is published for this subject yet." />;
  return <div className="learn-quiz-groups">{subject.quizGroups.map((group) => {
    const questions = group.questionIds.map((id) => learnQuizQuestionById.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
    const submitted = checked.has(group.id);
    const correct = questions.filter((question) => answers[question.id] === question.correctOptionId).length;
    const alreadyCompleted = atlas.learningEvents.some((event) => event.type === "quiz-completed" && event.target?.type === "quiz" && event.target.id === group.id);
    return <section key={group.id}><header><div><p className="learn-section-label">QUIZ</p><h2>{group.title[locale]}</h2></div><span>{submitted ? `${correct}/${questions.length}` : `${questions.length} questions`}</span></header>{questions.map((question, index) => <fieldset key={question.id}><legend>{index + 1}. {question.prompt[locale]}</legend>{question.options.map((option) => <label key={option.id}><input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} disabled={submitted} /><span>{option.text[locale]}</span></label>)}{submitted && <p className={answers[question.id] === question.correctOptionId ? "quiz-correct" : "quiz-incorrect"}>{question.explanation[locale]}</p>}</fieldset>)}<button className="button-primary" type="button" disabled={submitted || questions.some((question) => !answers[question.id])} onClick={() => { setChecked((current) => new Set(current).add(group.id)); if (correct === questions.length && !alreadyCompleted) atlas.recordLearningEvent({ type: "quiz-completed", conceptId: questions[0].conceptId, source: "browser-local", sourceVersion: 1, target: { type: "quiz", id: group.id } }); }}>Check answers</button>{submitted && correct < questions.length && <button className="button-secondary" type="button" onClick={() => setChecked((current) => { const next = new Set(current); next.delete(group.id); return next; })}>Try again</button>}</section>;
  })}</div>;
}

function ReferenceSurface({ subject, query }: { subject: SubjectManifest; query: string }) {
  const { locale } = useI18n();
  const normalized = query.trim().toLocaleLowerCase();
  const categories = subject.references.map((category) => ({ ...category, records: category.referenceIds.map((id) => learnReferenceById.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item)).filter((item) => !normalized || `${item.name} ${item.signature ?? ""} ${item.description[locale]}`.toLocaleLowerCase().includes(normalized)) })).filter((category) => category.records.length);
  if (!categories.length) return <EmptySurface text="No matching structured reference entries are published for this subject." />;
  return <div className="learn-reference-categories">{categories.map((category) => <section key={category.id} id={category.id}><h2>{category.title[locale]}</h2><div className="learn-table-scroll" tabIndex={0}><table><thead><tr><th scope="col">Name</th><th scope="col">Signature</th><th scope="col">Description</th><th scope="col">Lesson</th></tr></thead><tbody>{category.records.map((record) => { const lesson = learnLessonById.get(record.relatedLessonIds[0]); return <tr key={record.id}><th scope="row"><Link href={`/learn/${subject.slug}/reference/${record.slug}`}>{record.name}</Link></th><td><code>{record.signature ?? "—"}</code></td><td>{record.description[locale]}</td><td>{lesson ? <Link href={`/learn/${lesson.subjectId}/${lesson.slug}`}>{lesson.title[locale]}</Link> : "—"}</td></tr>; })}</tbody></table></div></section>)}</div>;
}

function EmptySurface({ text }: { text: string }) { return <p className="empty-state learn-surface-empty">{text}</p>; }

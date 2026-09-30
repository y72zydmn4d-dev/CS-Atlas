import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BookmarkButton } from "@/components/content-actions";
import { learnReferenceByRoute } from "@/content/learn/lesson-content";
import { learnLessonById, learnSubjectBySlug, learnSubjects } from "@/content/learn/registry";

export function generateStaticParams() {
  return learnSubjects.flatMap((subject) => subject.references.flatMap((category) => category.referenceIds.map((id) => {
    const record = [...learnReferenceByRoute.values()].find((item) => item.id === id);
    return record ? { subject: subject.slug, reference: record.slug } : null;
  }).filter((item): item is { subject: string; reference: string } => Boolean(item))));
}

export async function generateMetadata({ params }: { params: Promise<{ subject: string; reference: string }> }) {
  const { subject, reference } = await params;
  const record = learnReferenceByRoute.get(`${subject}/${reference}`);
  return { title: record ? `${record.name} Reference` : "Reference", description: record?.description.en };
}

export default async function LearnReferencePage({ params }: { params: Promise<{ subject: string; reference: string }> }) {
  const { subject: subjectSlug, reference } = await params;
  const subject = learnSubjectBySlug.get(subjectSlug);
  const record = learnReferenceByRoute.get(`${subjectSlug}/${reference}`);
  if (!subject || !record) notFound();
  const relatedLessons = record.relatedLessonIds.map((id) => learnLessonById.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return <div className="page narrow learn-reference-detail"><Breadcrumbs items={[{ label: "Learn", href: "/learn" }, { label: subject.title.en, href: `/learn/${subject.slug}` }, { label: "Reference", href: `/learn/${subject.slug}/reference` }, { label: record.name }]} /><header className="page-header"><div><p className="kicker">{subject.title.en} Reference</p><h1>{record.name}</h1><p className="lede">{record.description.en}</p>{record.signature && <code className="reference-signature">{record.signature}</code>}</div><BookmarkButton bookmark={{ id: record.id, type: "reference", title: record.name, href: `/learn/${subject.slug}/reference/${record.slug}`, context: `${subject.title.en} Reference` }} /></header><section className="doc-article"><h2>Purpose</h2><p>{record.description.en}</p><h2>Related lessons</h2><div className="learn-related-links">{relatedLessons.map((lesson) => <Link key={lesson.id} href={`/learn/${lesson.subjectId}/${lesson.slug}`}>{lesson.title.en}<ArrowRight size={14} /></Link>)}</div><h2>Canonical concepts</h2><div className="learn-related-links">{record.conceptIds.map((id) => <Link key={id} href={`/concepts/${id.replace(":", "-")}`}>{id.split(":")[1].replaceAll("-", " ")}<ArrowRight size={14} /></Link>)}</div></section></div>;
}

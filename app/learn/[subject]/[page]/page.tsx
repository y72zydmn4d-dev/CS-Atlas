import { notFound } from "next/navigation";
import { LessonWorkspace } from "@/components/learn/lesson-workspace";
import { SubjectHome } from "@/components/learn/subject-home";
import { SubjectSurface, type LearnSurface } from "@/components/learn/subject-surface";
import { learnContentByLessonId } from "@/content/learn/lesson-content";
import { learnLessonByRoute, learnSubjectBySlug, learnSubjects } from "@/content/learn/registry";
import { readLessonRenderResources } from "@/lib/learn/render-resources.server";
import { learnRepositoryRoot, readCanonicalSubjects, readCanonicalLessonBody } from "@/lib/learn/content-storage.server";

async function resolveLesson(subjectSlug: string, page: string) {
  if (process.env.NODE_ENV === "development") {
    const root = await learnRepositoryRoot();
    const subject = (await readCanonicalSubjects(root)).find(s => s.slug === subjectSlug);
    const lesson = subject?.sections.flatMap(s => s.lessons).find(l => l.slug === page);
    return { subject, lesson, content: lesson ? await readCanonicalLessonBody(root, lesson) : null };
  }
  const subject = learnSubjectBySlug.get(subjectSlug);
  const lesson = learnLessonByRoute.get(`${subjectSlug}/${page}`);
  return { subject, lesson, content: lesson ? learnContentByLessonId.get(lesson.id) : null };
}

const surfaces = new Set<LearnSurface>(["exercises", "examples", "quiz", "reference"]);

export function generateStaticParams() {
  return learnSubjects.flatMap((subject) => [
    { subject: subject.slug, page: "tutorial" },
    ...[...surfaces].map((page) => ({ subject: subject.slug, page })),
    ...subject.sections.flatMap((section) => section.lessons.map((lesson) => ({ subject: subject.slug, page: lesson.slug }))),
  ]);
}

export async function generateMetadata({ params }: { params: Promise<{ subject: string; page: string }> }) {
  const { subject: subjectSlug, page } = await params;
  const { subject, lesson } = await resolveLesson(subjectSlug, page);
  if (lesson && subject) return { title: `${lesson.title.en} · ${subject.title.en}`, description: lesson.description.en };
  return { title: subject ? `${page[0]?.toLocaleUpperCase() ?? ""}${page.slice(1)} · ${subject.title.en}` : "Learn" };
}

export default async function LearnSubjectRoute({ params }: { params: Promise<{ subject: string; page: string }> }) {
  const { subject: subjectSlug, page } = await params;
  const { subject, lesson, content } = await resolveLesson(subjectSlug, page);
  if (!subject) notFound();
  if (page === "tutorial") return <SubjectHome subject={subject} />;
  if (surfaces.has(page as LearnSurface)) return <SubjectSurface subject={subject} surface={page as LearnSurface} />;
  if (!lesson) notFound();
  return <LessonWorkspace subject={subject} lesson={lesson} content={content ?? undefined} resources={readLessonRenderResources(content?.blocks ?? [])} />;
}

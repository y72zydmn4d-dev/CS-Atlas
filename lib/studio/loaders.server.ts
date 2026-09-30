import "server-only";
import type { LearnContentStatus, SubjectManifest } from "@/lib/domain/learn-platform";
import { requireStudioEnabled } from "@/lib/studio/guard.server";
import { readStudioLessonBody, readStudioManifests } from "@/lib/studio/content-reader.server";
import { isStudioLessonId, isStudioSubjectId } from "@/lib/studio/navigation";
import type { StudioCurriculum, StudioLessonInspection, StudioOverview, StudioStatusCounts, StudioSubjectSummary } from "@/lib/studio/types";

function countStatuses(items: ReadonlyArray<{ status: LearnContentStatus }>): StudioStatusCounts {
  const counts: StudioStatusCounts = { COMPLETE: 0, PARTIAL: 0, SKELETON: 0, PLANNED: 0 };
  for (const item of items) counts[item.status] += 1;
  return counts;
}

function summarizeSubject(subject: SubjectManifest): StudioSubjectSummary {
  const lessons = subject.sections.flatMap((section) => section.lessons);
  return {
    id: subject.id, slug: subject.slug, title: subject.title, description: subject.description,
    category: subject.category, status: subject.status, translationStatus: subject.translationStatus,
    navigationOrder: subject.navigationOrder, sectionCount: subject.sections.length,
    lessonCount: lessons.length, lessonStatuses: countStatuses(lessons),
  };
}

export async function getStudioOverview(): Promise<StudioOverview> {
  requireStudioEnabled();
  const subjects = await readStudioManifests();
  const lessons = subjects.flatMap((subject) => subject.sections.flatMap((section) => section.lessons));
  return {
    subjectCount: subjects.length, sectionCount: subjects.reduce((count, subject) => count + subject.sections.length, 0),
    lessonCount: lessons.length, lessonStatuses: countStatuses(lessons), subjectStatuses: countStatuses(subjects),
    declaredBodySourceCount: lessons.filter((lesson) => lesson.contentSource).length, validationScan: "not-scanned",
  };
}

export async function getStudioSubjects(): Promise<StudioSubjectSummary[]> {
  requireStudioEnabled();
  return (await readStudioManifests()).map(summarizeSubject);
}

export async function getStudioCurriculum(subjectId: string): Promise<StudioCurriculum | null> {
  requireStudioEnabled();
  if (!isStudioSubjectId(subjectId)) return null;
  const subject = (await readStudioManifests()).find((item) => item.id === subjectId);
  if (!subject) return null;
  return {
    subject: summarizeSubject(subject),
    sections: subject.sections.map((section) => ({
      id: section.id, title: section.title, order: section.order,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id, slug: lesson.slug, title: lesson.title, order: lesson.order, status: lesson.status,
        translationStatus: lesson.translationStatus, estimatedMinutes: lesson.estimatedMinutes,
      })),
    })),
  };
}

export async function getStudioLesson(subjectId: string, lessonId: string): Promise<StudioLessonInspection | null> {
  requireStudioEnabled();
  if (!isStudioSubjectId(subjectId) || !isStudioLessonId(lessonId)) return null;
  const subject = (await readStudioManifests()).find((item) => item.id === subjectId);
  const section = subject?.sections.find((item) => item.lessons.some((lesson) => lesson.id === lessonId));
  const lesson = section?.lessons.find((item) => item.id === lessonId);
  if (!subject || !section || !lesson || lesson.subjectId !== subjectId) return null;
  // Inspect even skeleton selections for unexpected bodies; absence is real, not inferred from status.
  const content = await readStudioLessonBody(lesson.id);
  return {
    lesson: structuredClone(lesson), section: { id: section.id, title: section.title, order: section.order },
    content: content ? structuredClone(content) : null, learnerHref: `/learn/${subject.slug}/${lesson.slug}`,
  };
}

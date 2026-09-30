import type { CurriculumSection, LearnContentStatus, LearnLessonContent, LessonManifest, SubjectManifest } from "@/lib/domain/learn-platform";

/** Read projections only; canonical records remain owned by content/learn. */
export type StudioStatusCounts = Record<LearnContentStatus, number>;
export type StudioSubjectSummary = Pick<SubjectManifest, "id" | "slug" | "title" | "description" | "category" | "status" | "translationStatus" | "navigationOrder"> & {
  sectionCount: number;
  lessonCount: number;
  lessonStatuses: StudioStatusCounts;
};
export interface StudioOverview {
  subjectCount: number;
  sectionCount: number;
  lessonCount: number;
  lessonStatuses: StudioStatusCounts;
  subjectStatuses: StudioStatusCounts;
  declaredBodySourceCount: number;
  validationScan: "not-scanned";
}
export type StudioLessonSummary = Pick<LessonManifest, "id" | "slug" | "title" | "order" | "status" | "translationStatus" | "estimatedMinutes">;
export interface StudioCurriculum {
  subject: StudioSubjectSummary;
  sections: Array<Pick<CurriculumSection, "id" | "title" | "order"> & { lessons: StudioLessonSummary[] }>;
}
export interface StudioLessonInspection {
  lesson: LessonManifest;
  section: Pick<CurriculumSection, "id" | "title" | "order">;
  content: LearnLessonContent | null;
  learnerHref: string;
}

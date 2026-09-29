import type { ConceptId, LocalizedConceptText } from "@/lib/domain/concepts";

export interface Lesson {
  id: string;
  slug: string;
  conceptIds: ConceptId[];
  topicId: string;
  title: LocalizedConceptText;
  summary: LocalizedConceptText;
  estimatedMinutes: number;
  contentVersion: number;
  href: string;
}

export interface CourseItem {
  id: string;
  lessonId: string;
  order: number;
}

export interface Course {
  id: string;
  slug: string;
  domainId: string;
  title: LocalizedConceptText;
  lessonIds: string[];
  items: CourseItem[];
}

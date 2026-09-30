import type { ConceptId, LocalizedConceptText } from "@/lib/domain/concepts";
import type { Difficulty, TranslationStatus } from "@/lib/types";

export const learnContentStatuses = ["PLANNED", "SKELETON", "PARTIAL", "COMPLETE"] as const;
export type LearnContentStatus = (typeof learnContentStatuses)[number];

export const subjectCategories = [
  "programming-languages",
  "web-development",
  "data-databases",
  "data-science",
  "ai-machine-learning",
  "computer-science",
  "developer-tools",
] as const;
export type SubjectCategory = (typeof subjectCategories)[number];

export type LearnRuntime = "none" | "browser-quickjs" | "remote-judge";
export type LearnJsonValue = null | boolean | number | string | LearnJsonValue[] | { [key: string]: LearnJsonValue };

export interface LessonManifest {
  id: string;
  subjectId: string;
  sectionId: string;
  slug: string;
  title: LocalizedConceptText;
  description: LocalizedConceptText;
  order: number;
  conceptIds: ConceptId[];
  prerequisiteLessonIds: string[];
  estimatedMinutes: number;
  difficulty: Difficulty;
  status: LearnContentStatus;
  translationStatus: TranslationStatus;
  contentSource?: string;
  exerciseIds: string[];
  problemIds: string[];
}

export interface CurriculumSection {
  id: string;
  subjectId: string;
  title: LocalizedConceptText;
  order: number;
  lessons: LessonManifest[];
}

export interface ReferenceCategoryManifest {
  id: string;
  title: LocalizedConceptText;
  order: number;
  referenceIds: string[];
}

export interface ExerciseGroupManifest {
  id: string;
  title: LocalizedConceptText;
  lessonIds: string[];
  exerciseIds: string[];
}

export interface QuizGroupManifest {
  id: string;
  title: LocalizedConceptText;
  lessonIds: string[];
  questionIds: string[];
}

export interface SubjectManifest {
  id: string;
  slug: string;
  navigationOrder: number;
  title: LocalizedConceptText;
  description: LocalizedConceptText;
  category: SubjectCategory;
  icon: string;
  status: LearnContentStatus;
  translationStatus: TranslationStatus;
  conceptIds: ConceptId[];
  sections: CurriculumSection[];
  references: ReferenceCategoryManifest[];
  exerciseGroups: ExerciseGroupManifest[];
  quizGroups: QuizGroupManifest[];
  relatedRoadmapIds: string[];
  relatedProblemIds: string[];
}

interface BaseLearnBlock {
  id: string;
  type: string;
  title?: LocalizedConceptText;
}

export type LearnLessonBlock =
  | (BaseLearnBlock & { type: "paragraph"; body: LocalizedConceptText })
  | (BaseLearnBlock & { type: "objectives"; items: LocalizedConceptText[] })
  | (BaseLearnBlock & { type: "heading"; level: 2 | 3; text: LocalizedConceptText })
  | (BaseLearnBlock & { type: "list"; ordered?: boolean; items: LocalizedConceptText[] })
  | (BaseLearnBlock & { type: "definition"; term: string; body: LocalizedConceptText })
  | (BaseLearnBlock & { type: "syntax"; language: string; code: string })
  | (BaseLearnBlock & { type: "code"; language: string; code: string; caption?: LocalizedConceptText })
  | (BaseLearnBlock & { type: "example"; exampleId: string })
  | (BaseLearnBlock & { type: "output"; output: string })
  | (BaseLearnBlock & { type: "callout"; tone: "note" | "tip" | "important" | "warning" | "common-mistake"; body: LocalizedConceptText })
  | (BaseLearnBlock & { type: "table"; columns: LocalizedConceptText[]; rows: string[][] })
  | (BaseLearnBlock & { type: "comparison"; columns: LocalizedConceptText[]; rows: Array<{ label: LocalizedConceptText; values: LocalizedConceptText[] }> })
  | (BaseLearnBlock & { type: "complexity"; time: string; space: string; body: LocalizedConceptText })
  | (BaseLearnBlock & { type: "exercise"; exerciseId: string })
  | (BaseLearnBlock & { type: "references"; referenceIds: string[] })
  | (BaseLearnBlock & { type: "related"; lessonIds: string[]; problemIds: string[] });

export interface LearnLessonContent {
  lessonId: string;
  version: number;
  reviewedAt: string;
  summary: LocalizedConceptText;
  blocks: LearnLessonBlock[];
}

export interface LearnExample {
  id: string;
  subjectId: string;
  lessonId: string;
  title: LocalizedConceptText;
  description: LocalizedConceptText;
  language: string;
  starterSource: string;
  runtime: LearnRuntime;
  expectedOutput?: string;
  input?: LearnJsonValue;
  conceptIds: ConceptId[];
  difficulty: "easy" | "medium" | "hard";
}

export interface LearnReference {
  id: string;
  subjectId: string;
  categoryId: string;
  slug: string;
  name: string;
  signature?: string;
  description: LocalizedConceptText;
  relatedLessonIds: string[];
  conceptIds: ConceptId[];
}

export interface LearnQuizQuestion {
  id: string;
  prompt: LocalizedConceptText;
  options: Array<{ id: string; text: LocalizedConceptText }>;
  correctOptionId: string;
  explanation: LocalizedConceptText;
  conceptId: ConceptId;
}

export interface LearnRouteAlias {
  legacyPath: string;
  destination: string;
  lessonId: string;
}

export function flattenSubjectLessons(subject: SubjectManifest) {
  return subject.sections.flatMap((section) => section.lessons);
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateLearnPlatform(input: {
  subjects: SubjectManifest[];
  lessonContent: LearnLessonContent[];
  examples: LearnExample[];
  references: LearnReference[];
  quizQuestions: LearnQuizQuestion[];
  aliases: LearnRouteAlias[];
  conceptIds: Set<string>;
  exerciseIds: Set<string>;
  problemIds: Set<string>;
}) {
  const issues: string[] = [];
  const unique = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) issues.push(`${label} contains duplicate ID ${id}`);
      else seen.add(id);
    }
  };
  const lessons = input.subjects.flatMap(flattenSubjectLessons);
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const exampleIds = new Set(input.examples.map((item) => item.id));
  const referenceIds = new Set(input.references.map((item) => item.id));
  const questionIds = new Set(input.quizQuestions.map((item) => item.id));
  unique("subjects", input.subjects.map((item) => item.id));
  unique("subject slugs", input.subjects.map((item) => item.slug));
  unique("lessons", lessons.map((item) => item.id));
  unique("lesson routes", lessons.map((item) => `${item.subjectId}/${item.slug}`));
  unique("lesson content", input.lessonContent.map((item) => item.lessonId));
  unique("examples", [...exampleIds]);
  unique("references", [...referenceIds]);
  unique("quiz questions", [...questionIds]);
  unique("legacy aliases", input.aliases.map((item) => item.legacyPath));

  for (const subject of input.subjects) {
    if (!slugPattern.test(subject.slug)) issues.push(`${subject.id} has invalid slug ${subject.slug}`);
    if (!Number.isInteger(subject.navigationOrder) || subject.navigationOrder < 1) issues.push(`${subject.id} has invalid navigation order`);
    if (!subject.conceptIds.length || subject.conceptIds.some((id) => !input.conceptIds.has(id))) issues.push(`${subject.id} has invalid Concept IDs`);
    unique(`${subject.id} section order`, subject.sections.map((section) => String(section.order)));
    for (const section of subject.sections) {
      if (section.subjectId !== subject.id) issues.push(`${section.id} has mismatched subject ID`);
      unique(`${section.id} lesson order`, section.lessons.map((lesson) => String(lesson.order)));
      for (const lesson of section.lessons) {
        if (lesson.subjectId !== subject.id || lesson.sectionId !== section.id) issues.push(`${lesson.id} has mismatched ownership`);
        if (!slugPattern.test(lesson.slug)) issues.push(`${lesson.id} has invalid slug ${lesson.slug}`);
        if (!lesson.conceptIds.length || lesson.conceptIds.some((id) => !input.conceptIds.has(id))) issues.push(`${lesson.id} has invalid Concept IDs`);
        if (lesson.prerequisiteLessonIds.some((id) => !lessonIds.has(id))) issues.push(`${lesson.id} has invalid prerequisite`);
        if (lesson.exerciseIds.some((id) => !input.exerciseIds.has(id))) issues.push(`${lesson.id} has invalid Exercise reference`);
        if (lesson.problemIds.some((id) => !input.problemIds.has(id))) issues.push(`${lesson.id} has invalid Problem reference`);
        if (lesson.status === "COMPLETE" && !lesson.contentSource) issues.push(`${lesson.id} claims COMPLETE without content`);
      }
    }
    for (const category of subject.references) if (category.referenceIds.some((id) => !referenceIds.has(id))) issues.push(`${category.id} has invalid Reference IDs`);
    for (const group of subject.exerciseGroups) {
      if (group.lessonIds.some((id) => !lessonIds.has(id)) || group.exerciseIds.some((id) => !input.exerciseIds.has(id))) issues.push(`${group.id} has invalid Exercise links`);
    }
    for (const group of subject.quizGroups) {
      if (group.lessonIds.some((id) => !lessonIds.has(id)) || group.questionIds.some((id) => !questionIds.has(id))) issues.push(`${group.id} has invalid Quiz links`);
    }
  }
  unique("subject navigation order", input.subjects.map((item) => String(item.navigationOrder)));
  for (const content of input.lessonContent) {
    if (!lessonIds.has(content.lessonId)) issues.push(`${content.lessonId} content has no manifest lesson`);
    unique(`${content.lessonId} blocks`, content.blocks.map((block) => block.id));
    for (const block of content.blocks) {
      if (block.type === "example" && !exampleIds.has(block.exampleId)) issues.push(`${content.lessonId}.${block.id} has invalid Example`);
      if (block.type === "exercise" && !input.exerciseIds.has(block.exerciseId)) issues.push(`${content.lessonId}.${block.id} has invalid Exercise`);
      if (block.type === "references" && block.referenceIds.some((id) => !referenceIds.has(id))) issues.push(`${content.lessonId}.${block.id} has invalid Reference`);
      if (block.type === "related" && (block.lessonIds.some((id) => !lessonIds.has(id)) || block.problemIds.some((id) => !input.problemIds.has(id)))) issues.push(`${content.lessonId}.${block.id} has invalid related content`);
    }
  }
  for (const example of input.examples) {
    if (!lessonIds.has(example.lessonId) || example.conceptIds.some((id) => !input.conceptIds.has(id))) issues.push(`${example.id} has invalid lesson or Concept links`);
    if (example.runtime === "browser-quickjs" && example.language !== "javascript") issues.push(`${example.id} cannot use QuickJS for ${example.language}`);
  }
  for (const reference of input.references) if (reference.relatedLessonIds.some((id) => !lessonIds.has(id)) || reference.conceptIds.some((id) => !input.conceptIds.has(id))) issues.push(`${reference.id} has invalid links`);
  for (const alias of input.aliases) if (!lessonIds.has(alias.lessonId) || !alias.legacyPath.startsWith("/learn/") || !alias.destination.startsWith("/learn/")) issues.push(`${alias.legacyPath} is an invalid route alias`);
  return issues;
}

import type { ConceptId, LocalizedConceptText } from "@/lib/domain/concepts";
import type { ContentBlock, ContentLevel, Locale, TranslationStatus } from "@/lib/types";

export interface AuthoredContentProvenance {
  source: "topic-registry";
  sourceId: string;
  sourceVersion: number;
  reviewedAt: string;
  sourceIds: string[];
}

export interface LessonBlockRecord {
  id: string;
  lessonId: string;
  legacyBlockId: string;
  type: ContentBlock["type"];
  availableLocales: [Locale, ...Locale[]];
  citationSourceIds: string[];
  provenance: AuthoredContentProvenance;
}

export interface LessonReference {
  id: string;
  lessonId: string;
  conceptIds: [ConceptId, ...ConceptId[]];
  sourceId: string;
  blockId: string;
}

export interface LessonExample {
  id: string;
  lessonId: string;
  conceptIds: [ConceptId, ...ConceptId[]];
  blockId: string;
  kind: "worked-example";
}

export interface LessonPlayground {
  id: string;
  lessonId: string;
  conceptIds: [ConceptId, ...ConceptId[]];
  blockId: string;
  syntaxLanguage: string;
  runtime: "none";
  availability: "unavailable";
}

export interface Lesson {
  id: string;
  slug: string;
  conceptIds: ConceptId[];
  topicId: string;
  title: LocalizedConceptText;
  summary: LocalizedConceptText;
  estimatedMinutes: number;
  contentVersion: number;
  translationStatus: TranslationStatus;
  maturity: ContentLevel;
  blockIds: string[];
  referenceIds: string[];
  exampleIds: string[];
  playgroundIds: string[];
  provenance: AuthoredContentProvenance;
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
  provenance: { source: "domain-registry"; sourceId: string; contentVersion: number };
}

export function validateLearnCatalog(input: {
  lessons: Lesson[];
  blocks: LessonBlockRecord[];
  references: LessonReference[];
  examples: LessonExample[];
  playgrounds: LessonPlayground[];
  conceptIds: Set<string>;
  sourceIds: Set<string>;
}) {
  const issues: string[] = [];
  const lessonIds = new Set(input.lessons.map((lesson) => lesson.id));
  const blockIds = new Set(input.blocks.map((block) => block.id));
  const unique = (label: string, ids: string[]) => {
    const duplicate = ids.find((id, index) => ids.indexOf(id) !== index);
    if (duplicate) issues.push(`${label} contains duplicate ID ${duplicate}`);
  };
  unique("lessons", input.lessons.map((item) => item.id));
  unique("lesson blocks", input.blocks.map((item) => item.id));
  unique("lesson references", input.references.map((item) => item.id));
  unique("lesson examples", input.examples.map((item) => item.id));
  unique("lesson playgrounds", input.playgrounds.map((item) => item.id));
  for (const lesson of input.lessons) {
    if (!lesson.conceptIds.length || lesson.conceptIds.some((id) => !input.conceptIds.has(id))) issues.push(`${lesson.id} has an invalid Concept relation`);
    if (lesson.provenance.sourceIds.some((id) => !input.sourceIds.has(id))) issues.push(`${lesson.id} has an invalid provenance source`);
    if (lesson.blockIds.some((id) => !blockIds.has(id))) issues.push(`${lesson.id} references a missing block`);
  }
  for (const block of input.blocks) {
    if (!lessonIds.has(block.lessonId)) issues.push(`${block.id} references a missing lesson`);
    if (!block.availableLocales.includes("en")) issues.push(`${block.id} must preserve its authored English locale`);
    if (block.citationSourceIds.some((id) => !input.sourceIds.has(id))) issues.push(`${block.id} has an invalid citation source`);
  }
  for (const record of [...input.references, ...input.examples, ...input.playgrounds]) {
    if (!lessonIds.has(record.lessonId) || !blockIds.has(record.blockId)) issues.push(`${record.id} has an invalid lesson block relation`);
    if (record.conceptIds.some((id) => !input.conceptIds.has(id))) issues.push(`${record.id} has an invalid Concept relation`);
  }
  for (const playground of input.playgrounds) {
    if (playground.runtime !== "none" || playground.availability !== "unavailable") issues.push(`${playground.id} must not imply an unavailable runtime`);
  }
  return issues;
}

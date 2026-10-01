import type { LessonRenderModel } from "@/lib/domain/learn-rendering";
import type { LearnExample, LearnJsonValue } from "@/lib/domain/learn-platform";
import { learnRuntimes } from "@/lib/domain/learn-platform";
import { parseLessonCandidate } from "@/lib/domain/learn-validation/parse";
import { canRenderLesson } from "@/lib/domain/learn-validation/renderability";
import { validationLimits as limits, type ValidationReport } from "@/lib/domain/learn-validation/types";
import { isValidationReport } from "@/lib/studio/validation";

export interface StudioPreviewResponse { version: 1; report: ValidationReport; model: LessonRenderModel | null }
export const previewResponseBytes = 2 * 1024 * 1024;
const object = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const text = (value: unknown, max: number = limits.text): value is string => typeof value === "string" && value.length <= max;
const localized = (value: unknown) => object(value) && text(value.en) && text(value.vi);
const slug = (value: unknown) => text(value, 80) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const strings = (value: unknown) => Array.isArray(value) && value.length <= limits.collection && value.every((item) => text(item, limits.id));
function jsonValue(value: unknown, depth = 0): value is LearnJsonValue {
  if (depth > 12) return false;
  if (value === null || typeof value === "boolean" || text(value)) return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= limits.collection && value.every((item) => jsonValue(item, depth + 1));
  return object(value) && Object.keys(value).length <= limits.collection && Object.values(value).every((item) => jsonValue(item, depth + 1));
}
function example(value: unknown): value is LearnExample {
  return object(value) && text(value.id, limits.id) && slug(value.subjectId) && text(value.lessonId, limits.id)
    && localized(value.title) && localized(value.description) && text(value.language, limits.language)
    && learnRuntimes.some((runtime) => value.runtime === runtime) && text(value.starterSource, limits.code)
    && strings(value.conceptIds) && ["easy", "medium", "hard"].includes(String(value.difficulty))
    && (value.expectedOutput === undefined || text(value.expectedOutput)) && (value.input === undefined || jsonValue(value.input));
}
export function isLessonRenderModel(value: unknown): value is LessonRenderModel {
  if (!object(value) || !object(value.context) || !object(value.context.subject) || !object(value.context.section) || !object(value.resources)) return false;
  if (!parseLessonCandidate({ lesson: value.lesson, content: value.content }).candidate) return false;
  const { subject, section } = value.context;
  if (!slug(subject.id) || !slug(subject.slug) || !localized(subject.title) || !text(section.id, limits.id) || !localized(section.title)) return false;
  const { examples, references, lessons } = value.resources;
  if (!Array.isArray(examples) || !Array.isArray(references) || !Array.isArray(lessons) || [examples, references, lessons].some((items) => items.length > limits.collection)) return false;
  return examples.every(example)
    && references.every((item) => object(item) && text(item.id, limits.id) && slug(item.subjectId) && slug(item.slug) && text(item.name) && localized(item.description) && (item.signature === undefined || text(item.signature)))
    && lessons.every((item) => object(item) && text(item.id, limits.id) && slug(item.subjectId) && slug(item.slug) && localized(item.title));
}
export function isStudioPreviewResponse(value: unknown): value is StudioPreviewResponse {
  if (!object(value) || value.version !== 1 || !isValidationReport(value.report)) return false;
  if (value.model === null) return !value.report.renderable;
  if (!value.report.renderable || !isLessonRenderModel(value.model)) return false;
  const blocks = value.model.content?.blocks ?? [];
  const complete = (ids: string[], records: Array<{ id: string }>) => {
    const selected = new Set(ids);
    return records.length === selected.size && new Set(records.map((item) => item.id)).size === records.length && records.every((item) => selected.has(item.id));
  };
  return complete(blocks.flatMap((block) => block.type === "example" ? [block.exampleId] : []), value.model.resources.examples)
    && complete(blocks.flatMap((block) => block.type === "references" ? block.referenceIds : []), value.model.resources.references)
    && complete(blocks.flatMap((block) => block.type === "related" ? block.lessonIds : []), value.model.resources.lessons)
    && value.model.lesson.id === value.report.lessonId && value.model.lesson.subjectId === value.report.subjectId
    && value.model.context.subject.id === value.report.subjectId && value.model.context.section.id === value.model.lesson.sectionId
    && canRenderLesson(value.model, value.report.issues);
}

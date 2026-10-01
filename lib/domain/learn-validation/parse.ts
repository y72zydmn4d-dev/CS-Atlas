import { learnCalloutTones, learnContentStatuses, type LearnLessonBlock } from "@/lib/domain/learn-platform";
import type { LocalizedConceptText } from "@/lib/domain/concepts";
import { difficultyValues, translationStatusValues } from "@/lib/types";
import { boundedIssues, validationLimits as limits, type LessonCandidate, type ValidationIssue } from "./types";

/** Reconstructs canonical values from unknown. No semantic repair or source mutation. */
export function parseLessonCandidate(input: unknown): { candidate: LessonCandidate | null; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  function fail(path: string, message: string, code = "INVALID_STRUCTURE") { issues.push({ code, severity: "ERROR", path, message }); }
  function object(value: unknown, path: string, keys: readonly string[]): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) { fail(path, "Expected an object."); return {}; }
    const entries = Object.entries(value);
    for (const [key] of entries) if (!keys.includes(key)) fail(`${path}.${key.slice(0, 200)}`, "Unsupported field.", "UNSUPPORTED_FIELD");
    return Object.fromEntries(entries);
  }
  function text(value: unknown, path: string, max: number = limits.text): string {
    if (typeof value !== "string") { fail(path, "Expected a string."); return ""; }
    if (value.length > max) fail(path, `Text exceeds ${max} characters.`, "FIELD_LIMIT_EXCEEDED");
    return value;
  }
  function number(value: unknown, path: string): number {
    if (typeof value !== "number" || !Number.isFinite(value)) { fail(path, "Expected a finite number."); return 0; }
    return value;
  }
  function enumeration<const T extends readonly [string | number, ...(string | number)[]]>(value: unknown, values: T, path: string): T[number] {
    for (const option of values) if (value === option) return option;
    fail(path, `Expected one of: ${values.join(", ")}.`, "INVALID_ENUM"); return values[0];
  }
  function array<T>(value: unknown, path: string, decode: (item: unknown, path: string) => T, max: number = limits.collection): T[] {
    if (!Array.isArray(value)) { fail(path, "Expected an array."); return []; }
    if (value.length > max) fail(path, `Collection exceeds ${max} items.`, "FIELD_LIMIT_EXCEEDED");
    return value.slice(0, max).map((item, index) => decode(item, `${path}[${index}]`));
  }
  function localized(value: unknown, path: string): LocalizedConceptText {
    const record = object(value, path, ["en", "vi"]);
    return { en: text(record.en, `${path}.en`), vi: text(record.vi, `${path}.vi`) };
  }
  const id = (value: unknown, path: string) => text(value, path, limits.id);
  const ids = (value: unknown, path: string) => array(value, path, id);
  const localizedList = (value: unknown, path: string, max: number = limits.collection) => array(value, path, localized, max);
  function block(value: unknown, path: string): LearnLessonBlock {
    const record = object(value, path, ["id", "type", "title", "body", "items", "level", "text", "ordered", "term", "language", "code", "caption", "exampleId", "output", "tone", "columns", "rows", "time", "space", "exerciseId", "referenceIds", "lessonIds", "problemIds"]);
    const type = record.type;
    const base = { id: id(record.id, `${path}.id`), ...(record.title === undefined ? {} : { title: localized(record.title, `${path}.title`) }) };
    function keys(allowed: string[]) {
      for (const key of Object.keys(record)) if (!["id", "type", "title", ...allowed].includes(key)) fail(`${path}.${key.slice(0, 200)}`, "Field does not belong to this block type.", "UNSUPPORTED_FIELD");
    }
    const body = () => localized(record.body, `${path}.body`);
    switch (type) {
      case "paragraph": keys(["body"]); return { ...base, type, body: body() };
      case "objectives": keys(["items"]); return { ...base, type, items: localizedList(record.items, `${path}.items`) };
      case "heading": keys(["level", "text"]); return { ...base, type, level: enumeration(record.level, [2, 3], `${path}.level`), text: localized(record.text, `${path}.text`) };
      case "list": {
        keys(["ordered", "items"]);
        if (record.ordered !== undefined && typeof record.ordered !== "boolean") fail(`${path}.ordered`, "Expected a boolean.");
        return { ...base, type, ...(typeof record.ordered === "boolean" ? { ordered: record.ordered } : {}), items: localizedList(record.items, `${path}.items`) };
      }
      case "definition": keys(["term", "body"]); return { ...base, type, term: text(record.term, `${path}.term`), body: body() };
      case "syntax": keys(["language", "code"]); return { ...base, type, language: text(record.language, `${path}.language`, limits.language), code: text(record.code, `${path}.code`, limits.code) };
      case "code": keys(["language", "code", "caption"]); return { ...base, type, language: text(record.language, `${path}.language`, limits.language), code: text(record.code, `${path}.code`, limits.code), ...(record.caption === undefined ? {} : { caption: localized(record.caption, `${path}.caption`) }) };
      case "example": keys(["exampleId"]); return { ...base, type, exampleId: id(record.exampleId, `${path}.exampleId`) };
      case "output": keys(["output"]); return { ...base, type, output: text(record.output, `${path}.output`) };
      case "callout": keys(["tone", "body"]); return { ...base, type, tone: enumeration(record.tone, learnCalloutTones, `${path}.tone`), body: body() };
      case "table": keys(["columns", "rows"]); return { ...base, type, columns: localizedList(record.columns, `${path}.columns`, limits.columns), rows: array(record.rows, `${path}.rows`, (row, rowPath) => array(row, rowPath, text, limits.columns)) };
      case "comparison": keys(["columns", "rows"]); return { ...base, type, columns: localizedList(record.columns, `${path}.columns`, limits.columns), rows: array(record.rows, `${path}.rows`, (row, rowPath) => {
        const entry = object(row, rowPath, ["label", "values"]);
        return { label: localized(entry.label, `${rowPath}.label`), values: localizedList(entry.values, `${rowPath}.values`, limits.columns) };
      }) };
      case "complexity": keys(["time", "space", "body"]); return { ...base, type, time: text(record.time, `${path}.time`), space: text(record.space, `${path}.space`), body: body() };
      case "exercise": keys(["exerciseId"]); return { ...base, type, exerciseId: id(record.exerciseId, `${path}.exerciseId`) };
      case "references": keys(["referenceIds"]); return { ...base, type, referenceIds: ids(record.referenceIds, `${path}.referenceIds`) };
      case "related": keys(["lessonIds", "problemIds"]); return { ...base, type, lessonIds: ids(record.lessonIds, `${path}.lessonIds`), problemIds: ids(record.problemIds, `${path}.problemIds`) };
      default: fail(`${path}.type`, "Unsupported canonical block type.", "UNKNOWN_BLOCK_TYPE"); return { ...base, type: "paragraph", body: { en: "", vi: "" } };
    }
  }
  const root = object(input, "draft", ["lesson", "content"]);
  const lesson = object(root.lesson, "lesson", ["id", "subjectId", "sectionId", "slug", "title", "description", "order", "conceptIds", "prerequisiteLessonIds", "estimatedMinutes", "difficulty", "status", "translationStatus", "contentSource", "exerciseIds", "problemIds"]);
  const candidate: LessonCandidate = { lesson: {
    id: id(lesson.id, "lesson.id"), subjectId: id(lesson.subjectId, "lesson.subjectId"), sectionId: id(lesson.sectionId, "lesson.sectionId"), slug: id(lesson.slug, "lesson.slug"),
    title: localized(lesson.title, "lesson.title"), description: localized(lesson.description, "lesson.description"), order: number(lesson.order, "lesson.order"),
    conceptIds: ids(lesson.conceptIds, "lesson.conceptIds"), prerequisiteLessonIds: ids(lesson.prerequisiteLessonIds, "lesson.prerequisiteLessonIds"),
    estimatedMinutes: number(lesson.estimatedMinutes, "lesson.estimatedMinutes"), difficulty: enumeration(lesson.difficulty, difficultyValues, "lesson.difficulty"),
    status: enumeration(lesson.status, learnContentStatuses, "lesson.status"), translationStatus: enumeration(lesson.translationStatus, translationStatusValues, "lesson.translationStatus"),
    ...(lesson.contentSource === undefined ? {} : { contentSource: text(lesson.contentSource, "lesson.contentSource", limits.id) }),
    exerciseIds: ids(lesson.exerciseIds, "lesson.exerciseIds"), problemIds: ids(lesson.problemIds, "lesson.problemIds"),
  }, content: null };
  if (root.content !== null) {
    const content = object(root.content, "content", ["lessonId", "version", "reviewedAt", "summary", "blocks"]);
    candidate.content = { lessonId: id(content.lessonId, "content.lessonId"), version: number(content.version, "content.version"), reviewedAt: text(content.reviewedAt, "content.reviewedAt", 10), summary: localized(content.summary, "content.summary"), blocks: array(content.blocks, "content.blocks", block, limits.blocks) };
  }
  for (const issue of issues) {
    const match = issue.path.match(/^content\.blocks\[(\d+)\]/);
    if (match) {
      issue.blockIndex = Number(match[1]);
      const blockId = candidate.content?.blocks[issue.blockIndex]?.id;
      // Invalid huge IDs must not be echoed hundreds of times into the response.
      if (blockId && blockId.length <= limits.id) issue.blockId = blockId;
    }
  }
  return { candidate: issues.length ? null : candidate, issues: boundedIssues(issues) };
}

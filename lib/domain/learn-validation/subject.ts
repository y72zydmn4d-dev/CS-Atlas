import { learnContentStatuses, subjectCategories, type SubjectManifest, type LessonManifest } from "@/lib/domain/learn-platform";
import { difficultyValues, translationStatusValues } from "@/lib/types";
import { parseLessonCandidate } from "./parse";
import { boundedIssues, type ValidationIssue } from "./types";

/** Storage boundary for the existing canonical subject schema; no editor/CMS fields. */
export function parseSubjectManifest(input: unknown): { subject: SubjectManifest | null; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const fail = (path: string) => { issues.push({ severity: "ERROR", code: "INVALID_SUBJECT_STRUCTURE", path, message: "Invalid canonical subject field." }); };
  const obj = (value: unknown, path: string, keys: string[]) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) { fail(path); return {}; }
    const result = Object.fromEntries(Object.entries(value));
    if (Object.keys(result).some((key) => !keys.includes(key))) fail(path);
    return result;
  };
  const text = (value: unknown, path: string, max = 20_000) => {
    if (typeof value !== "string" || value.length > max) { fail(path); return ""; }
    return value;
  };
  const num = (value: unknown, path: string) => {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) { fail(path); return 1; }
    return value;
  };
  const list = <T>(value: unknown, path: string, decode: (entry: unknown, path: string) => T, max = 200) => {
    if (!Array.isArray(value) || value.length > max) { fail(path); return []; }
    return value.map((entry, index) => decode(entry, `${path}[${index}]`));
  };
  const ids = (value: unknown, path: string) => list(value, path, (entry, at) => text(entry, at, 200), 2000);
  const localized = (value: unknown, path: string) => {
    const entry = obj(value, path, ["en", "vi"]);
    return { en: text(entry.en, `${path}.en`), vi: text(entry.vi, `${path}.vi`) };
  };
  const enumeration = <T extends string>(value: unknown, options: readonly T[], path: string): T => {
    const result = options.find((option) => option === value);
    if (result !== undefined) return result;
    fail(path); return options[0];
  };
  const record = obj(input, "subject", ["id", "slug", "navigationOrder", "title", "description", "category", "icon", "status", "translationStatus", "conceptIds", "sections", "references", "exerciseGroups", "quizGroups", "relatedRoadmapIds", "relatedProblemIds"]);
  const subject: SubjectManifest = {
    id: text(record.id, "subject.id", 80), slug: text(record.slug, "subject.slug", 80), navigationOrder: num(record.navigationOrder, "subject.navigationOrder"),
    title: localized(record.title, "subject.title"), description: localized(record.description, "subject.description"), category: enumeration(record.category, subjectCategories, "subject.category"),
    icon: text(record.icon, "subject.icon", 200), status: enumeration(record.status, learnContentStatuses, "subject.status"), translationStatus: enumeration(record.translationStatus, translationStatusValues, "subject.translationStatus"),
    conceptIds: ids(record.conceptIds, "subject.conceptIds"),
    sections: list(record.sections, "subject.sections", (value, path) => {
      const entry = obj(value, path, ["id", "subjectId", "title", "order", "lessons"]);
      return { id: text(entry.id, `${path}.id`, 200), subjectId: text(entry.subjectId, `${path}.subjectId`, 80), title: localized(entry.title, `${path}.title`), order: num(entry.order, `${path}.order`),
        lessons: list(entry.lessons, `${path}.lessons`, (lesson, at): LessonManifest => {
          const parsed = parseLessonCandidate({ lesson, content: null });
          issues.push(...parsed.issues.map((issue) => ({ ...issue, path: `${at}.${issue.path}` })));
          // Placeholder is discarded with the entire subject on any parse failure.
          return parsed.candidate?.lesson ?? { id: "", subjectId: "", sectionId: "", slug: "", title: { en: "", vi: "" }, description: { en: "", vi: "" }, order: 1, conceptIds: [], prerequisiteLessonIds: [], estimatedMinutes: 1, difficulty: difficultyValues[0], status: "SKELETON", translationStatus: translationStatusValues[0], exerciseIds: [], problemIds: [] };
        }, 2000) };
    }),
    references: list(record.references, "subject.references", (value, path) => {
      const entry = obj(value, path, ["id", "title", "order", "referenceIds"]);
      return { id: text(entry.id, `${path}.id`, 200), title: localized(entry.title, `${path}.title`), order: num(entry.order, `${path}.order`), referenceIds: ids(entry.referenceIds, `${path}.referenceIds`) };
    }),
    exerciseGroups: list(record.exerciseGroups, "subject.exerciseGroups", (value, path) => {
      const entry = obj(value, path, ["id", "title", "lessonIds", "exerciseIds"]);
      return { id: text(entry.id, `${path}.id`, 200), title: localized(entry.title, `${path}.title`), lessonIds: ids(entry.lessonIds, `${path}.lessonIds`), exerciseIds: ids(entry.exerciseIds, `${path}.exerciseIds`) };
    }),
    quizGroups: list(record.quizGroups, "subject.quizGroups", (value, path) => {
      const entry = obj(value, path, ["id", "title", "lessonIds", "questionIds"]);
      return { id: text(entry.id, `${path}.id`, 200), title: localized(entry.title, `${path}.title`), lessonIds: ids(entry.lessonIds, `${path}.lessonIds`), questionIds: ids(entry.questionIds, `${path}.questionIds`) };
    }),
    relatedRoadmapIds: ids(record.relatedRoadmapIds, "subject.relatedRoadmapIds"), relatedProblemIds: ids(record.relatedProblemIds, "subject.relatedProblemIds"),
  };
  return { subject: issues.length ? null : subject, issues: boundedIssues(issues) };
}

import { describe, expect, it } from "vitest";
import { learnLessons, learnSubjects, learnRouteAliases } from "@/content/learn/registry";
import { learnLessonContent, learnExamples, learnReferences, learnQuizQuestions } from "@/content/learn/lesson-content";
import { validateLearnPlatform } from "@/lib/domain/learn-platform";
import { validateCanonicalLesson } from "@/lib/domain/learn-validation";
import { parseLessonCandidate } from "@/lib/domain/learn-validation/parse";
import { createDraftBlock, createRelationshipBlock, editableBlockTypes, emptyDraftBody } from "@/lib/studio/draft";
import { validationContext, validationDraft } from "./learn-validation-fixtures";

const validate = (draft: unknown) => validateCanonicalLesson(draft, validationContext());
const codes = (draft: unknown) => validate(draft).issues.map((issue) => issue.code);
describe("shared canonical lesson validation", () => {
  it("accepts every real authored lesson without ERRORs and leaves source untouched", () => {
    const before = JSON.stringify([learnSubjects, learnLessonContent]);
    for (const lesson of learnLessons.filter((item) => item.status === "COMPLETE")) expect(validate(validationDraft(lesson.id)).issues.filter((issue) => issue.severity === "ERROR"), lesson.id).toEqual([]);
    expect(JSON.stringify([learnSubjects, learnLessonContent])).toBe(before);
  });
  it("accepts absent intentional SKELETON and PLANNED bodies", () => {
    const draft = validationDraft("learn:java:interfaces");
    expect(validate(draft).issues).toEqual([]);
    draft.lesson.status = "PLANNED"; expect(validate(draft).issues).toEqual([]);
    draft.lesson.status = "PARTIAL"; expect(codes(draft)).toContain("PARTIAL_BODY_THIN");
  });
  it("COMPLETE needs actual substance/objectives/summary/review, not headings/links/output", () => {
    const draft = validationDraft("learn:java:interfaces"); draft.lesson.status = "COMPLETE";
    expect(codes(draft)).toEqual(expect.arrayContaining(["COMPLETE_MISSING_BODY", "COMPLETE_MISSING_SUBSTANCE", "COMPLETE_MISSING_OBJECTIVES", "COMPLETE_SUMMARY_EMPTY", "COMPLETE_REVIEW_DATE_EMPTY"]));
    draft.content = emptyDraftBody(draft.lesson.id);
    draft.content.blocks = [{ id: "heading", type: "heading", level: 2, text: { en: "Overview", vi: "" } }, { id: "output", type: "output", output: "42" }];
    expect(codes(draft)).toContain("COMPLETE_MISSING_SUBSTANCE");
  });
  it.each(editableBlockTypes)("parses and checks the %s editable payload", (type) => {
    const draft = validationDraft("learn:java:interfaces"); draft.content = emptyDraftBody(draft.lesson.id);
    draft.content.blocks = [createDraftBlock(type, [])];
    expect(parseLessonCandidate(draft).candidate).not.toBeNull();
    const corrupt = structuredClone(draft); if (!corrupt.content) throw Error("body"); Reflect.deleteProperty(corrupt.content.blocks[0], type === "heading" ? "text" : type === "objectives" || type === "list" ? "items" : type === "table" || type === "comparison" ? "columns" : type === "code" || type === "syntax" ? "code" : type === "output" ? "output" : "body");
    expect(parseLessonCandidate(corrupt).candidate).toBeNull();
    expect(parseLessonCandidate(corrupt).issues.some((issue) => issue.blockIndex === 0)).toBe(true);
  });
  it.each(["example", "exercise", "references", "related"] as const)("checks %s registry payload and strict shape", (type) => {
    const draft = validationDraft(); if (!draft.content) throw Error("body");
    draft.content.blocks = [createRelationshipBlock(type, [], "unresolved")];
    expect(parseLessonCandidate(draft).candidate).not.toBeNull();
    const invalid = { ...draft, content: { ...draft.content, blocks: [{ ...draft.content.blocks[0], html: "<script>" }] } };
    expect(codes(invalid)).toContain("UNSUPPORTED_FIELD");
  });
  it.each([null, {}, { lesson: [], content: null }, { lesson: "x", content: "x" }])("controls malformed root shape %j", (input) => {
    expect(validate(input).candidate).toBeNull(); expect(validate(input).issues.every((issue) => issue.severity === "ERROR")).toBe(true);
  });
  it("rejects unknown discriminators, invalid enums, nonfinite values and missing fields", () => {
    const draft = validationDraft();
    expect(codes({ ...draft, lesson: { ...draft.lesson, status: "PUBLISHED", estimatedMinutes: Infinity } })).toEqual(expect.arrayContaining(["INVALID_ENUM", "INVALID_STRUCTURE"]));
    expect(codes({ ...draft, content: { ...draft.content, blocks: [{ id: "html", type: "html", html: "<script>" }] } })).toContain("UNKNOWN_BLOCK_TYPE");
  });
  it("validates all metadata identity/date/range/translation fields", () => {
    const draft = validationDraft(); draft.lesson.title.en = " "; draft.lesson.description.en = ""; draft.lesson.estimatedMinutes = -1; draft.lesson.slug = "../package.json"; draft.lesson.id = "../../x";
    if (!draft.content) throw Error("body"); draft.content.version = 0; draft.content.reviewedAt = "2026-02-30";
    expect(codes(draft)).toEqual(expect.arrayContaining(["LESSON_TITLE_EMPTY", "LESSON_DESCRIPTION_EMPTY", "POSITIVE_INTEGER_REQUIRED", "LESSON_SLUG_INVALID", "LESSON_ID_INVALID", "BODY_VERSION_INVALID", "REVIEW_DATE_INVALID"]));
    draft.lesson.translationStatus = "complete"; draft.lesson.title.vi = ""; expect(codes(draft)).toContain("TRANSLATION_FIELD_MISSING");
  });
  it("rejects reserved/colliding routes, ownership/placement/order and body identity", () => {
    const draft = validationDraft(); draft.lesson.slug = "tutorial"; expect(codes(draft)).toContain("LESSON_SLUG_RESERVED");
    draft.lesson.slug = "variables"; expect(codes(draft)).toContain("LESSON_ROUTE_COLLISION");
    draft.lesson.sectionId = "unknown"; draft.lesson.order = 99;
    if (!draft.content) throw Error("body"); draft.content.lessonId = "other";
    expect(codes(draft)).toEqual(expect.arrayContaining(["UNKNOWN_SECTION_ID", "CURRICULUM_IDENTITY_INVALID", "BODY_LESSON_MISMATCH"]));
    draft.lesson.subjectId = "missing"; expect(codes(draft)).toContain("UNKNOWN_SUBJECT_ID");
  });
  it("checks positive ordering and duplicate canonical placement", () => {
    const context = validationContext(); const draft = validationDraft();
    const subject = context.subjects.find(s => s.id === draft.lesson.subjectId);
    if (!subject) throw Error("Missing fixture subject");
    subject.sections[0].lessons.push(structuredClone(draft.lesson));
    expect(validateCanonicalLesson(draft, context).issues.map((issue) => issue.code)).toContain("CURRICULUM_IDENTITY_INVALID");
    subject.sections[0].order = 100;
    expect(validateCanonicalLesson(draft, context).issues.map((issue) => issue.code)).toContain("SECTION_ORDER_INVALID");
  });
  it("reports all unknown relationships at actual field paths and keeps unresolved IDs", () => {
    const draft = validationDraft();
    draft.lesson.conceptIds = ["legacy:missing"]; draft.lesson.exerciseIds = ["missing-exercise"]; draft.lesson.problemIds = ["missing-problem"]; draft.lesson.prerequisiteLessonIds = ["missing-lesson"];
    if (!draft.content) throw Error("body");
    draft.content.blocks = [{ id: "ex", type: "example", exampleId: "missing-example" }, { id: "exercise", type: "exercise", exerciseId: "missing-exercise" }, { id: "ref", type: "references", referenceIds: ["missing-reference"] }, { id: "related", type: "related", lessonIds: ["missing-lesson"], problemIds: ["missing-problem"] }];
    const before = structuredClone(draft); const report = validate(draft);
    expect(report.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(["UNKNOWN_CONCEPT_ID", "UNKNOWN_EXERCISE_ID", "UNKNOWN_PROBLEM_ID", "UNKNOWN_PREREQUISITE_LESSON_ID", "UNKNOWN_RELATED_LESSON_ID", "UNKNOWN_REFERENCE_ID", "UNKNOWN_EXAMPLE_ID"]));
    expect(report.issues.find((issue) => issue.code === "UNKNOWN_EXAMPLE_ID")).toMatchObject({ path: "content.blocks[0].exampleId", blockId: "ex", blockIndex: 0, relatedCanonicalId: "missing-example" });
    expect(draft).toEqual(before);
  });
  it("reports duplicates without reordering, flattening roles or silently fixing", () => {
    const draft = validationDraft(); draft.lesson.conceptIds.push(draft.lesson.conceptIds[0]);
    draft.lesson.exerciseIds = ["missing", "missing"]; draft.lesson.problemIds = ["missing", "missing"];
    expect(codes(draft)).toEqual(expect.arrayContaining(["DUPLICATE_CONCEPT_ID", "DUPLICATE_EXERCISE_ID", "DUPLICATE_PROBLEM_ID"]));
  });
  it("validates reference subject/category membership and static Example runtime without execution", () => {
    const context = validationContext(); const draft = validationDraft(); if (!draft.content) throw Error("body");
    const reference = [...context.references.values()][0]; reference.categoryId = "missing";
    const example = [...context.examples.values()][0]; example.runtime = "browser-quickjs";
    draft.content.blocks = [{ id: "ref", type: "references", referenceIds: [reference.id] }, { id: "ex", type: "example", exampleId: example.id }];
    expect(validateCanonicalLesson(draft, context).issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(["REFERENCE_CATEGORY_INVALID", "EXAMPLE_CONFIGURATION_INVALID"]));
  });
  it("allows cross-subject associations and does not treat related loops as prerequisites", () => {
    const draft = validationDraft(); if (!draft.content) throw Error("body");
    draft.content.blocks = [{ id: "related", type: "related", lessonIds: ["learn:dsa:complexity"], problemIds: [] }];
    expect(codes(draft)).not.toContain("PREREQUISITE_CYCLE");
    draft.content.blocks = [{ id: "related", type: "related", lessonIds: [draft.lesson.id], problemIds: [] }]; expect(codes(draft)).toContain("SELF_LESSON_RELATIONSHIP");
  });
  it.each([1, 2, 3])("detects %i-node prerequisite cycles with a readable path", (length) => {
    const context = validationContext(); const draft = validationDraft();
    const chain = [draft.lesson, ...[...context.lessons.values()].filter((item) => item.id !== draft.lesson.id).slice(0, length - 1)];
    chain.forEach((lesson, index) => { lesson.prerequisiteLessonIds = [chain[(index + 1) % chain.length].id]; });
    const issue = validateCanonicalLesson(draft, context).issues.find((item) => item.code === "PREREQUISITE_CYCLE");
    expect(issue?.message).toContain(chain.map((item) => item.id).concat(draft.lesson.id).join(" → "));
  });
  it("accepts a valid DAG and reports invalid table widths, IDs, syntax labels and duplicates", () => {
    const draft = validationDraft(); if (!draft.content) throw Error("body");
    expect(codes(draft)).not.toContain("PREREQUISITE_CYCLE");
    draft.content.blocks = [{ id: "table", type: "table", columns: [{ en: "a", vi: "" }], rows: [["1", "2"]] }, { id: "table", type: "code", language: "bad language", code: "x" }];
    expect(codes(draft)).toEqual(expect.arrayContaining(["TABLE_ROW_WIDTH_INVALID", "DUPLICATE_BLOCK_ID", "CODE_LANGUAGE_INVALID"]));
  });
  it("bounds blocks, code, arrays and diagnostics", () => {
    const draft = validationDraft(); if (!draft.content) throw Error("body");
    draft.content.blocks = Array.from({ length: 201 }, () => ({ id: "code", type: "code", language: "java", code: "x".repeat(20001) }));
    const report = validate(draft); expect(report.candidate).toBeNull(); expect(report.issues.length).toBeLessThanOrEqual(500); expect(report.issues[0].code).toBe("FIELD_LIMIT_EXCEEDED");
  });
  it("keeps literal educational HTML/URL/event-handler strings safe as text, not censored", () => {
    const draft = validationDraft(); if (!draft.content) throw Error("body");
    draft.content.blocks.push({ id: "html-code", type: "code", language: "html", code: '<script>alert(1)</script> onclick= javascript:' });
    expect(validate(draft).issues.filter((issue) => issue.severity === "ERROR")).toEqual([]);
  });
  it("bounds malformed diagnostic context without echoing giant IDs/unknown keys", () => {
    const draft = validationDraft();
    const malformed = { ...draft, content: { ...draft.content, blocks: [{ id: "x".repeat(900_000), type: "paragraph", body: { en: "text", vi: "" }, ...Object.fromEntries(Array.from({ length: 300 }, (_, index) => [`extra-${index}`, true])) }] } };
    const report = validate(malformed);
    expect(report.candidate).toBeNull(); expect(JSON.stringify(report.issues).length).toBeLessThan(100_000);
    expect(report.issues.every((issue) => !issue.blockId || issue.blockId.length <= 200)).toBe(true);
    expect(report.issues).toContainEqual(expect.objectContaining({ code: "ISSUE_LIMIT_REACHED", severity: "ERROR" }));
  });
  it("build validation reports the identical canonical ERROR codes for the same lesson", () => {
    const context = validationContext(); const draft = validationDraft(); draft.lesson.conceptIds = ["unknown"];
    const subject = context.subjects.find((item) => item.id === draft.lesson.subjectId);
    const section = subject?.sections.find((item) => item.id === draft.lesson.sectionId); if (!section) throw Error("section");
    section.lessons[section.lessons.findIndex((item) => item.id === draft.lesson.id)] = draft.lesson;
    const expected = validateCanonicalLesson(draft, context).issues.filter((issue) => issue.severity === "ERROR");
    const build = validateLearnPlatform({ subjects: [...context.subjects], lessonContent: learnLessonContent, examples: learnExamples, references: learnReferences, quizQuestions: learnQuizQuestions, aliases: learnRouteAliases, conceptIds: new Set(context.conceptIds), exerciseIds: new Set(context.exerciseIds), problemIds: new Set(context.problemIds) });
    for (const issue of expected) expect(build.some((message) => message.includes(issue.code))).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { lessonText, toLessonRenderModel } from "@/lib/domain/learn-rendering";
import { isStudioPreviewResponse } from "@/lib/studio/preview";
import { validationContext, validationDraft } from "./learn-validation-fixtures";
import { previewFixture } from "./studio-preview-fixtures";

describe("canonical preview projection / fail-closed eligibility", () => {
  it.each(["learn:python:introduction", "learn:python:lists", "learn:dsa:binary-search", "learn:java:interfaces"])("preserves %s manifest, body, ordering and roles without mutation", (id) => {
    const draft = validationDraft(id); const before = structuredClone(draft);
    const response = previewFixture(draft);
    expect(isStudioPreviewResponse(response)).toBe(true); expect(response.report.renderable).toBe(true);
    expect(response.model?.lesson).toEqual(draft.lesson); expect(response.model?.content).toEqual(draft.content);
    expect(response.model?.content?.blocks.map((block) => block.id)).toEqual(draft.content?.blocks.map((block) => block.id));
    if (!response.model) throw Error("model");
    response.model.lesson.title.en = "Preview-only";
    response.model.content?.blocks.reverse();
    expect(draft).toEqual(before); expect(validationDraft(id)).toEqual(before);
  });
  it("projects only referenced public resources; does not clone the catalog or private Problem bodies", () => {
    const draft = validationDraft("learn:python:lists"); const context = validationContext();
    const model = toLessonRenderModel(draft, context);
    expect(model.resources.examples.length).toBeLessThan(context.examples.size);
    expect(model.resources.references.length).toBeLessThan(context.references.size);
    expect(model.resources.lessons.length).toBeLessThan(context.lessons.size);
    for (const lesson of model.resources.lessons) expect(Object.keys(lesson).sort()).toEqual(["id", "slug", "subjectId", "title"]);
    expect(JSON.stringify(model.resources)).not.toContain("referenceSolution");
    expect(JSON.stringify(model.resources)).not.toContain("hiddenTests");
    if (model.resources.examples[0]) model.resources.examples[0].starterSource = "changed";
    expect(toLessonRenderModel(draft, context).resources).not.toEqual(model.resources);
  });
  it("uses selected locale with honest English fallback, never mutating/localizing content", () => {
    const text = { en: "English", vi: "Tiếng Việt" };
    expect(lessonText(text, "vi")).toBe("Tiếng Việt");
    expect(lessonText({ en: "English", vi: "  " }, "vi")).toBe("English");
    expect(text).toEqual({ en: "English", vi: "Tiếng Việt" });
  });
  it("allows safe COMPLETE presence errors to preview but not persist", () => {
    const draft = validationDraft("learn:java:interfaces"); draft.lesson.status = "COMPLETE";
    const result = previewFixture(draft);
    expect(result.report).toMatchObject({ hasErrors: true, renderable: true, canPersistInFuture: false });
    expect(result.model?.content).toBeNull(); expect(isStudioPreviewResponse(result)).toBe(true);
  });
  it("permits warnings but fails closed for unresolved relationships and unknown error codes", () => {
    const draft = validationDraft(); draft.lesson.status = "PARTIAL";
    expect(previewFixture(draft).report.renderable).toBe(true);
    draft.lesson.conceptIds = ["legacy:unresolved"];
    const blocked = previewFixture(draft);
    expect(blocked.model).toBeNull(); expect(blocked.report.renderable).toBe(false);
    expect(draft.lesson.conceptIds).toEqual(["legacy:unresolved"]);
    const forged = previewFixture(); forged.report.issues = [{ code: "FUTURE_INTEGRITY_ERROR", severity: "ERROR", path: "draft", message: "unsafe" }];
    forged.report.counts.ERROR = 1; forged.report.status = "invalid"; forged.report.hasErrors = true; forged.report.canPersistInFuture = false;
    expect(isStudioPreviewResponse(forged)).toBe(false);
  });
  it("rejects malformed/forged/oversized response models before rendering", () => {
    const result = previewFixture();
    expect(isStudioPreviewResponse({ ...result, model: {} })).toBe(false);
    expect(isStudioPreviewResponse({ ...result, model: null })).toBe(false);
    if (!result.model) throw Error("model");
    result.model.context.subject.id = "java"; expect(isStudioPreviewResponse(result)).toBe(false);
    const malformed = previewFixture(); if (!malformed.model?.content) throw Error("body");
    expect(isStudioPreviewResponse({ ...malformed, model: { ...malformed.model, content: { ...malformed.model.content, blocks: [{ id: "bad", type: "html", html: "<script>" }] } } })).toBe(false);
  });
  it("rejects missing, duplicate or unrelated presentation resources instead of silently dropping known links", () => {
    const result = previewFixture(validationDraft("learn:python:lists")); if (!result.model || !result.model.resources.examples.length) throw Error("rich model");
    const missing = structuredClone(result); if (!missing.model) throw Error("model"); missing.model.resources.examples = [];
    expect(isStudioPreviewResponse(missing)).toBe(false);
    result.model.resources.examples.push(result.model.resources.examples[0]); expect(isStudioPreviewResponse(result)).toBe(false);
  });
});

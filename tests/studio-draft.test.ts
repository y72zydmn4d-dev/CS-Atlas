import { describe, expect, it } from "vitest";
import { learnLessonById } from "@/content/learn/registry";
import { learnContentByLessonId } from "@/content/learn/lesson-content";
import { createDraftBlock, draftFingerprint, duplicateDraftBlock, editableBlockTypes, emptyDraftBody, isDraftDirty, moveItem, toAuthoringDraft, toCanonicalCandidate } from "@/lib/studio/draft";

function source() {
  const lesson = learnLessonById.get("learn:python:introduction");
  const content = learnContentByLessonId.get("learn:python:introduction");
  if (!lesson || !content) throw new Error("Missing canonical fixture");
  return { lesson, content };
}

describe("transient canonical draft boundary", () => {
  it("round-trips actual canonical fields without a persisted editor envelope", () => {
    const canonical = source();
    const draft = toAuthoringDraft(canonical);
    expect(toCanonicalCandidate(draft)).toEqual(canonical);
    expect(Object.keys(draft)).toEqual(["lesson", "content"]);
    expect(draft.lesson).not.toBe(canonical.lesson);
    expect(draft.content?.blocks).not.toBe(canonical.content.blocks);
  });
  it("isolates edits and conversion from the canonical source and baseline", () => {
    const canonical = source();
    const before = structuredClone(canonical);
    const baseline = toAuthoringDraft(canonical);
    const draft = toAuthoringDraft(canonical);
    draft.lesson.title.en = "Transient";
    draft.lesson.conceptIds.push("not-persisted");
    draft.content?.blocks.push(createDraftBlock("paragraph", draft.content.blocks));
    const candidate = toCanonicalCandidate(draft);
    candidate.lesson.title.vi = "Khác";
    expect(canonical).toEqual(before);
    expect(baseline).toEqual(before);
    expect(draft.lesson.title.vi).toEqual(canonical.lesson.title.vi);
  });
  it("becomes clean again after metadata, array order and text are manually reverted", () => {
    const baseline = toAuthoringDraft(source());
    const draft = toAuthoringDraft(source());
    expect(isDraftDirty(draft, baseline)).toBe(false);
    draft.lesson.title.en += " edited";
    expect(isDraftDirty(draft, baseline)).toBe(true);
    draft.lesson.title.en = baseline.lesson.title.en;
    expect(isDraftDirty(draft, baseline)).toBe(false);
    if (!draft.content || !baseline.content) throw new Error("Missing body");
    draft.content.blocks = moveItem(draft.content.blocks, 0, 1);
    expect(isDraftDirty(draft, baseline)).toBe(true);
    draft.content.blocks = moveItem(draft.content.blocks, 1, 0);
    expect(isDraftDirty(draft, baseline)).toBe(false);
    draft.content.summary.en += " ";
    expect(isDraftDirty(draft, baseline)).toBe(true);
    draft.content.summary.en = baseline.content.summary.en;
    expect(isDraftDirty(draft, baseline)).toBe(false);
  });
  it("ignores object-key insertion order and absent optional undefined, not semantic array order", () => {
    const baseline = toAuthoringDraft(source());
    const draft = toAuthoringDraft(source());
    draft.lesson.title = { vi: draft.lesson.title.vi, en: draft.lesson.title.en };
    if (draft.content) draft.content.blocks = draft.content.blocks.map((block) => ({ ...block, title: block.title }));
    expect(draftFingerprint(draft)).toBe(draftFingerprint(baseline));
  });
  it("preserves skeleton body absence until explicit transient creation", () => {
    const lesson = learnLessonById.get("learn:java:interfaces");
    if (!lesson) throw new Error("Missing skeleton fixture");
    const baseline = toAuthoringDraft({ lesson, content: null });
    const draft = toAuthoringDraft({ lesson, content: null });
    expect(toCanonicalCandidate(draft).content).toBeNull();
    draft.content = emptyDraftBody(lesson.id);
    expect(isDraftDirty(draft, baseline)).toBe(true);
    expect(draft.content.reviewedAt).toBe("");
    expect(draft.lesson.status).toBe("SKELETON");
    expect(learnContentByLessonId.has(lesson.id)).toBe(false);
  });
  it.each(editableBlockTypes)("creates isolated canonical %s blocks with stable unique local IDs", (type) => {
    const first = createDraftBlock(type, []);
    const second = createDraftBlock(type, [first]);
    expect(first.type).toBe(type);
    expect(second.id).not.toBe(first.id);
    const copy = duplicateDraftBlock(first, [first, second]);
    expect(copy).toEqual({ ...first, id: `${type}-3` });
    expect(copy).not.toBe(first);
    if (first.type === "objectives" && copy.type === "objectives") {
      copy.items[0].en = "New objective";
      expect(first.items[0].en).toBe("");
    }
  });
  it("clones ID-backed blocks without changing canonical relationship IDs", () => {
    const block = { id: "links", type: "related" as const, lessonIds: ["learn:python:introduction"], problemIds: [] };
    const copy = duplicateDraftBlock(block, [block]);
    expect(copy.id).not.toBe(block.id);
    expect(copy.type).toBe("related");
    expect(copy).toEqual({ ...block, id: "related-1" });
    if (copy.type === "related") copy.lessonIds.push("transient-only");
    expect(block.lessonIds).toHaveLength(1);
  });
  it("bounds array movement without mutating source or introducing undefined items", () => {
    const items = ["a", "b", "c"];
    expect(moveItem(items, 0, 2)).toEqual(["b", "c", "a"]);
    for (const [from, to] of [[-1, 0], [0, 3], [3, 0]]) expect(moveItem(items, from, to)).toEqual(items);
    expect(items).toEqual(["a", "b", "c"]);
  });
});

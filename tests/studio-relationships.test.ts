import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { searchStudioRelationships, resolveStudioRelationships } from "@/lib/studio/relationships.server";
import { addRelationshipId, isRelationshipResponse, relationshipKinds } from "@/lib/studio/relationships";
import { createRelationshipBlock, isDraftDirty, toAuthoringDraft } from "@/lib/studio/draft";
import { learnLessonById } from "@/content/learn/registry";
import { learnContentByLessonId } from "@/content/learn/lesson-content";

beforeEach(() => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); });
afterEach(() => vi.unstubAllEnvs());

describe("bounded canonical relationship projections", () => {
  it.each(relationshipKinds)("searches/resolves %s with a narrow validated projection", async (kind) => {
    const response = await searchStudioRelationships(kind, "");
    expect(isRelationshipResponse(response, kind)).toBe(true);
    expect(response.items.length).toBeGreaterThan(0);
    expect(response.items.length).toBeLessThanOrEqual(20);
    const first = response.items[0];
    const resolved = await resolveStudioRelationships(kind, [first.id, "missing:id", first.id]);
    expect(resolved.items).toEqual([first]);
    expect(resolved.unresolvedIds).toEqual(["missing:id"]);
    expect(Object.keys(first).sort()).toEqual(["description", "id", "kind", "label", "metadata"]);
    expect(JSON.stringify(response)).not.toMatch(/"(?:assessment|acceptedAnswers|correctOptionId|tests|starterSource|blocks|referenceSolution)"/);
  });
  it("matches Concept aliases, canonical IDs and accent-insensitive Vietnamese names", async () => {
    expect((await searchStudioRelationships("concepts", "topic-recursion")).items.some((item) => item.id === "topic:recursion")).toBe(true);
    expect((await searchStudioRelationships("concepts", "topic:recursion")).items[0]?.id).toBe("topic:recursion");
    expect((await searchStudioRelationships("concepts", "de quy")).items.some((item) => item.id === "topic:recursion")).toBe(true);
  });
  it("bounds large Concept/lesson registries and signals that search can be refined", async () => {
    for (const kind of ["concepts", "lessons"] as const) {
      const result = await searchStudioRelationships(kind, "");
      expect(result.items).toHaveLength(20); expect(result.hasMore).toBe(true);
      expect(await searchStudioRelationships(kind, "not-a-real-canonical-name-987")).toMatchObject({ items: [], hasMore: false });
    }
  });
  it("projects actual Exercise mode/difficulty/concepts without inventing a language field", async () => {
    const result = await searchStudioRelationships("exercises", "exercise:array-linear-scan");
    expect(result.items[0]).toMatchObject({ id: "exercise:array-linear-scan", metadata: ["easy", "fill_code", "topic:arrays"] });
  });
  it("projects public Problem difficulty/domain/languages/concepts only", async () => {
    const result = await searchStudioRelationships("problems", "first-occurrence");
    expect(result.items[0]?.id).toBe("first-occurrence");
    expect(result.items[0]?.metadata).toContain("python");
  });
  it("retains Reference subject/category/item identity and searches categories/signatures", async () => {
    const result = await searchStudioRelationships("references", "python-list-methods append");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ id: "python-ref-list-append", metadata: ["python", "python-list-methods", "items.append(value)", "topic:python", "topic:arrays"] });
  });
  it("preserves unresolved/path-shaped IDs as lookup failures, never treats them as paths", async () => {
    const ids = ["../../etc/passwd", "/Users/test/file", "%2e%2e/", "file:///etc/passwd", "~/secret"];
    expect((await resolveStudioRelationships("references", ids)).unresolvedIds).toEqual(ids);
  });
  it("clones narrow output and never mutates registry records", async () => {
    const result = await searchStudioRelationships("concepts", "recursion");
    result.items[0].label.en = "changed";
    expect((await searchStudioRelationships("concepts", "recursion")).items[0].label.en).not.toBe("changed");
  });
  it("rejects oversized transport input", async () => {
    await expect(searchStudioRelationships("concepts", "x".repeat(121))).rejects.toThrow();
    await expect(resolveStudioRelationships("concepts", Array.from({ length: 41 }, () => "topic:arrays"))).rejects.toThrow();
  });
  it.each(["production", "test"])("rejects %s regardless of flag", async (environment) => {
    vi.stubEnv("NODE_ENV", environment);
    await expect(searchStudioRelationships("concepts", "")).rejects.toThrow();
    await expect(resolveStudioRelationships("exercises", ["exercise:array-linear-scan"])).rejects.toThrow();
  });
  it("rejects disabled development", async () => {
    vi.stubEnv("AUTHORING_STUDIO_ENABLED", "false");
    await expect(searchStudioRelationships("references", "")).rejects.toThrow();
  });
  it("validates transport kind, bounds, malformed options and duplicate result IDs", async () => {
    const result = await searchStudioRelationships("concepts", "recursion");
    expect(isRelationshipResponse(result, "problems")).toBe(false);
    expect(isRelationshipResponse({ ...result, items: [{ kind: "concepts", id: "broken" }] }, "concepts")).toBe(false);
    expect(isRelationshipResponse({ ...result, items: [result.items[0], result.items[0]] }, "concepts")).toBe(false);
  });
});

describe("canonical draft relationship semantics", () => {
  it("prevents new duplicates without silently repairing existing legacy duplicates", () => {
    expect(addRelationshipId(["topic:arrays"], "topic:arrays")).toEqual(["topic:arrays"]);
    expect(addRelationshipId(["old", "old"], "old")).toEqual(["old", "old"]);
  });
  it.each(["conceptIds", "prerequisiteLessonIds", "exerciseIds", "problemIds"] as const)("tracks %s changes/reversal without changing other roles or source", (field) => {
    const lesson = learnLessonById.get("learn:dsa:arrays");
    if (!lesson) throw new Error("Fixture missing");
    const source = { lesson, content: learnContentByLessonId.get(lesson.id) ?? null };
    const baseline = toAuthoringDraft(source);
    const draft = toAuthoringDraft(source);
    draft.lesson[field].push("transient-fixture-id");
    expect(isDraftDirty(draft, baseline)).toBe(true);
    expect(source.lesson[field]).toEqual(baseline.lesson[field]);
    draft.lesson[field].pop();
    expect(isDraftDirty(draft, baseline)).toBe(false);
  });
  it("requires single-block selection, preserves separate Related arrays and references item IDs", () => {
    expect(() => createRelationshipBlock("example", [])).toThrow();
    expect(() => createRelationshipBlock("exercise", [])).toThrow();
    expect(createRelationshipBlock("exercise", [], "exercise:array-linear-scan")).toEqual({ id: "exercise-1", type: "exercise", exerciseId: "exercise:array-linear-scan" });
    expect(createRelationshipBlock("references", [])).toMatchObject({ referenceIds: [] });
    expect(createRelationshipBlock("related", [])).toMatchObject({ lessonIds: [], problemIds: [] });
  });
  it.each(["example", "exercise", "references", "related"] as const)("includes %s-only changes and reversal in the existing dirty comparison", (type) => {
    const lesson = learnLessonById.get("learn:java:interfaces");
    if (!lesson) throw new Error("Fixture missing");
    const block = createRelationshipBlock(type, [], type === "example" ? "python-example-first-program" : "exercise:array-linear-scan");
    const baseline = toAuthoringDraft({ lesson, content: { lessonId: lesson.id, version: 1, reviewedAt: "", summary: { en: "", vi: "" }, blocks: [block] } });
    const draft = toAuthoringDraft(baseline);
    const changed = draft.content?.blocks[0];
    if (!changed || !draft.content) throw new Error("Missing block");
    if (changed.type === "example") changed.exampleId = "dsa-example-binary-search";
    if (changed.type === "exercise") changed.exerciseId = "exercise:binary-search-invariant";
    if (changed.type === "references") changed.referenceIds.push("python-ref-len");
    if (changed.type === "related") changed.problemIds.push("first-occurrence");
    expect(isDraftDirty(draft, baseline)).toBe(true);
    draft.content.blocks = [structuredClone(block)];
    expect(isDraftDirty(draft, baseline)).toBe(false);
  });
});

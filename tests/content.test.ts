import { describe, expect, it } from "vitest";
import { algorithms, domains, lessonBlocks, lessonExamples, lessonPlaygrounds, lessonReferences, lessons, searchIndex, sources, techniques, topics, validateContent } from "@/content";

describe("content registry", () => {
  it("has valid relationships", () => expect(validateContent()).toEqual([]));
  it("covers the requested atlas surface", () => {
    expect(domains).toHaveLength(10);
    expect(topics.length).toBeGreaterThanOrEqual(70);
    expect(algorithms).toHaveLength(10);
    expect(techniques).toHaveLength(20);
    expect(searchIndex.length).toBeGreaterThan(domains.length + topics.length + algorithms.length + techniques.length + 11);
    expect(sources).toHaveLength(4);
  });
  it("gives every domain distinct roadmap and mind-map models", () => {
    for (const domain of domains) {
      expect(domain.roadmap.nodes.length).toBeGreaterThan(1);
      expect(domain.mindMap.nodes.length).toBeGreaterThan(2);
      expect(domain.roadmap).not.toEqual(domain.mindMap);
    }
  });
  it("ships reference-quality vertical slices", () => {
    for (const id of ["complexity-analysis", "gradient-descent", "linear-regression"]) {
      const topic = topics.find((item) => item.id === id);
      expect(topic?.revision.contentLevel).toBe("Reference-quality");
      expect(topic?.content.length).toBeGreaterThanOrEqual(12);
      expect(topic?.content.filter((block) => block.type === "exercise").length).toBeGreaterThanOrEqual(3);
    }
  });

  it("projects governed Lesson metadata from the programming and AI starter curricula", () => {
    for (const topicId of ["complexity-analysis", "gradient-descent", "linear-regression"]) {
      const lesson = lessons.find((item) => item.topicId === topicId);
      expect(lesson).toMatchObject({ maturity: "Reference-quality", translationStatus: "complete", provenance: { source: "topic-registry", sourceId: topicId } });
      expect(lesson?.blockIds.length).toBeGreaterThanOrEqual(12);
      expect(lesson?.provenance.sourceIds.length).toBeGreaterThan(0);
      expect(lesson?.exampleIds.length).toBeGreaterThan(0);
      expect(lesson?.referenceIds.length).toBeGreaterThan(0);
    }
  });

  it("keeps syntax display capability separate from unavailable execution", () => {
    expect(lessonPlaygrounds.length).toBeGreaterThan(0);
    for (const playground of lessonPlaygrounds) {
      expect(playground.syntaxLanguage).toBeTruthy();
      expect(playground).toMatchObject({ runtime: "none", availability: "unavailable" });
    }
  });

  it("links references, examples, and block locale metadata to Lessons", () => {
    const blockIds = new Set(lessonBlocks.map((block) => block.id));
    const lessonIds = new Set(lessons.map((lesson) => lesson.id));
    expect(lessonReferences.length).toBeGreaterThan(0);
    expect(lessonExamples.length).toBeGreaterThan(0);
    for (const record of [...lessonReferences, ...lessonExamples]) {
      expect(lessonIds.has(record.lessonId)).toBe(true);
      expect(blockIds.has(record.blockId)).toBe(true);
    }
    expect(lessonBlocks.every((block) => block.availableLocales.includes("en"))).toBe(true);
  });
});

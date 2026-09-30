import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

import { isStudioEnabled, requireStudioEnabled } from "@/lib/studio/guard.server";
import * as reader from "@/lib/studio/content-reader.server";
import { getStudioCurriculum, getStudioLesson, getStudioOverview, getStudioSubjects } from "@/lib/studio/loaders.server";
import { learnSubjectsForNavigation } from "@/content/learn/registry";
import { isStudioLessonId, isStudioSubjectId, studioHref } from "@/lib/studio/navigation";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true");
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("Studio development boundary", () => {
  it.each([
    ["production", "true"], ["production", "false"], ["test", "true"],
    ["development", undefined], ["development", "false"], ["development", "1"],
    ["development", "TRUE"], ["development", " true "],
  ])("rejects %s with flag %s before invoking any reader", async (environment, flag) => {
    vi.stubEnv("NODE_ENV", environment);
    vi.stubEnv("AUTHORING_STUDIO_ENABLED", flag);
    const manifests = vi.spyOn(reader, "readStudioManifests");
    const bodies = vi.spyOn(reader, "readStudioLessonBody");
    expect(isStudioEnabled()).toBe(false);
    expect(requireStudioEnabled).toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(getStudioOverview()).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(getStudioSubjects()).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(getStudioCurriculum("python")).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(getStudioLesson("python", "learn:python:introduction")).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(manifests).not.toHaveBeenCalled();
    expect(bodies).not.toHaveBeenCalled();
    // Internal adapter entry points cannot bypass the same guard either.
    await expect(reader.readStudioManifests()).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(reader.readStudioLessonBody("learn:python:introduction")).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("requires the exact development AND explicit enablement combination", () => {
    expect(isStudioEnabled()).toBe(true);
    expect(requireStudioEnabled).not.toThrow();
  });
});

describe("Studio canonical read projections", () => {
  it("reports real manifest counts without reading lesson bodies or claiming validation", async () => {
    const bodies = vi.spyOn(reader, "readStudioLessonBody");
    const overview = await getStudioOverview();
    expect(overview).toEqual({
      subjectCount: 13, sectionCount: 58, lessonCount: 428,
      lessonStatuses: { COMPLETE: 9, PARTIAL: 0, SKELETON: 419, PLANNED: 0 },
      subjectStatuses: { COMPLETE: 0, PARTIAL: 2, SKELETON: 11, PLANNED: 0 },
      declaredBodySourceCount: 9, validationScan: "not-scanned",
    });
    const subjects = await getStudioSubjects();
    expect(subjects.map((subject) => subject.id)).toEqual(learnSubjectsForNavigation.map((subject) => subject.id));
    expect(subjects.find((subject) => subject.id === "python")).toMatchObject({ lessonCount: 152, sectionCount: 15, lessonStatuses: { COMPLETE: 5, SKELETON: 147 } });
    expect(subjects.every((subject) => !("sections" in subject))).toBe(true);
    await getStudioCurriculum("python");
    expect(bodies).not.toHaveBeenCalled();
  });

  it("preserves canonical section and lesson array order, loading only the selected curriculum", async () => {
    const subject = learnSubjectsForNavigation.find((item) => item.id === "java");
    const curriculum = await getStudioCurriculum("java");
    expect(curriculum?.sections.map((section) => section.id)).toEqual(subject?.sections.map((section) => section.id));
    expect(curriculum?.sections.flatMap((section) => section.lessons.map((lesson) => lesson.id))).toEqual(subject?.sections.flatMap((section) => section.lessons.map((lesson) => lesson.id)));
    expect(curriculum?.sections.flatMap((section) => section.lessons).every((lesson) => !("blocks" in lesson))).toBe(true);
    expect(curriculum?.sections.flatMap((section) => section.lessons).find((lesson) => lesson.slug === "interfaces")?.id).toBe("learn:java:interfaces");
  });

  it("loads one selected body, reports real absence, and returns detached inspection records", async () => {
    const bodies = vi.spyOn(reader, "readStudioLessonBody");
    const lesson = await getStudioLesson("python", "learn:python:introduction");
    expect(bodies).toHaveBeenCalledExactlyOnceWith("learn:python:introduction");
    expect(lesson?.learnerHref).toBe("/learn/python/introduction");
    expect(lesson?.content?.lessonId).toBe("learn:python:introduction");
    expect(lesson?.content?.blocks.length).toBeGreaterThan(0);
    if (lesson) lesson.lesson.title.en = "Transient inspection change";
    expect((await getStudioLesson("python", "learn:python:introduction"))?.lesson.title.en).toBe("Introduction");
    expect((await getStudioLesson("java", "learn:java:interfaces"))?.content).toBeNull();
  });

  it("rejects unknown or cross-subject selections before any body lookup", async () => {
    const bodies = vi.spyOn(reader, "readStudioLessonBody");
    expect(await getStudioCurriculum("unknown-subject")).toBeNull();
    expect(await getStudioLesson("python", "learn:java:interfaces")).toBeNull();
    expect(await getStudioLesson("python", "learn:python:nonexistent")).toBeNull();
    expect(await getStudioLesson("unknown-subject", "learn:python:introduction")).toBeNull();
    expect(bodies).not.toHaveBeenCalled();
  });

  it.each(["../../etc/passwd", "../package.json", "/Users/test/file", "~/secret", "file:///etc/passwd", "%2e%2e/", "python/../../x", "python\\..\\x", "python\u0000", "x".repeat(200)])("rejects path-shaped IDs: %s", async (id) => {
    const manifests = vi.spyOn(reader, "readStudioManifests");
    const bodies = vi.spyOn(reader, "readStudioLessonBody");
    expect(isStudioSubjectId(id)).toBe(false);
    expect(isStudioLessonId(id)).toBe(false);
    expect(await getStudioCurriculum(id)).toBeNull();
    expect(await getStudioLesson("python", id)).toBeNull();
    expect(manifests).not.toHaveBeenCalled();
    expect(bodies).not.toHaveBeenCalled();
  });

  it("constructs URL selections rather than filesystem paths", () => {
    expect(studioHref()).toBe("/studio");
    expect(studioHref("python")).toBe("/studio?subject=python");
    expect(new URL(studioHref("python", "learn:python:lists"), "https://atlas.test").searchParams.get("lesson")).toBe("learn:python:lists");
  });
});

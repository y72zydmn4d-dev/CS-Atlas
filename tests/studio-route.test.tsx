import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ connection: vi.fn(async () => {}) }));
import { connection } from "next/server";
import StudioPage from "@/app/studio/page";
import * as loaders from "@/lib/studio/loaders.server";

beforeEach(() => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); vi.clearAllMocks(); });
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("Studio route", () => {
  it.each([["development", undefined], ["production", "true"], ["test", "true"]])("404s in %s with flag %s before request waiting or content reads", async (environment, flag) => {
    vi.stubEnv("NODE_ENV", environment);
    vi.stubEnv("AUTHORING_STUDIO_ENABLED", flag);
    const overview = vi.spyOn(loaders, "getStudioOverview");
    const subjects = vi.spyOn(loaders, "getStudioSubjects");
    const curriculum = vi.spyOn(loaders, "getStudioCurriculum");
    const lesson = vi.spyOn(loaders, "getStudioLesson");
    await expect(StudioPage({ searchParams: Promise.resolve({ subject: "python", lesson: "learn:python:introduction" }) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(connection).not.toHaveBeenCalled();
    for (const loader of [overview, subjects, curriculum, lesson]) expect(loader).not.toHaveBeenCalled();
  });

  it("opens overview without reading curriculum or bodies", async () => {
    const curriculum = vi.spyOn(loaders, "getStudioCurriculum");
    const lesson = vi.spyOn(loaders, "getStudioLesson");
    const result = await StudioPage({ searchParams: Promise.resolve({}) });
    expect(result.props.overview.lessonCount).toBe(428);
    expect(result.props.curriculum).toBeNull();
    expect(result.props.inspection).toBeNull();
    expect(curriculum).not.toHaveBeenCalled();
    expect(lesson).not.toHaveBeenCalled();
  });

  it("loads metadata on subject selection and body only on lesson selection", async () => {
    const lesson = vi.spyOn(loaders, "getStudioLesson");
    const subjectPage = await StudioPage({ searchParams: Promise.resolve({ subject: "python" }) });
    expect(subjectPage.props.curriculum.subject.id).toBe("python");
    expect(lesson).not.toHaveBeenCalled();
    const lessonPage = await StudioPage({ searchParams: Promise.resolve({ subject: "python", lesson: "learn:python:introduction" }) });
    expect(lesson).toHaveBeenCalledExactlyOnceWith("python", "learn:python:introduction");
    expect(lessonPage.props.inspection.content.lessonId).toBe("learn:python:introduction");
  });

  it.each([
    { subject: ["python", "java"] }, { lesson: "learn:python:introduction" },
    { subject: "" }, { subject: "unknown" }, { subject: "python", lesson: "learn:java:interfaces" },
    { subject: "python", lesson: ["learn:python:introduction"] },
  ])("rejects malformed/unknown selection %j", async (query) => {
    await expect(StudioPage({ searchParams: Promise.resolve(query) })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});

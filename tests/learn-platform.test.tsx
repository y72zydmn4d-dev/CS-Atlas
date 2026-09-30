import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AtlasProvider } from "@/components/atlas-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { LessonWorkspace } from "@/components/learn/lesson-workspace";
import { SubjectHome } from "@/components/learn/subject-home";
import { learnContentByLessonId, learnExamples, learnLessonContent, learnQuizQuestions, learnReferences } from "@/content/learn/lesson-content";
import { learnLessonById, learnLessonByRoute, learnLessons, learnRouteAliases, learnSubjectBySlug, learnSubjects } from "@/content/learn/registry";
import { concepts } from "@/content/concepts/registry";
import { exercises } from "@/content/exercises";
import { problems } from "@/content/problems";
import { searchIndex } from "@/content";
import { flattenSubjectLessons, validateLearnPlatform } from "@/lib/domain/learn-platform";
import { storage } from "@/lib/storage";

function Providers({ children }: { children: React.ReactNode }) {
  return <LocaleProvider><AtlasProvider>{children}</AtlasProvider></LocaleProvider>;
}

afterEach(cleanup);
beforeEach(() => localStorage.clear());

describe("Learn subject manifests", () => {
  it("validates IDs, ordering, canonical relations, content sources, and route aliases", () => {
    expect(validateLearnPlatform({
      subjects: learnSubjects,
      lessonContent: learnLessonContent,
      examples: learnExamples,
      references: learnReferences,
      quizQuestions: learnQuizQuestions,
      aliases: learnRouteAliases,
      conceptIds: new Set(concepts.map((concept) => concept.id)),
      exerciseIds: new Set(exercises.map((exercise) => exercise.id)),
      problemIds: new Set(problems.map((problem) => problem.id)),
    })).toEqual([]);
    for (const subject of learnSubjects) {
      expect(subject.sections.map((section) => section.order)).toEqual(subject.sections.map((_, index) => index + 1));
      for (const section of subject.sections) expect(section.lessons.map((lesson) => lesson.order)).toEqual(section.lessons.map((_, index) => index + 1));
    }
    for (const alias of learnRouteAliases) expect(learnLessonById.get(alias.lessonId)).toBeDefined();
  });

  it("publishes breadth honestly and keeps authored lesson counts exact", () => {
    expect(learnSubjects).toHaveLength(13);
    expect(Object.fromEntries(learnSubjects.map((subject) => [subject.id, flattenSubjectLessons(subject).length]))).toEqual({
      python: 152,
      dsa: 110,
      c: 14,
      cpp: 12,
      java: 12,
      javascript: 20,
      html: 16,
      css: 18,
      sql: 13,
      numpy: 11,
      pandas: 13,
      "machine-learning": 28,
      pytorch: 9,
    });
    expect(learnLessons).toHaveLength(428);
    expect(learnLessonContent).toHaveLength(9);
    expect(learnLessons.filter((lesson) => lesson.status === "COMPLETE")).toHaveLength(9);
    expect(learnSubjects.find((subject) => subject.id === "python")?.status).toBe("PARTIAL");
    expect(learnSubjects.find((subject) => subject.id === "pytorch")?.status).toBe("SKELETON");
  });

  it("keeps runtime capability separate from syntax language", () => {
    expect(learnExamples.some((example) => example.language === "python" && example.runtime === "none")).toBe(true);
    expect(learnExamples.filter((example) => example.runtime === "browser-quickjs").every((example) => example.language === "javascript")).toBe(true);
    expect(learnExamples.some((example) => example.runtime === "remote-judge")).toBe(false);
  });

  it("projects subjects, sections, lessons and references into unified search", () => {
    expect(searchIndex.some((item) => item.type === "Subject" && item.href === "/learn/python")).toBe(true);
    expect(searchIndex.some((item) => item.type === "Section" && item.href.startsWith("/learn/dsa/tutorial#"))).toBe(true);
    expect(searchIndex.some((item) => item.type === "Lesson" && item.href === "/learn/dsa/binary-search")).toBe(true);
    expect(searchIndex.some((item) => item.type === "Reference" && item.href === "/learn/python/reference/list-append")).toBe(true);
  });
});

describe("Learn workspace behavior", () => {
  it("uses the same manifest curriculum on the subject home without a redundant curriculum action", async () => {
    const subject = learnSubjectBySlug.get("python");
    if (!subject) throw new Error("Missing Python subject");
    render(<Providers><SubjectHome subject={subject} /></Providers>);
    expect(screen.getByRole("complementary", { name: "Python curriculum" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tutorial home" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: /View curriculum/i })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Getting started" })).toHaveAttribute("aria-expanded", "true"));
    expect(screen.getByRole("button", { name: "Variables" })).toHaveAttribute("aria-expanded", "false");
  });

  it("starts with only the active curriculum group expanded when no preference exists", async () => {
    const subject = learnSubjectBySlug.get("python");
    const lesson = learnLessonByRoute.get("python/lists");
    if (!subject || !lesson) throw new Error("Missing Learn fixture");
    render(<Providers><LessonWorkspace subject={subject} lesson={lesson} content={learnContentByLessonId.get(lesson.id)} /></Providers>);
    await waitFor(() => expect(screen.getByRole("button", { name: "Collections" })).toHaveAttribute("aria-expanded", "true"));
    expect(screen.getByRole("button", { name: "Getting started" })).toHaveAttribute("aria-expanded", "false");
  });

  it("shows active curriculum state, restores collapse state, records start and completion, and exposes the mobile drawer contract", async () => {
    const subject = learnSubjectBySlug.get("dsa");
    const lesson = learnLessonByRoute.get("dsa/binary-search");
    if (!subject || !lesson) throw new Error("Missing Learn fixture");
    storage.saveLearnNavigation(subject.id, { scrollTop: 24, collapsedSectionIds: [subject.sections[0].id] });
    const { container } = render(<Providers><LessonWorkspace subject={subject} lesson={lesson} content={learnContentByLessonId.get(lesson.id)} /></Providers>);
    await waitFor(() => expect(storage.loadLearningEvents().some((event) => event.type === "lesson-started" && event.target?.id === lesson.id)).toBe(true));
    expect(container.querySelector('a[aria-current="page"]')).toHaveTextContent("Binary Search");
    const firstSectionButton = screen.getByRole("button", { name: subject.sections[0].title.en });
    await waitFor(() => expect(firstSectionButton).toHaveAttribute("aria-expanded", "false"));
    const drawerButton = screen.getByRole("button", { name: "Curriculum" });
    fireEvent.click(drawerButton);
    expect(drawerButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "Data Structures & Algorithms curriculum" })).toHaveAttribute("aria-modal", "true");
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(drawerButton).toHaveFocus());
    fireEvent.click(screen.getByRole("button", { name: "Mark complete" }));
    await waitFor(() => expect(storage.loadLearningEvents().some((event) => event.type === "lesson-completed" && event.target?.id === lesson.id)).toBe(true));
  });

  it("derives deterministic previous and next order from manifest sections", () => {
    const subject = learnSubjectBySlug.get("python");
    if (!subject) throw new Error("Missing Python subject");
    const lessons = flattenSubjectLessons(subject);
    const lists = lessons.findIndex((lesson) => lesson.slug === "lists");
    expect(lessons[lists - 1]?.slug).toBe("precedence");
    expect(lessons[lists + 1]?.slug).toBe("access-lists");
  });
});

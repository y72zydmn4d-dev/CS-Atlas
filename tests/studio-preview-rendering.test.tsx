import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const runtime = vi.hoisted(() => ({ construct: vi.fn(), run: vi.fn() }));
vi.mock("@/lib/practice/runner", () => ({ BrowserPracticeRunner: class { constructor() { runtime.construct(); } run = runtime.run; } }));
import { LessonContentSurface } from "@/components/learn/lesson-content-surface";
import { LearnRenderEnvironment } from "@/components/learn/learn-render-environment";
import { ExampleRunner } from "@/components/learn/example-runner";
import { LocaleProvider } from "@/components/locale-provider";
import { storage } from "@/lib/storage";
import { libraryRepository } from "@/lib/library/repository";
import { searchIndex } from "@/content";
import type { LearnLessonBlock } from "@/lib/domain/learn-platform";
import { validationDraft, validationContext } from "./learn-validation-fixtures";
import { previewFixture } from "./studio-preview-fixtures";
import { renderWithLocale } from "./test-utils";

beforeEach(() => { localStorage.clear(); runtime.construct.mockClear(); runtime.run.mockReset(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function surface(id = "learn:python:lists", locale: "en" | "vi" = "en", mode: "learner" | "author-preview" = "author-preview") {
  const { model } = previewFixture(validationDraft(id)); if (!model) throw Error("model");
  return <LearnRenderEnvironment mode={mode} locale={locale}><LessonContentSurface lesson={model.lesson} content={model.content ?? undefined} context={model.context} resources={model.resources} /></LearnRenderEnvironment>;
}
const learnerSnapshot = () => ({ events: storage.loadLearningEvents(), bookmarks: storage.loadBookmarks(), progress: storage.loadProgress(), exercises: storage.loadExercises(), attempts: storage.loadExerciseAttempts(), practice: storage.loadPractice(), goals: storage.loadLearningGoals(), plans: storage.loadStudyPlans(), navigation: storage.loadLearnNavigation("python") });

describe("one shared Learn presentation / isolated author environment", () => {
  it("renders every canonical block variant through the real shared surface", () => {
    const context = validationContext(); const draft = validationDraft("learn:java:interfaces");
    const text = (en: string) => ({ en, vi: "" });
    const example = context.examples.keys().next().value; const reference = context.references.keys().next().value; const exercise = context.exerciseIds.values().next().value; const problem = context.problemIds.values().next().value;
    if (!example || !reference || !exercise || !problem) throw Error("registry fixtures");
    const blocks: LearnLessonBlock[] = [
      { id: "p", type: "paragraph", body: text("Draft prose") }, { id: "o", type: "objectives", items: [text("Objective")] },
      { id: "h", type: "heading", level: 2, text: text("Heading") }, { id: "l", type: "list", ordered: true, items: [text("List item")] },
      { id: "d", type: "definition", term: "Term", body: text("Definition") }, { id: "s", type: "syntax", language: "java", code: "interface Foo {}" },
      { id: "c", type: "code", language: "java", code: "class Foo {}", caption: text("Caption") }, { id: "e", type: "example", exampleId: example },
      { id: "out", type: "output", output: "42" }, { id: "note", type: "callout", tone: "warning", body: text("Warning body") },
      { id: "t", type: "table", columns: [text("Column")], rows: [["Cell"]] }, { id: "compare", type: "comparison", columns: [text("Property")], rows: [{ label: text("Row"), values: [text("Value")] }] },
      { id: "cost", type: "complexity", time: "O(n)", space: "O(1)", body: text("Complexity body") }, { id: "practice", type: "exercise", exerciseId: exercise },
      { id: "refs", type: "references", referenceIds: [reference] }, { id: "related", type: "related", lessonIds: ["learn:python:introduction"], problemIds: [problem] },
    ];
    draft.content = { lessonId: draft.lesson.id, version: 1, reviewedAt: "", summary: text("Summary"), blocks };
    const { model, report } = previewFixture(draft); expect(report.renderable).toBe(true); if (!model) throw Error("model");
    const { container } = renderWithLocale(<LearnRenderEnvironment mode="author-preview" locale="en"><LessonContentSurface {...model} content={model.content ?? undefined} /></LearnRenderEnvironment>);
    for (const block of blocks) expect(container.querySelector(`#${block.id}`), block.type).not.toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Interfaces" })).toBeVisible();
    expect(screen.getByText("Objective")).toBeVisible(); expect(screen.getByText("Caption")).toBeVisible();
    expect(screen.getAllByRole("table")).toHaveLength(2); expect(screen.getByText("Cell")).toBeVisible();
    expect(screen.getByRole("link", { name: /Open exercise/ })).toHaveAttribute("href", `/exercises/${exercise}`);
    expect(screen.getByRole("link", { name: /Problem ·/ })).toHaveAttribute("href", `/problems/${problem}`);
    for (const link of screen.getAllByRole("link")) { expect(link).toHaveAttribute("target", "_blank"); expect(link).toHaveAttribute("rel", "noopener noreferrer"); }
  });
  it("uses identical learner article markup for pure content in both modes, not a Studio renderer", () => {
    const draft = validationDraft(); if (!draft.content) throw Error("body");
    draft.content.blocks = draft.content.blocks.filter((block) => !["example", "related", "exercise", "references"].includes(block.type));
    const { model } = previewFixture(draft); if (!model) throw Error("model");
    const view = renderWithLocale(<LearnRenderEnvironment mode="learner" locale="en"><LessonContentSurface {...model} content={model.content ?? undefined} /></LearnRenderEnvironment>);
    const learner = view.container.querySelector("article")?.outerHTML;
    view.rerender(<LocaleProvider><LearnRenderEnvironment mode="author-preview" locale="en"><LessonContentSurface {...model} content={model.content ?? undefined} /></LearnRenderEnvironment></LocaleProvider>);
    expect(view.container.querySelector("article")?.outerHTML).toEqual(learner);
  });
  it("cannot write evidence/completion/bookmarks/resume/mastery/plans/Library/Search or request AI/runtime", async () => {
    storage.saveLearningEvents([{ id: "seed-event", type: "lesson-started", conceptId: "topic:recursion", occurredAt: "2026-01-01T00:00:00.000Z", source: "browser-local", target: { type: "lesson", id: "learn:python:introduction" } }]);
    storage.saveBookmarks([{ id: "seed-bookmark", type: "lesson", title: "Introduction", href: "/learn/python/introduction", context: "Python", createdAt: 1767225600000 }]);
    storage.saveLearnNavigation("python", { scrollTop: 42, collapsedSectionIds: ["learn-section:python:getting-started"] });
    const before = learnerSnapshot(); const index = JSON.stringify(searchIndex);
    const writers = [vi.spyOn(storage, "saveLearningEvents"), vi.spyOn(storage, "saveBookmarks"), vi.spyOn(storage, "saveProgress"), vi.spyOn(storage, "saveExercises"), vi.spyOn(storage, "saveExerciseAttempts"), vi.spyOn(storage, "savePractice"), vi.spyOn(storage, "saveLearningGoals"), vi.spyOn(storage, "saveStudyPlans"), vi.spyOn(storage, "saveLearnNavigation"), vi.spyOn(storage, "loadOrCreateLegacyLearningMigration"), vi.spyOn(libraryRepository, "create"), vi.spyOn(libraryRepository, "update"), vi.spyOn(libraryRepository, "remove"), vi.spyOn(libraryRepository, "putFile"), vi.spyOn(libraryRepository, "importMetadata")];
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch); const clipboard = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: clipboard } });
    renderWithLocale(surface());
    expect(screen.queryByRole("button", { name: /Mark complete|Bookmark/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Atlas AI|Previous|Next/ })).not.toBeInTheDocument();
    for (const button of screen.getAllByRole("button", { name: "Run" })) { expect(button).toBeDisabled(); fireEvent.click(button); }
    for (const area of screen.getAllByLabelText("Example source")) expect(area).toHaveAttribute("readonly");
    fireEvent.click(screen.getAllByRole("button", { name: "Copy" })[0]); await waitFor(() => expect(clipboard).toHaveBeenCalled());
    expect(runtime.construct).not.toHaveBeenCalled(); expect(runtime.run).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
    for (const writer of writers) expect(writer).not.toHaveBeenCalled();
    expect(learnerSnapshot()).toEqual(before); expect(JSON.stringify(searchIndex)).toBe(index);
    expect(storage.loadLearningEvents().toReversed().find((event) => event.target?.type === "lesson")?.target?.id).toBe("learn:python:introduction");
  });
  it("renders honest Skeleton fallback and selected VI without changing global locale", () => {
    const view = renderWithLocale(surface("learn:java:interfaces", "vi"));
    expect(screen.getByText("Bài học này chưa được biên soạn đầy đủ")).toBeVisible();
    expect(screen.getAllByText("SKELETON").length).toBeGreaterThan(0); expect(view.container.querySelector("article")).toHaveClass("learn-lesson-article");
  });
  it("displays hostile-looking prose and educational code as literal text, never HTML/scripts/unsafe links", () => {
    const draft = validationDraft(); if (!draft.content) throw Error("body");
    const malicious = '<script>alert(1)</script><img src=x onerror="evil()"> [link](javascript:evil())';
    draft.content.blocks = [{ id: "prose", type: "paragraph", body: { en: malicious, vi: "" } }, { id: "html-code", type: "code", language: "html", code: malicious }];
    const { model } = previewFixture(draft); if (!model) throw Error("model");
    const { container } = renderWithLocale(<LearnRenderEnvironment mode="author-preview" locale="en"><LessonContentSurface {...model} content={model.content ?? undefined} /></LearnRenderEnvironment>);
    expect(screen.getAllByText(malicious)).toHaveLength(2);
    expect(container.querySelector("script,img,[onerror],[onclick],a[href^='javascript:']")).toBeNull();
    expect(container.querySelector("code")?.textContent).toBe(malicious);
  });
  it("retains the default learner QuickJS boundary and ordinary link behavior", async () => {
    const example = [...validationContext().examples.values()].find((item) => item.runtime === "browser-quickjs"); if (!example) throw Error("QuickJS fixture");
    runtime.run.mockResolvedValue({ verdict: "accepted", tests: [{ actual: 42 }], durationMs: 1, scope: "public" });
    renderWithLocale(<ExampleRunner example={example} />);
    expect(screen.getByRole("button", { name: "Run" })).toBeEnabled(); expect(screen.getByLabelText("Example source")).not.toHaveAttribute("readonly");
    expect(screen.getByRole("link", { name: /Open Playground/ })).not.toHaveAttribute("target");
    fireEvent.click(screen.getByRole("button", { name: "Run" })); await waitFor(() => expect(runtime.run).toHaveBeenCalledOnce());
    expect(runtime.construct).toHaveBeenCalledOnce(); expect(runtime.run).toHaveBeenCalledWith(expect.objectContaining({ id: `learn-example:${example.id}` }), example.starterSource);
    expect(await screen.findByText("Output")).toBeVisible();
  });
});

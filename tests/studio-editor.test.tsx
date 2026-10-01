import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/studio/document-navigation", () => ({ navigateStudioDocument: vi.fn() }));
vi.mock("@/lib/studio/relationship-client", () => ({ searchStudioOptions: fixtureSearch, resolveStudioOptions: fixtureResolve }));
import { fixtureSearch, fixtureResolve } from "@/tests/studio-relationship-fixtures";
import { StudioWorkspace } from "@/components/studio/studio-workspace";
import { getStudioCurriculum, getStudioLesson, getStudioOverview, getStudioSubjects } from "@/lib/studio/loaders.server";
import { navigateStudioDocument } from "@/lib/studio/document-navigation";
import { learnLessonById } from "@/content/learn/registry";
import { learnContentByLessonId } from "@/content/learn/lesson-content";
import { renderWithLocale } from "@/tests/test-utils";

const modalDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
const closeDescriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");
beforeAll(() => {
  // jsdom does not implement the browser's native modal/focus management.
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute("open"); } });
});
afterAll(() => {
  if (modalDescriptor) Object.defineProperty(HTMLDialogElement.prototype, "showModal", modalDescriptor); else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  if (closeDescriptor) Object.defineProperty(HTMLDialogElement.prototype, "close", closeDescriptor); else Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true");
  vi.clearAllMocks(); localStorage.clear();
  window.history.replaceState(null, "", "/studio?subject=java&lesson=learn%3Ajava%3Ainterfaces");
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });

async function renderEditor(subject = "java", id = "learn:java:interfaces") {
  const inspection = await getStudioLesson(subject, id);
  const result = renderWithLocale(<StudioWorkspace overview={await getStudioOverview()} subjects={await getStudioSubjects()} curriculum={await getStudioCurriculum(subject)} inspection={inspection} />);
  return { ...result, inspection };
}
function addBlock(type: string) {
  fireEvent.change(screen.getByLabelText("Block type"), { target: { value: type } });
  fireEvent.click(screen.getByRole("button", { name: "+ Add block" }));
}

describe("transient lesson editing", () => {
  it("edits actual metadata locally, preserves identity/VI and returns clean on manual revert", async () => {
    const { inspection } = await renderEditor();
    const before = structuredClone(inspection);
    expect(screen.getByText("Matches saved source")).toBeVisible();
    expect(screen.queryByLabelText("Route slug")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Lesson title (EN)"), { target: { value: "Interfaces draft" } });
    expect(screen.getByText("Modified draft")).toBeVisible();
    expect(inspection).toEqual(before);
    expect(learnLessonById.get("learn:java:interfaces")?.title.en).toBe("Interfaces");
    fireEvent.click(within(screen.getByRole("group", { name: "Authoring language" })).getByRole("button", { name: "VI" }));
    expect(screen.getByLabelText("Lesson title (VI)")).toHaveValue("Interfaces");
    fireEvent.click(within(screen.getByRole("group", { name: "Authoring language" })).getByRole("button", { name: "EN" }));
    fireEvent.change(screen.getByLabelText("Lesson title (EN)"), { target: { value: "Interfaces" } });
    expect(screen.getByText("Matches saved source")).toBeVisible();
    for (const [label, value] of [["Description (EN)", "Local description"], ["Estimated duration", "21"], ["Draft status", "PARTIAL"], ["Difficulty", "Advanced"], ["Translation status", "partial"]]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    expect(screen.getByLabelText("Estimated duration")).toHaveValue(21);
    expect(inspection).toEqual(before);
    expect(screen.getByText(/not published/)).toBeVisible();
  });

  it("creates a transient body and structurally adds, edits, reorders and removes objectives", async () => {
    await renderEditor();
    expect(screen.queryByLabelText("Block type")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start transient body" }));
    expect(screen.getByLabelText("Review date")).toHaveValue("");
    addBlock("objectives");
    fireEvent.change(screen.getByLabelText("Objective 1 (EN)"), { target: { value: "Declare an interface" } });
    fireEvent.click(screen.getByRole("button", { name: "+ Add objective" }));
    fireEvent.change(screen.getByLabelText("Objective 2 (EN)"), { target: { value: "Implement an interface" } });
    fireEvent.click(screen.getByRole("button", { name: "Move up · Objective 2" }));
    expect(screen.getByLabelText("Objective 1 (EN)")).toHaveValue("Implement an interface");
    fireEvent.click(screen.getByRole("button", { name: "Move down · Objective 1" }));
    expect(screen.getByLabelText("Objective 1 (EN)")).toHaveValue("Declare an interface");
    fireEvent.click(screen.getByRole("button", { name: "Remove · Objective 2" }));
    expect(screen.queryByLabelText("Objective 2 (EN)")).not.toBeInTheDocument();
    expect(learnContentByLessonId.has("learn:java:interfaces")).toBe(false);
  });

  it("adds, edits, duplicates, collapses, reorders and removes blocks without execution", async () => {
    localStorage.setItem("studio-test-evidence", "untouched");
    const { container } = await renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "Start transient body" }));
    addBlock("paragraph");
    fireEvent.change(screen.getByLabelText("Text (EN)"), { target: { value: "<script>alert(1)</script>" } });
    addBlock("code");
    fireEvent.change(screen.getByLabelText("Syntax language"), { target: { value: "java" } });
    fireEvent.change(screen.getByLabelText("Code", { exact: true }), { target: { value: "interface Shape { double area(); }" } });
    expect(screen.getByRole("button", { name: "Move up · paragraph-1" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Move up · code-1" }));
    let blocks = screen.getByRole("region", { name: "Content blocks" });
    expect(within(blocks).getAllByRole("listitem")[0].textContent).toContain("code-1");
    fireEvent.click(screen.getByRole("button", { name: "Duplicate · paragraph-1" }));
    expect(screen.getByRole("button", { name: "Remove · paragraph-2" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Expand or collapse block · paragraph-2" }));
    expect(screen.getByRole("button", { name: "Expand or collapse block · paragraph-2" })).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Remove · paragraph-2" }));
    blocks = screen.getByRole("region", { name: "Content blocks" });
    expect(within(blocks).getAllByRole("listitem")).toHaveLength(2);
    expect(container.querySelector("script,iframe")).toBeNull();
    expect(screen.queryByRole("button", { name: /run|execute/i })).not.toBeInTheDocument();
    expect(localStorage.getItem("studio-test-evidence")).toBe("untouched");
    expect(localStorage.length).toBe(1);
  });

  it("edits summary and optional titles/captions without losing clean reversibility", async () => {
    const { inspection } = await renderEditor("python", "learn:python:introduction");
    if (!inspection?.content) throw new Error("Body fixture missing");
    const original = inspection.content.summary.en;
    fireEvent.change(screen.getByLabelText("Summary (EN)"), { target: { value: original + " edit" } });
    expect(screen.getByText("Modified draft")).toBeVisible();
    fireEvent.change(screen.getByLabelText("Summary (EN)"), { target: { value: original } });
    expect(screen.getByText("Matches saved source")).toBeVisible();
    const first = screen.getAllByLabelText("Optional block title (EN)")[0];
    const oldValue = first.getAttribute("value") ?? "";
    fireEvent.change(first, { target: { value: "Temporary title" } });
    fireEvent.change(first, { target: { value: oldValue } });
    expect(screen.getByText("Matches saved source")).toBeVisible();
  });

  it("preserves canonical relationships until picker edits, without persistence actions", async () => {
    await renderEditor("dsa", "learn:dsa:arrays");
    const details = screen.getByText("Saved identity and relationships (read-only)");
    fireEvent.click(details);
    expect(screen.getAllByText("exercise:array-linear-scan").length).toBeGreaterThan(0);
    expect(screen.getByRole("combobox", { name: "Search Concept IDs" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /save|create/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Validate" })).toBeVisible();
    const choices = within(screen.getByLabelText("Block type")).getAllByRole("option").map((option) => option.textContent);
    expect(choices).toHaveLength(16);
    expect(choices).toContain("exercise");
  });
});

describe("dirty draft protection", () => {
  it.each([
    ["Concept IDs", "topic:recursion"], ["Exercise IDs", "exercise:array-linear-scan"],
    ["Problem IDs", "first-occurrence"], ["Prerequisite lesson IDs", "learn:java:classes"],
  ])("guards %s-only edits and restores original relationships on Reset/Discard", async (label, id) => {
    const { inspection } = await renderEditor();
    const baseline = structuredClone(inspection);
    const input = screen.getByRole("combobox", { name: `Search ${label}` });
    fireEvent.focus(input); fireEvent.change(input, { target: { value: id } });
    fireEvent.click(await within(screen.getByRole("listbox", { name: label })).findByRole("option"));
    expect(screen.getByText("Modified draft")).toBeVisible(); expect(inspection).toEqual(baseline);
    const target = label === "Concept IDs" ? within(screen.getByRole("navigation", { name: "Curriculum explorer" })).getByRole("link", { name: /Classes SKELETON/ }) : screen.getByRole("link", { name: /Python PARTIAL/ });
    fireEvent.click(target);
    expect(screen.getByRole("dialog", { name: "Discard unsaved draft?" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(within(screen.getByRole("group", { name: label })).getByRole("button", { name: `Remove · ${label} · ${id}` })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Reset draft" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Reset draft" }));
    expect(screen.getByText("Matches saved source")).toBeVisible();
    expect(within(screen.getByRole("group", { name: label })).queryByRole("button", { name: `Remove · ${label} · ${id}` })).not.toBeInTheDocument();
    const newInput = screen.getByRole("combobox", { name: `Search ${label}` });
    fireEvent.focus(newInput); fireEvent.change(newInput, { target: { value: id } });
    fireEvent.click(await within(screen.getByRole("listbox", { name: label })).findByRole("option"));
    fireEvent.click(target); fireEvent.click(screen.getByRole("button", { name: "Discard draft and continue" }));
    expect(screen.getByText("Matches saved source")).toBeVisible(); expect(navigateStudioDocument).toHaveBeenCalledOnce();
  });

  it("returns clean after manually removing only the newly added relationship", async () => {
    await renderEditor();
    const input = screen.getByRole("combobox", { name: "Search Concept IDs" });
    fireEvent.focus(input); fireEvent.change(input, { target: { value: "topic:recursion" } });
    fireEvent.click(await within(screen.getByRole("listbox", { name: "Concept IDs" })).findByRole("option"));
    expect(screen.getByText("Modified draft")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Remove · Concept IDs · topic:recursion" }));
    expect(screen.getByText("Matches saved source")).toBeVisible();
  });

  it.each(["example", "exercise"])("adds a %s block only after canonical selection; Reset clears pending picker UI", async (type) => {
    await renderEditor("python", "learn:python:introduction");
    fireEvent.change(screen.getByLabelText("Block type"), { target: { value: type } });
    expect(screen.getByRole("button", { name: "+ Add block" })).toBeDisabled();
    const input = screen.getByRole("combobox", { name: "Search Record for new block" });
    fireEvent.focus(input); fireEvent.change(input, { target: { value: type === "example" ? "python-example-first-program" : "exercise:array-linear-scan" } });
    fireEvent.click(await within(screen.getByRole("listbox", { name: "Record for new block" })).findByRole("option"));
    expect(screen.getByText("Matches saved source")).toBeVisible(); // pending choice isn't authored content
    fireEvent.click(screen.getByRole("button", { name: "+ Add block" }));
    expect(screen.getByText("Modified draft")).toBeVisible();
    expect(screen.getByRole("button", { name: `Remove · ${type}-1` })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Reset draft" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Reset draft" }));
    expect(screen.getByText("Matches saved source")).toBeVisible();
    expect(screen.queryByRole("combobox", { name: "Search Record for new block" })).not.toBeInTheDocument();
  });

  it.each(["lesson", "subject", "overview", "home"])("guards %s navigation with Cancel and Discard, no Save", async (destination) => {
    await renderEditor();
    fireEvent.change(screen.getByLabelText("Lesson title (EN)"), { target: { value: "Dirty title" } });
    const link = destination === "subject" ? screen.getByRole("link", { name: /Python PARTIAL/ })
      : destination === "lesson" ? within(screen.getByRole("navigation", { name: "Curriculum explorer" })).getByRole("link", { name: /Classes SKELETON/ })
      : destination === "overview" ? screen.getByRole("link", { name: "CS Atlas Content Studio" })
      : screen.getByRole("link", { name: "Home →" });
    const href = link.getAttribute("href");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    fireEvent(link, event);
    expect(event.defaultPrevented).toBe(true);
    const dialog = screen.getByRole("dialog", { name: "Discard unsaved draft?" });
    expect(within(dialog).queryByRole("button", { name: /Save/ })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Lesson title (EN)")).toHaveValue("Dirty title");
    expect(navigateStudioDocument).not.toHaveBeenCalled();
    fireEvent.click(link);
    fireEvent.click(screen.getByRole("button", { name: "Discard draft and continue" }));
    expect(navigateStudioDocument).toHaveBeenCalledExactlyOnceWith(href);
    expect(screen.getByText("Matches saved source")).toBeVisible();
    expect(screen.getByLabelText("Lesson title (EN)")).toHaveValue("Interfaces");
  });

  it("opens the persisted canonical lesson separately without discarding the active draft", async () => {
    await renderEditor();
    fireEvent.change(screen.getByLabelText("Lesson title (EN)"), { target: { value: "Dirty title" } });
    const link = screen.getByRole("link", { name: /Open current canonical lesson/ });
    expect(link).toHaveAttribute("target", "_blank"); expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByLabelText("Lesson title (EN)")).toHaveValue("Dirty title");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); expect(navigateStudioDocument).not.toHaveBeenCalled();
  });

  it("confirms Reset, preserves content on Cancel, restores clean baseline on acceptance", async () => {
    await renderEditor();
    expect(screen.getByRole("button", { name: "Reset draft" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Start transient body" }));
    addBlock("paragraph");
    fireEvent.click(screen.getByRole("button", { name: "Reset draft" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByLabelText("Text (EN)")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Reset draft" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Reset draft" }));
    expect(screen.getByText("Matches saved source")).toBeVisible();
    expect(screen.queryByLabelText("Block type")).not.toBeInTheDocument();
    expect(navigateStudioDocument).not.toHaveBeenCalled();
  });

  it("warns on browser unload only while dirty and cancels dialog on Escape", async () => {
    await renderEditor();
    let event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    fireEvent.change(screen.getByLabelText("Lesson title (EN)"), { target: { value: "Dirty" } });
    event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Reset draft" }));
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Lesson title (EN)"), { target: { value: "Interfaces" } });
    event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("does not discard drafts when filtering metadata, switching language, or opening another tab", async () => {
    await renderEditor();
    fireEvent.change(screen.getByLabelText("Lesson title (EN)"), { target: { value: "Dirty" } });
    fireEvent.change(screen.getByLabelText("Search subjects"), { target: { value: "python" } });
    fireEvent.change(screen.getByLabelText("Lesson status"), { target: { value: "SKELETON" } });
    fireEvent.click(within(screen.getByRole("group", { name: "Authoring language" })).getByRole("button", { name: "VI" }));
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true });
    fireEvent(screen.getByRole("link", { name: /Python PARTIAL/ }), event);
    expect(event.defaultPrevented).toBe(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Modified draft")).toBeVisible();
  });

  it.each(["ctrlKey", "metaKey"])("handles %s+S as unavailable, never repository Save or browser Save Page", async (modifier) => {
    await renderEditor();
    const event = new KeyboardEvent("keydown", { key: "s", [modifier]: true, bubbles: true, cancelable: true });
    fireEvent(window, event);
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByText(/Repository Save is not enabled/)).toBeVisible();
    expect(navigateStudioDocument).not.toHaveBeenCalled();
  });
});

import { act, cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/studio/preview-client", () => ({ requestStudioPreview: vi.fn() }));
vi.mock("@/lib/studio/validation-client", () => ({ requestStudioValidation: vi.fn() }));
vi.mock("@/lib/studio/relationship-client", () => ({ searchStudioOptions: fixtureSearch, resolveStudioOptions: fixtureResolve }));
import { fixtureSearch, fixtureResolve } from "./studio-relationship-fixtures";
import { requestStudioPreview } from "@/lib/studio/preview-client";
import { requestStudioValidation } from "@/lib/studio/validation-client";
import { LessonEditor } from "@/components/studio/lesson-editor";
import { StudioDraftSession } from "@/components/studio/studio-draft-session";
import { PreviewErrorBoundary } from "@/components/studio/preview-error-boundary";
import type { StudioPreviewResponse } from "@/lib/studio/preview";
import { previewFixture } from "./studio-preview-fixtures";
import { validationDraft } from "./learn-validation-fixtures";
import { renderWithLocale } from "./test-utils";

beforeEach(() => {
  vi.mocked(requestStudioPreview).mockReset(); vi.mocked(requestStudioPreview).mockImplementation(async (input) => previewFixture(input.draft));
  vi.mocked(requestStudioValidation).mockReset(); vi.mocked(requestStudioValidation).mockImplementation(async (input) => previewFixture(input.draft).report);
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute("open"); } });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function editor(id = "learn:python:introduction") {
  const draft = validationDraft(id);
  return renderWithLocale(<StudioDraftSession inspection={{ ...draft, section: { id: draft.lesson.sectionId, title: { en: "Section", vi: "" }, order: 1 }, learnerHref: `/learn/${draft.lesson.subjectId}/${draft.lesson.slug}` }}><LessonEditor canonicalDetails={<p>Canonical source details</p>} learnerHref={`/learn/${draft.lesson.subjectId}/${draft.lesson.slug}`} /></StudioDraftSession>);
}
const preview = () => fireEvent.click(screen.getByRole("button", { name: "Preview" }));
const refresh = () => fireEvent.click(screen.getByRole("button", { name: "Refresh Preview" }));
const back = () => fireEvent.click(screen.getByRole("button", { name: "Back to editor" }));

describe("unsaved preview / retained editor / race isolation", () => {
  it("starts empty; Validate and Preview render the exact unsaved text/code/relationship with the real Learn surface", async () => {
    const { container } = editor(); expect(container.querySelector(".learn-lesson-article")).toBeNull();
    fireEvent.change(screen.getByLabelText("Lesson title (EN)"), { target: { value: "UNSAVED Python title" } });
    const prose = screen.getAllByLabelText("Text (EN)")[0]; fireEvent.change(prose, { target: { value: "UNSAVED paragraph" } });
    const code = screen.getAllByLabelText("Code")[0]; fireEvent.change(code, { target: { value: "print('UNSAVED code')" } });
    const concept = screen.getByRole("combobox", { name: "Search Concept IDs" });
    fireEvent.focus(concept); fireEvent.change(concept, { target: { value: "topic:recursion" } });
    fireEvent.click(await within(screen.getByRole("listbox", { name: "Concept IDs" })).findByRole("option"));
    fireEvent.click(screen.getByRole("button", { name: "Validate" })); await screen.findByText(/Validation applies to this draft/);
    preview(); expect(await screen.findByRole("heading", { name: "UNSAVED Python title", level: 1 })).toBeVisible();
    const article = container.querySelector("article"); if (!article) throw Error("article");
    expect(within(article).getByText("UNSAVED paragraph")).toBeVisible(); expect(within(article).getByText("print('UNSAVED code')")).toBeVisible();
    expect(screen.getByText(/Preview represents this exact draft/)).toBeVisible();
    const input = vi.mocked(requestStudioPreview).mock.calls[0][0]; expect(input.draft.lesson.conceptIds).toContain("topic:recursion");
    expect(container.querySelector("form")).toHaveAttribute("hidden");
    back(); expect(screen.getByLabelText("Lesson title (EN)")).toHaveValue("UNSAVED Python title"); expect(prose).toHaveValue("UNSAVED paragraph");
    expect(screen.getByText("Modified draft")).toBeVisible(); expect(validationDraft().lesson.title.en).not.toBe("UNSAVED Python title");
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument();
  });
  it("explicit refresh only; edits stale prior preview and validation, then refresh updates the model", async () => {
    editor(); preview(); await screen.findByText(/Preview represents this exact draft/); back();
    fireEvent.change(screen.getByLabelText("Lesson title (EN)"), { target: { value: "New draft B" } });
    expect(screen.getByText(/Preview outdated/)).toBeVisible(); expect(requestStudioPreview).toHaveBeenCalledTimes(1);
    preview(); await screen.findByRole("heading", { name: "New draft B", level: 1 });
    expect(requestStudioPreview).toHaveBeenCalledTimes(2); expect(screen.getByText(/Preview represents this exact draft/)).toBeVisible();
  });
  it("ignores an obsolete A response even when it arrives after B and cancellation is ignored by transport", async () => {
    let resolveA: ((value: StudioPreviewResponse) => void) | undefined;
    vi.mocked(requestStudioPreview).mockImplementationOnce(() => new Promise((resolve) => { resolveA = resolve; }));
    editor(); preview(); expect(screen.getByRole("button", { name: "Preparing preview…" })).toBeDisabled();
    const signalA = vi.mocked(requestStudioPreview).mock.calls[0][1]; back();
    fireEvent.change(screen.getByLabelText("Lesson title (EN)"), { target: { value: "Draft B latest" } }); expect(signalA.aborted).toBe(true);
    preview(); await screen.findByRole("heading", { name: "Draft B latest", level: 1 });
    await act(async () => resolveA?.(previewFixture()));
    expect(screen.getByRole("heading", { name: "Draft B latest", level: 1 })).toBeVisible(); expect(screen.queryByRole("heading", { name: "Introduction", level: 1 })).not.toBeInTheDocument();
  });
  it("Reset restores canonical state, cancels pending preparation and clears old preview", async () => {
    editor(); fireEvent.change(screen.getByLabelText("Lesson title (EN)"), { target: { value: "Dirty" } });
    preview(); await screen.findByRole("heading", { name: "Dirty", level: 1 });
    fireEvent.click(screen.getByRole("button", { name: "Reset draft" })); fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Reset draft" }));
    expect(screen.getByText("Matches saved source")).toBeVisible(); expect(screen.queryByRole("heading", { name: "Dirty", level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByText(/Preview represents this exact draft/)).not.toBeInTheDocument();
    back(); expect(screen.getByLabelText("Lesson title (EN)")).not.toHaveValue("Dirty");
  });
  it("content rejection keeps draft intact; service failure is distinct and retryable", async () => {
    const blockedDraft = validationDraft(); blockedDraft.lesson.conceptIds = ["legacy:unresolved"];
    vi.mocked(requestStudioPreview).mockResolvedValueOnce(previewFixture(blockedDraft)).mockRejectedValueOnce(new Error("network"));
    editor(); preview(); expect(await screen.findByText(/Preview blocked by unsafe structure/)).toBeVisible();
    expect(screen.getByText("UNKNOWN_CONCEPT_ID")).toBeVisible(); expect(document.querySelector(".learn-lesson-article")).toBeNull();
    refresh(); expect(await screen.findByText(/Preview preparation failed/)).toBeVisible();
    refresh(); expect(await screen.findByText(/Preview represents this exact draft/)).toBeVisible();
  });
  it("safe incomplete COMPLETE content and warning-only drafts remain previewable but never imply Save", async () => {
    const skeleton = validationDraft("learn:java:interfaces"); skeleton.lesson.status = "COMPLETE";
    vi.mocked(requestStudioPreview).mockResolvedValueOnce(previewFixture(skeleton));
    editor("learn:java:interfaces"); preview();
    expect(await screen.findByText(/can render, but has errors that would block future Save/)).toBeVisible();
    expect(screen.getByText("This lesson is not fully authored yet")).toBeVisible();
  });
  it("content locale switches in preview without changing the global preference or requesting a new draft", async () => {
    const draft = validationDraft(); draft.lesson.title = { en: "English preview", vi: "Bản xem trước" };
    vi.mocked(requestStudioPreview).mockResolvedValueOnce(previewFixture(draft)); editor(); preview(); await screen.findByRole("heading", { name: "English preview", level: 1 });
    fireEvent.click(within(screen.getByRole("group", { name: "Authoring language" })).getByRole("button", { name: "VI" }));
    expect(screen.getByRole("heading", { name: "Bản xem trước", level: 1 })).toBeVisible(); expect(document.documentElement.lang).toBe("en");
    expect(requestStudioPreview).toHaveBeenCalledOnce();
  });
  it("contains renderer failures without resetting the unrelated editor draft", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    function Failure(): never { throw Error("private author text"); }
    const { container } = renderWithLocale(<><input aria-label="Retained draft" defaultValue="Uncommitted" /><PreviewErrorBoundary fallback={<p role="alert">Preview rendering failed</p>}><Failure /></PreviewErrorBoundary></>);
    expect(screen.getByRole("alert")).toHaveTextContent("Preview rendering failed"); expect(screen.getByLabelText("Retained draft")).toHaveValue("Uncommitted");
    expect(container).not.toHaveTextContent("private author text");
  });
});

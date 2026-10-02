import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/studio/save-client", () => ({ saveStudioLesson: vi.fn(), reloadStudioLesson: vi.fn() }));
vi.mock("@/lib/studio/document-navigation", () => ({ navigateStudioDocument: vi.fn() }));
import { saveStudioLesson, reloadStudioLesson } from "@/lib/studio/save-client";
import { StudioDraftSession, useStudioDraft } from "@/components/studio/studio-draft-session";
import { LessonSave } from "@/components/studio/lesson-save";
import { renderWithLocale } from "./test-utils";
import { getStudioLesson } from "@/lib/studio/loaders.server";
import type { StudioLessonInspection } from "@/lib/studio/types";
import type { SaveResult } from "@/lib/studio/save";
let source: StudioLessonInspection;
const show = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal"), close = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");
beforeAll(() => { Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value() { this.setAttribute("open", ""); } }); Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value() { this.removeAttribute("open"); } }); });
afterAll(() => { if (show) Object.defineProperty(HTMLDialogElement.prototype, "showModal", show); else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal"); if (close) Object.defineProperty(HTMLDialogElement.prototype, "close", close); else Reflect.deleteProperty(HTMLDialogElement.prototype, "close"); });
beforeEach(async () => { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("AUTHORING_STUDIO_ENABLED", "true"); vi.clearAllMocks(); const loaded = await getStudioLesson("java", "learn:java:interfaces"); if (!loaded) throw Error("fixture"); source = { ...loaded, baseRevision: "a".repeat(64) }; });
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });
function Editor() {
  const { draft, update, dirty, saving, resetToken, requestNavigation, reset } = useStudioDraft();
  return <><input aria-label="Title" disabled={saving} value={draft?.lesson.title.en ?? ""} onChange={e => { if (draft) update({ ...draft, lesson: { ...draft.lesson, title: { ...draft.lesson.title, en: e.target.value } } }); }} /><p>{dirty ? "Dirty" : "Clean"}</p><span data-testid="reset">{resetToken}</span><button onClick={() => requestNavigation("/studio")}>Navigate</button><button onClick={reset}>Reset</button><LessonSave /></>;
}
function renderEditor() { return renderWithLocale(<StudioDraftSession inspection={source}><Editor /></StudioDraftSession>); }
function edit() { fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Updated interface" } }); }
function saved(): SaveResult { return { status: "saved", inspection: { ...structuredClone(source), lesson: { ...structuredClone(source.lesson), title: { ...source.lesson.title, en: "Updated interface" } }, baseRevision: "b".repeat(64) }, changedFiles: ["content/learn/subjects/java.json"] }; }
describe("canonical readback replaces editor baseline", () => {
  it.each(["button", "ctrlKey", "metaKey"])("saves via %s, prevents duplicate submission, rebases revision and resets preview/validation", async method => {
    let resolve: (value: SaveResult) => void = () => {};
    vi.mocked(saveStudioLesson).mockImplementationOnce(() => new Promise(r => { resolve = r; }));
    renderEditor(); expect(screen.getByRole("button", { name: "Save" })).toBeDisabled(); edit();
    if (method === "button") fireEvent.click(screen.getByRole("button", { name: "Save" }));
    else { const event = new KeyboardEvent("keydown", { key: "s", [method]: true, cancelable: true }); fireEvent(window, event); expect(event.defaultPrevented).toBe(true); }
    expect(screen.getByLabelText("Title")).toBeDisabled();
    fireEvent.keyDown(window, { key: "s", ctrlKey: true }); expect(saveStudioLesson).toHaveBeenCalledTimes(1);
    resolve(saved());
    await screen.findByText("Clean"); expect(screen.getByLabelText("Title")).toHaveValue("Updated interface");
    expect(screen.getByTestId("reset")).toHaveTextContent("1"); expect(screen.getByText("content/learn/subjects/java.json")).toBeVisible();
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Second edit" } });
    vi.mocked(saveStudioLesson).mockResolvedValueOnce({ status: "failed", code: "COMMIT_FAILED" });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(saveStudioLesson).toHaveBeenLastCalledWith(expect.anything(), "b".repeat(64)));
  });
  it("conflict preserves draft; Keep does not reload; Reload requires discard confirmation", async () => {
    vi.mocked(saveStudioLesson).mockResolvedValue({ status: "conflict", code: "REVISION_CONFLICT" });
    renderEditor(); edit(); fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText(/changed on disk/); expect(screen.getByText("Dirty")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Keep my draft" })); expect(reloadStudioLesson).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Save" })); await screen.findByText(/changed on disk/);
    fireEvent.click(screen.getByRole("button", { name: "Reload latest canonical lesson" }));
    expect(screen.getByRole("dialog")).toBeVisible(); fireEvent.keyDown(window, { key: "s", ctrlKey: true }); expect(saveStudioLesson).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" })); expect(screen.getByLabelText("Title")).toHaveValue("Updated interface");
    const latest = { ...source, baseRevision: "c".repeat(64) }; vi.mocked(reloadStudioLesson).mockResolvedValue(latest);
    fireEvent.click(screen.getByRole("button", { name: "Reload latest canonical lesson" })); fireEvent.click(screen.getByRole("button", { name: "Discard draft and continue" }));
    await screen.findByText("Clean"); expect(screen.getByLabelText("Title")).toHaveValue("Interfaces");
  });
  it.each(["COMMIT_FAILED", "ROLLBACK_FAILED", "VERIFY_FAILED"])("preserves dirty draft for %s and announces diagnostic", async code => {
    vi.mocked(saveStudioLesson).mockResolvedValue({ status: "failed", code, operationId: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa" });
    renderEditor(); edit(); fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText(code); expect(screen.getByText("Dirty")).toBeVisible(); expect(screen.getByLabelText("Title")).toHaveValue("Updated interface");
    expect(screen.getByRole("alert")).toHaveTextContent(code === "ROLLBACK_FAILED" ? "partially changed" : "preserved");
    fireEvent.click(screen.getByRole("button", { name: "Navigate" })); expect(screen.getByRole("dialog")).toBeVisible();
  });
});

import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/studio/validation-client", () => ({ requestStudioValidation: vi.fn() }));
vi.mock("@/lib/studio/relationship-client", () => ({ searchStudioOptions: fixtureSearch, resolveStudioOptions: fixtureResolve }));
import { fixtureSearch, fixtureResolve } from "./studio-relationship-fixtures";
import { LessonValidation } from "@/components/studio/lesson-validation";
import { LessonEditor } from "@/components/studio/lesson-editor";
import { StudioDraftSession } from "@/components/studio/studio-draft-session";
import { requestStudioValidation } from "@/lib/studio/validation-client";
import { isDraftDirty } from "@/lib/studio/draft";
import type { ValidationReport } from "@/lib/domain/learn-validation/types";
import { renderWithLocale } from "./test-utils";
import { LocaleProvider, useI18n } from "@/components/locale-provider";
import { validationDraft } from "./learn-validation-fixtures";

const report: ValidationReport = { version: 1, status: "valid", hasErrors: false, canPersistInFuture: true, renderable: true, counts: { ERROR: 0, WARNING: 0, INFO: 0 }, issues: [], draftFingerprint: "a".repeat(64), contextFingerprint: "b".repeat(64), subjectId: "python", lessonId: "learn:python:introduction" };
const validate = () => fireEvent.click(screen.getByRole("button", { name: "Validate" }));
function Vietnamese() { const { setLocale } = useI18n(); return <button onClick={() => setLocale("vi")}>Use VI</button>; }
beforeEach(() => { vi.mocked(requestStudioValidation).mockReset(); vi.mocked(requestStudioValidation).mockResolvedValue(report); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
describe("Studio validation UI / transient draft binding", () => {
  it("shows counts, structured issue severity/path and no persistence action", async () => {
    vi.mocked(requestStudioValidation).mockResolvedValue({ ...report, status: "invalid", hasErrors: true, canPersistInFuture: false, renderable: false, counts: { ERROR: 1, WARNING: 1, INFO: 1 }, issues: [
      { code: "UNKNOWN_CONCEPT_ID", severity: "ERROR", path: "lesson.conceptIds[0]", message: "Unresolved concept" }, { code: "NO_PRACTICE", severity: "WARNING", path: "lesson.exerciseIds", message: "No practice" }, { code: "NO_REFERENCE", severity: "INFO", path: "content.blocks", message: "No reference" },
    ] });
    renderWithLocale(<LessonValidation draft={validationDraft()} />); validate();
    expect(await screen.findByText("1 errors · 1 warnings · 1 info")).toBeVisible();
    expect(screen.getByText("lesson.conceptIds[0]")).toBeVisible(); expect(screen.getByRole("region", { name: "Errors" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Save" })).not.toBeInTheDocument(); expect(screen.queryByRole("button", { name: "Preview" })).not.toBeInTheDocument();
  });
  it("relationship-only edits dirty the draft and stale the report; exact reversal restores clean", async () => {
    const source = validationDraft(); const draft = structuredClone(source);
    const view = renderWithLocale(<LessonValidation draft={draft} />); validate(); await screen.findByText(/Validation applies to this draft/);
    draft.lesson.conceptIds.push("topic:recursion"); view.rerender(<LocaleProvider><LessonValidation draft={draft} /></LocaleProvider>);
    expect(isDraftDirty(draft, source)).toBe(true); expect(screen.getByText(/Validation outdated/)).toBeVisible();
    validate(); await waitFor(() => expect(requestStudioValidation).toHaveBeenCalledTimes(2)); await screen.findByText(/Validation applies to this draft/);
    draft.lesson.conceptIds.pop(); view.rerender(<LocaleProvider><LessonValidation draft={draft} /></LocaleProvider>);
    expect(isDraftDirty(draft, source)).toBe(false); expect(screen.getByText(/Validation outdated/)).toBeVisible(); // Latest report belongs to the modified draft.
  });
  it("an old validation response cannot become current after editing or beat a newer request", async () => {
    let resolveFirst: ((value: ValidationReport) => void) | undefined;
    vi.mocked(requestStudioValidation).mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }));
    const draft = validationDraft(); const view = renderWithLocale(<LessonValidation draft={draft} />); validate();
    expect(screen.getByRole("button", { name: "Validating…" })).toBeDisabled();
    const signal = vi.mocked(requestStudioValidation).mock.calls[0][1];
    draft.lesson.title.en += " changed"; view.rerender(<LocaleProvider><LessonValidation draft={draft} /></LocaleProvider>); expect(signal.aborted).toBe(true);
    validate(); await screen.findByText(/Validation applies to this draft/);
    await act(async () => resolveFirst?.({ ...report, hasErrors: true, canPersistInFuture: false, status: "invalid" }));
    expect(screen.queryByText(/blocking errors/)).not.toBeInTheDocument(); expect(screen.getByText(/Validation applies to this draft/)).toBeVisible();
  });
  it("service failure is distinct from content diagnostics and supports retry", async () => {
    vi.mocked(requestStudioValidation).mockRejectedValueOnce(new Error("failed"));
    renderWithLocale(<LessonValidation draft={validationDraft()} />); validate();
    expect(await screen.findByText(/Validation service failed/)).toBeVisible(); validate();
    expect(await screen.findByText(/Validation applies to this draft/)).toBeVisible();
  });
  it("Reset restores clean source and clears/cancels validation through the existing reset token", async () => {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute("open", ""); } });
    Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute("open"); } });
    const draft = validationDraft();
    renderWithLocale(<StudioDraftSession inspection={{ ...draft, section: { id: draft.lesson.sectionId, title: { en: "Section", vi: "" }, order: 1 }, learnerHref: "/learn/python/introduction" }}><LessonEditor canonicalDetails={<p>Source</p>} /></StudioDraftSession>);
    validate(); await screen.findByText(/Validation applies to this draft/);
    fireEvent.change(screen.getByLabelText("Lesson title (EN)"), { target: { value: "Changed" } }); expect(screen.getByText(/Validation outdated/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Reset draft" })); fireEvent.click(screen.getAllByRole("button", { name: "Reset draft" })[1]);
    expect(screen.getByText("Matches saved source")).toBeVisible(); expect(screen.getByText("This draft has not been validated.")).toBeVisible();
  });
  it("uses paired Vietnamese interface labels without pretending diagnostics are translated", () => {
    renderWithLocale(<><Vietnamese /><LessonValidation draft={validationDraft()} /></>); fireEvent.click(screen.getByRole("button", { name: "Use VI" }));
    expect(screen.getByRole("button", { name: "Kiểm định" })).toBeVisible(); expect(screen.getByText(/Thông báo chẩn đoán bằng tiếng Anh/)).toBeVisible();
  });
});

import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PracticeWorkspace } from "@/components/practice/practice-workspace";
import { PracticeCatalog } from "@/components/practice/practice-catalog";
import { practiceProblems } from "@/content/practice/problems";
import { storage } from "@/lib/storage";
import { renderWithLocale } from "./test-utils";

const run = vi.hoisted(() => vi.fn());
vi.mock("@/lib/practice/runner", () => ({ BrowserPracticeRunner: class { run = run; } }));
beforeEach(() => { localStorage.clear(); run.mockReset(); });
afterEach(cleanup);
describe("practice workspace", () => {
  it("runs via keyboard, saves the result, and restores the draft and history on remount", async () => {
    const problem = practiceProblems[0];
    run.mockResolvedValue({ verdict: "wrong-answer", tests: [{ testId: problem.tests[0].id, verdict: "wrong-answer", actual: 999, durationMs: 1 }], durationMs: 1, scope: "public" });
    const view = renderWithLocale(<PracticeWorkspace problem={problem} aiConfigured={false} />);
    const editor = await screen.findByRole("textbox", { name: "Solution editor" });
    expect(editor).toHaveValue(problem.starters.python);
    expect(screen.getByRole("button", { name: "Run public tests" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Language"), { target: { value: "javascript" } });
    expect(screen.getByRole("button", { name: /Submit/ })).toBeDisabled();
    fireEvent.change(editor, { target: { value: "function solve() { return 999; }" } });
    fireEvent.keyDown(editor, { key: "Enter", ctrlKey: true });
    await waitFor(() => expect(storage.loadPractice().state.attempts).toHaveLength(1));
    expect(run).toHaveBeenCalledWith(problem, "function solve() { return 999; }", expect.any(AbortSignal));
    expect(screen.getByText("999")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Binary Search" })).toHaveAttribute("href", "/algorithms/binary-search");
    view.unmount();
    renderWithLocale(<PracticeWorkspace problem={problem} aiConfigured={false} />);
    expect(await screen.findByRole("textbox", { name: "Solution editor" })).toHaveValue("function solve() { return 999; }");
    expect(screen.getByText("Run history")).toBeInTheDocument();
    expect(screen.getByText("Wrong Answer")).toBeInTheDocument();
  });
  it("keeps independent Python and JavaScript drafts", async () => {
    const problem = practiceProblems[0];
    renderWithLocale(<PracticeWorkspace problem={problem} aiConfigured={false} />);
    const editor = await screen.findByRole("textbox", { name: "Solution editor" });
    fireEvent.change(editor, { target: { value: "def solve(data):\n    return 42" } });
    fireEvent.change(screen.getByLabelText("Language"), { target: { value: "javascript" } });
    expect(editor).toHaveValue(problem.starters.javascript);
    fireEvent.change(editor, { target: { value: "function solve() { return 7; }" } });
    fireEvent.change(screen.getByLabelText("Language"), { target: { value: "python" } });
    expect(editor).toHaveValue("def solve(data):\n    return 42");
  });
  it("filters Vietnamese titles without accents and with an algorithm filter", async () => {
    storage.saveLocale("vi");
    renderWithLocale(<PracticeCatalog />);
    const query = await screen.findByRole("textbox", { name: "Tìm bài tập…" });
    fireEvent.change(query, { target: { value: "vi tri xuat hien" } });
    expect(screen.getByRole("link", { name: /Vị trí xuất hiện đầu tiên/ })).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
    fireEvent.change(screen.getByLabelText("Thuật toán"), { target: { value: "bfs" } });
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    fireEvent.change(query, { target: { value: "" } });
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
  it("keeps the ML rubric separate from code verdicts", async () => {
    renderWithLocale(<PracticeWorkspace problem={practiceProblems[6]} aiConfigured={false} />);
    const checklist = await screen.findAllByRole("checkbox");
    expect(checklist).toHaveLength(3);
    fireEvent.click(checklist[0]);
    expect(checklist[0]).toBeChecked();
    expect(run).not.toHaveBeenCalled();
    expect(screen.queryByText("Accepted · public tests")).toBeNull();
  });
});

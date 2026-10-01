import { useState } from "react";
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/studio/relationship-client", () => ({ searchStudioOptions: vi.fn(), resolveStudioOptions: vi.fn() }));
import { RelationshipPicker } from "@/components/studio/relationship-picker";
import { resolveStudioOptions, searchStudioOptions } from "@/lib/studio/relationship-client";
import type { RelationshipKind, RelationshipResponse } from "@/lib/studio/relationships";
import { fixtureOptions, fixtureResolve, fixtureSearch } from "@/tests/studio-relationship-fixtures";
import { renderWithLocale } from "@/tests/test-utils";

function Harness({ kind = "concepts", initial = [], single = false }: { kind?: RelationshipKind; initial?: string[]; single?: boolean }) {
  const [ids, setIds] = useState(initial);
  return <><RelationshipPicker kind={kind} label="Links" ids={ids} single={single} onChange={setIds} /><output data-testid="ids">{JSON.stringify(ids)}</output></>;
}
beforeEach(() => {
  vi.mocked(searchStudioOptions).mockReset().mockImplementation(fixtureSearch);
  vi.mocked(resolveStudioOptions).mockReset().mockImplementation(fixtureResolve);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

async function search(query = "") {
  const input = screen.getByRole("combobox", { name: "Search Links" });
  fireEvent.focus(input); fireEvent.change(input, { target: { value: query } });
  await screen.findByRole("option");
  return input;
}

describe("canonical relationship picker", () => {
  it.each(["concepts", "exercises", "problems", "references", "examples", "lessons"] as const)("selects only %s IDs; deduplicates/removes with keyboard and announcements", async (kind) => {
    renderWithLocale(<Harness kind={kind} />);
    const first = fixtureOptions(kind)[0];
    let input = await search(first.id);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByTestId("ids")).toHaveTextContent(JSON.stringify([first.id]));
    expect(screen.getByText(`Selected ${first.id}`)).toBeInTheDocument();
    input = await search(first.id);
    fireEvent.keyDown(input, { key: "ArrowDown" }); fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByTestId("ids")).toHaveTextContent(JSON.stringify([first.id]));
    expect(screen.getByText(`Already selected: ${first.id}`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: `Remove · Links · ${first.id}` }));
    expect(screen.getByTestId("ids")).toHaveTextContent("[]");
    expect(screen.getByText(`Removed ${first.id}`)).toBeInTheDocument();
  });
  it("preserves/marks unresolved saved IDs and allows deliberate removal", async () => {
    renderWithLocale(<Harness initial={["topic:retired"]} />);
    expect(await screen.findByText("Unresolved relationship")).toBeInTheDocument();
    expect(screen.getByTestId("ids")).toHaveTextContent("topic:retired");
    fireEvent.click(screen.getByRole("button", { name: "Remove · Links · topic:retired" }));
    expect(screen.getByTestId("ids")).toHaveTextContent("[]");
  });
  it("marks untransportable legacy IDs without rejecting the whole selection", async () => {
    renderWithLocale(<Harness initial={["x".repeat(201), "topic:arrays"]} />);
    expect(screen.getByText("Unresolved relationship")).toBeInTheDocument();
    expect(await screen.findByText("Arrays")).toBeInTheDocument();
    expect(resolveStudioOptions).toHaveBeenCalledWith("concepts", ["topic:arrays"], expect.any(AbortSignal));
  });
  it("reorders selected IDs without changing their identity", async () => {
    renderWithLocale(<Harness initial={["topic:recursion", "topic:arrays", "topic:retired"]} />);
    const button = screen.getByRole("button", { name: "Move up · Links · topic:retired" });
    button.focus(); fireEvent.click(button);
    expect(screen.getByTestId("ids")).toHaveTextContent('["topic:recursion","topic:retired","topic:arrays"]');
    expect(button).toHaveFocus();
  });
  it("replaces a required single ID without making it blank or copying Example source", async () => {
    renderWithLocale(<Harness kind="examples" initial={["missing-example"]} single />);
    expect(screen.queryByRole("button", { name: /^Remove/ })).not.toBeInTheDocument();
    await search("python-example-first-program");
    fireEvent.click(screen.getByRole("option"));
    expect(screen.getByTestId("ids")).toHaveTextContent('["python-example-first-program"]');
  });
  it("supports ArrowUp, Escape, clear query, click selection and empty state without free-text IDs", async () => {
    renderWithLocale(<Harness />);
    const input = screen.getByRole("combobox"); fireEvent.focus(input);
    await screen.findByRole("option", { name: /Recursion/ });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(input, { key: "Escape" }); expect(input).toHaveAttribute("aria-expanded", "false");
    fireEvent.change(input, { target: { value: "unknown-free-text-id" } });
    expect(await screen.findByText("No canonical records match.")).toBeVisible();
    fireEvent.keyDown(input, { key: "Enter" }); expect(screen.getByTestId("ids")).toHaveTextContent("[]");
    fireEvent.click(screen.getByRole("button", { name: "Clear search · Links" }));
    fireEvent.click(await screen.findByRole("option", { name: /Arrays/ }));
    expect(screen.getByTestId("ids")).toHaveTextContent("topic:arrays");
  });
  it("debounces searches and aborts old requests", async () => {
    renderWithLocale(<Harness />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input); fireEvent.change(input, { target: { value: "r" } }); fireEvent.change(input, { target: { value: "rec" } });
    await screen.findByRole("option");
    expect(searchStudioOptions).toHaveBeenCalledTimes(1);
    const signal = vi.mocked(searchStudioOptions).mock.calls[0][2];
    fireEvent.change(input, { target: { value: "arrays" } });
    expect(signal.aborted).toBe(true);
    await screen.findByRole("option", { name: /Arrays/ });
  });
  it("rejects stale search results even when transport ignores AbortController", async () => {
    const pending: Array<(response: RelationshipResponse) => void> = [];
    vi.mocked(searchStudioOptions).mockImplementation(() => new Promise((resolve) => pending.push(resolve)));
    renderWithLocale(<Harness />);
    const input = screen.getByRole("combobox"); fireEvent.focus(input);
    await waitFor(() => expect(pending).toHaveLength(1));
    fireEvent.change(input, { target: { value: "arrays" } });
    await waitFor(() => expect(pending).toHaveLength(2));
    pending[1](await fixtureSearch("concepts", "arrays"));
    await screen.findByRole("option", { name: /Arrays/ });
    pending[0](await fixtureSearch("concepts", "recursion"));
    await waitFor(() => expect(screen.queryByRole("option", { name: /Recursion/ })).not.toBeInTheDocument());
  });
  it("distinguishes lookup/search failure from unresolved IDs and retries", async () => {
    vi.mocked(resolveStudioOptions).mockRejectedValueOnce(new Error("offline"));
    vi.mocked(searchStudioOptions).mockRejectedValueOnce(new Error("offline"));
    renderWithLocale(<Harness initial={["topic:arrays"]} />);
    expect(await screen.findByText("Could not resolve ID (kept in draft)")).toBeVisible();
    expect(screen.queryByText("Unresolved relationship")).not.toBeInTheDocument();
    fireEvent.focus(screen.getByRole("combobox"));
    expect(await screen.findByText("Search unavailable. Your draft links are unchanged.")).toBeVisible();
    fireEvent.click(within(screen.getByRole("group")).getAllByRole("button", { name: "Retry lookup" })[0]);
    expect(await screen.findByText("Arrays", { selector: ".studio-selected-relationships span" })).toBeVisible();
    expect(await screen.findByRole("option", { name: /Recursion/ })).toBeVisible();
  });
});

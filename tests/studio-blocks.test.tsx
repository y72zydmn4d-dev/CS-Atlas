import { useState } from "react";
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ContentBlockEditor } from "@/components/studio/content-block-editor";
import { createDraftBlock } from "@/lib/studio/draft";
import type { LearnLessonBlock } from "@/lib/domain/learn-platform";
import { renderWithLocale } from "@/tests/test-utils";

afterEach(cleanup);
function BlockHarness({ initial }: { initial: LearnLessonBlock }) {
  const [block, setBlock] = useState(initial);
  return <><ContentBlockEditor block={block} language="en" onChange={setBlock} /><output data-testid="block-result">{JSON.stringify(block)}</output></>;
}
function renderBlock(block: LearnLessonBlock) { return renderWithLocale(<BlockHarness initial={block} />); }
function serialized() { return screen.getByTestId("block-result").textContent; }
function edit(label: string, value: string) { fireEvent.change(screen.getByLabelText(label), { target: { value } }); }

describe("canonical block editors", () => {
  it.each(["paragraph", "definition", "complexity", "callout"] as const)("edits %s prose and real type-specific fields", (type) => {
    renderBlock(createDraftBlock(type, []));
    edit("Text (EN)", "Canonical prose");
    expect(serialized()).toContain('"body":{"en":"Canonical prose","vi":""}');
    if (type === "definition") { edit("Term", "Interface"); expect(serialized()).toContain('"term":"Interface"'); }
    if (type === "complexity") { edit("Time complexity", "O(n)"); edit("Space complexity", "O(1)"); expect(serialized()).toContain('"time":"O(n)"'); }
    if (type === "callout") { edit("Callout tone", "warning"); expect(serialized()).toContain('"tone":"warning"'); }
  });
  it("supports only H2/H3 headings", () => {
    renderBlock(createDraftBlock("heading", []));
    edit("Heading level", "3"); edit("Text (EN)", "Methods");
    expect(serialized()).toContain('"level":3');
    expect(screen.getByLabelText("Heading level").textContent).not.toContain("H1");
  });
  it.each([undefined, false, true])("preserves original ordered-list %s semantics on reversal", (ordered) => {
    const block: LearnLessonBlock = { id: "list-test", type: "list", items: [{ en: "one", vi: "một" }], ...(ordered === undefined ? {} : { ordered }) };
    renderBlock(block);
    fireEvent.click(screen.getByLabelText("Ordered list"));
    fireEvent.click(screen.getByLabelText("Ordered list"));
    expect(serialized()).toBe(JSON.stringify(block));
    fireEvent.click(screen.getByRole("button", { name: "+ Add item" }));
    edit("List item 2 (EN)", "two");
    fireEvent.click(screen.getByRole("button", { name: "Move up · List item 2" }));
    expect(screen.getByLabelText("List item 1 (EN)")).toHaveValue("two");
    fireEvent.click(screen.getByRole("button", { name: "Remove · List item 1" }));
    expect(screen.getByLabelText("List item 1 (EN)")).toHaveValue("one");
  });
  it.each(["syntax", "code", "output"] as const)("edits %s as literal text, without a runtime", (type) => {
    renderBlock(createDraftBlock(type, []));
    if (type !== "output") edit("Syntax language", "java");
    edit(type === "output" ? "Literal output" : "Code", "<script>literal</script>");
    expect(serialized()).toContain("<script>literal</script>");
    expect(document.querySelector("script")).toBeNull();
    expect(screen.queryByRole("button", { name: /run|execute/i })).not.toBeInTheDocument();
  });
  it.each([undefined, { en: "", vi: "" }])("reverts optional empty caption/title to the original shape", (optional) => {
    const block: LearnLessonBlock = { id: "code-test", type: "code", language: "java", code: "", ...(optional ? { title: optional, caption: optional } : {}) };
    renderBlock(block);
    edit("Optional caption (EN)", "temporary"); edit("Optional caption (EN)", "");
    edit("Optional block title (EN)", "temporary"); edit("Optional block title (EN)", "");
    expect(serialized()).toBe(JSON.stringify(block));
  });
  it("maintains rectangular table rows during column/row edits", () => {
    renderBlock(createDraftBlock("table", []));
    edit("Column 1 (EN)", "Name"); edit("Cell 1.1", "Shape");
    fireEvent.click(screen.getByRole("button", { name: "+ Add column" }));
    edit("Column 2 (EN)", "Type"); edit("Cell 1.2", "Interface");
    fireEvent.click(screen.getByRole("button", { name: "+ Add row" }));
    expect(screen.getByLabelText("Cell 2.2")).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Remove · Column 1" }));
    expect(screen.getByLabelText("Cell 1.1")).toHaveValue("Interface");
    expect(screen.queryByLabelText("Cell 1.2")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove · Row 2" }));
    expect(screen.queryByLabelText("Cell 2.1")).not.toBeInTheDocument();
  });
  it("edits localized comparison columns, labels and values without flattening their schema", () => {
    renderBlock(createDraftBlock("comparison", []));
    edit("Row label 1 (EN)", "Interface"); edit("Cell 1.1 (EN)", "Contract");
    fireEvent.click(screen.getByRole("button", { name: "+ Add column" }));
    fireEvent.click(screen.getByRole("button", { name: "+ Add row" }));
    edit("Cell 2.2 (EN)", "Second value");
    fireEvent.click(screen.getByRole("button", { name: "Remove · Column 1" }));
    expect(screen.getByLabelText("Cell 2.1 (EN)")).toHaveValue("Second value");
    expect(serialized()).toContain('"label":{"en":"Interface","vi":""}');
  });
  it.each([
    { id: "example", type: "example", exampleId: "example:existing" },
    { id: "exercise", type: "exercise", exerciseId: "exercise:existing" },
    { id: "refs", type: "references", referenceIds: ["reference:existing"] },
    { id: "related", type: "related", lessonIds: ["learn:java:interfaces"], problemIds: ["problem:existing"] },
  ] satisfies LearnLessonBlock[])("keeps $type IDs read-only until C", (block) => {
    renderBlock(block);
    expect(screen.getByText(/IDs are read-only/)).toBeVisible();
    expect(screen.getAllByRole("textbox")).toHaveLength(1); // optional title only
    expect(serialized()).toBe(JSON.stringify(block));
  });
});

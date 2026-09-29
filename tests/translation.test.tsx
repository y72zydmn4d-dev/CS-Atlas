import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { findGlossaryTerm } from "@/content/bilingual-glossary";
import { getEligibleSelection, useTextSelection } from "@/hooks/use-text-selection";
import { translateSelection } from "@/lib/translation";

function makeSelection(element: Element, text: string): Selection {
  const textNode = document.createTextNode(text);
  element.append(textNode);
  return {
    rangeCount: 1,
    isCollapsed: false,
    toString: () => text,
    getRangeAt: () => ({
      commonAncestorContainer: textNode,
      getBoundingClientRect: () => ({ x: 10, y: 20, top: 20, left: 10, right: 110, bottom: 38, width: 100, height: 18, toJSON: () => ({}) }),
    }),
  } as unknown as Selection;
}

function insideMain(tag = "p", className?: string) {
  const main = document.createElement("main");
  const element = document.createElement(tag);
  if (className) element.className = className;
  main.append(element);
  document.body.append(main);
  return element;
}

beforeEach(() => {
  document.body.replaceChildren();
  delete (window as unknown as { Translator?: unknown }).Translator;
});

afterEach(() => vi.restoreAllMocks());

describe("translation pipeline", () => {
  it("uses curated translations before lower-priority providers", async () => {
    const result = await translateSelection("Complexity is the shape of a cost curve, not a stopwatch reading.");
    expect(result.source).toBe("curated");
    expect(result.text).toMatch(/Độ phức tạp/);
  });

  it("uses the local glossary for exact technical terms", async () => {
    expect(findGlossaryTerm("HASH TABLE")?.vi).toBe("bảng băm");
    const result = await translateSelection("hash table");
    expect(result.source).toBe("glossary");
    expect(result.text).toContain("bảng băm");
  });

  it("returns an honest fallback when browser translation is unsupported", async () => {
    expect(await translateSelection("A sentence not present in curated content.")).toEqual({ text: "", source: "unavailable" });
  });

  it("uses and disposes the Browser Translator API when available", async () => {
    const destroy = vi.fn();
    (window as unknown as { Translator: unknown }).Translator = {
      availability: vi.fn().mockResolvedValue("readily"),
      create: vi.fn().mockResolvedValue({ translate: vi.fn().mockResolvedValue("Bản dịch trình duyệt"), destroy }),
    };
    const result = await translateSelection("A browser-only sentence.");
    expect(result).toEqual({ text: "Bản dịch trình duyệt", source: "browser" });
    expect(destroy).toHaveBeenCalledOnce();
  });
});

describe("selection eligibility", () => {
  it("accepts short English prose in main content", () => {
    const selection = makeSelection(insideMain(), "Gradient descent follows the local slope.");
    expect(getEligibleSelection(selection)?.text).toBe("Gradient descent follows the local slope.");
  });

  it.each<[string, string | undefined]>([["code", undefined], ["pre", undefined], ["input", undefined], ["nav", undefined], ["div", "formula-box"]])("excludes selections inside %s", (tag, className) => {
    const selection = makeSelection(insideMain(tag, className), "This text should not trigger translation.");
    expect(getEligibleSelection(selection)).toBeNull();
  });

  it("excludes text longer than 500 characters and existing Vietnamese", () => {
    expect(getEligibleSelection(makeSelection(insideMain(), "x".repeat(501)))).toBeNull();
    expect(getEligibleSelection(makeSelection(insideMain(), "Đây là một đoạn tiếng Việt đã được dịch."))).toBeNull();
  });

  it("cleans up all global selection listeners", () => {
    const documentRemove = vi.spyOn(document, "removeEventListener");
    const windowRemove = vi.spyOn(window, "removeEventListener");
    function Consumer() { useTextSelection(); return null; }
    const view = render(<Consumer />);
    view.unmount();
    expect(documentRemove).toHaveBeenCalledWith("selectionchange", expect.any(Function));
    expect(windowRemove).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(windowRemove).toHaveBeenCalledWith("scroll", expect.any(Function), true);
  });
});

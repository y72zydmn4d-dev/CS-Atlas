"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface TextSelectionState { text: string; rect: DOMRect }

const excludedSelector = "input,textarea,select,pre,code,.formula-box,.rich-code,.no-translate,nav,[contenteditable='true']";
const vietnamesePattern = /[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]|\b(và|là|của|cho|với|trong|được|không|một|các|khi|từ)\b/i;

function selectionElement(selection: Selection): Element | null {
  const node = selection.rangeCount ? selection.getRangeAt(0).commonAncestorContainer : null;
  return node instanceof Element ? node : node?.parentElement ?? null;
}

export function getEligibleSelection(selection: Selection | null): TextSelectionState | null {
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const text = selection.toString().trim().replace(/\s+/g, " ");
  if (!text || text.length > 500 || vietnamesePattern.test(text)) return null;
  const element = selectionElement(selection);
  if (!element?.closest("main") || element.closest(excludedSelector)) return null;
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  if (!rect.width && !rect.height) return null;
  return { text, rect };
}

export function useTextSelection() {
  const [selection, setSelection] = useState<TextSelectionState | null>(null);
  const timer = useRef<number | null>(null);
  const update = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSelection(getEligibleSelection(window.getSelection())), 70);
  }, []);
  const clear = useCallback(() => setSelection(null), []);

  useEffect(() => {
    document.addEventListener("selectionchange", update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      document.removeEventListener("selectionchange", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [update]);

  return { selection, clear };
}

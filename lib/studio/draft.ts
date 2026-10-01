import type { LearnLessonBlock, LearnLessonContent, LessonManifest } from "@/lib/domain/learn-platform";
import type { StudioLessonInspection } from "@/lib/studio/types";

/** Transient composition of canonical records. Never a persisted Studio model. */
export interface AuthoringLessonDraft {
  lesson: LessonManifest;
  content: LearnLessonContent | null;
}

export function toAuthoringDraft(source: Pick<StudioLessonInspection, "lesson" | "content">): AuthoringLessonDraft {
  return structuredClone({ lesson: source.lesson, content: source.content });
}

/** A typed candidate, NOT validated or authorized for persistence. D owns parsing. */
export function toCanonicalCandidate(draft: AuthoringLessonDraft): AuthoringLessonDraft {
  return structuredClone({ lesson: draft.lesson, content: draft.content });
}

function stableValue(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "";
  if (Array.isArray(value)) return `[${value.map(stableValue).join(",")}]`;
  return `{${Object.entries(value).filter(([, entry]) => entry !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableValue(entry)}`).join(",")}}`;
}

/** Selected lesson only; array/prose order and whitespace are significant. Not a disk revision. */
export function draftFingerprint(draft: AuthoringLessonDraft): string { return stableValue(draft); }
export function isDraftDirty(draft: AuthoringLessonDraft, baseline: AuthoringLessonDraft): boolean {
  return draftFingerprint(draft) !== draftFingerprint(baseline);
}

export function emptyDraftBody(lessonId: string): LearnLessonContent {
  return { lessonId, version: 1, reviewedAt: "", summary: { en: "", vi: "" }, blocks: [] };
}

export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= items.length || to >= items.length) return [...items];
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export type EditableBlockType = Exclude<LearnLessonBlock["type"], "example" | "exercise" | "references" | "related">;
export const editableBlockTypes = ["paragraph", "objectives", "heading", "list", "definition", "syntax", "code", "output", "callout", "table", "comparison", "complexity"] as const satisfies readonly EditableBlockType[];

export function nextBlockId(blocks: readonly LearnLessonBlock[], type: LearnLessonBlock["type"]): string {
  const used = new Set(blocks.map((block) => block.id));
  let index = 1;
  while (used.has(`${type}-${index}`)) index++;
  return `${type}-${index}`;
}

export function createDraftBlock(type: EditableBlockType, blocks: readonly LearnLessonBlock[]): LearnLessonBlock {
  const id = nextBlockId(blocks, type);
  const text = () => ({ en: "", vi: "" });
  switch (type) {
    case "paragraph": return { id, type, body: text() };
    case "objectives": return { id, type, items: [text()] };
    case "heading": return { id, type, level: 2, text: text() };
    case "list": return { id, type, items: [text()] };
    case "definition": return { id, type, term: "", body: text() };
    case "syntax": return { id, type, language: "", code: "" };
    case "code": return { id, type, language: "", code: "" };
    case "output": return { id, type, output: "" };
    case "callout": return { id, type, tone: "note", body: text() };
    case "table": return { id, type, columns: [text()], rows: [[""]] };
    case "comparison": return { id, type, columns: [text()], rows: [{ label: text(), values: [text()] }] };
    case "complexity": return { id, type, time: "", space: "", body: text() };
  }
}

export function duplicateDraftBlock(block: LearnLessonBlock, blocks: readonly LearnLessonBlock[]): LearnLessonBlock {
  return { ...structuredClone(block), id: nextBlockId(blocks, block.type) };
}

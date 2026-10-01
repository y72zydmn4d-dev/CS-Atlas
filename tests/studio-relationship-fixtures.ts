import type { RelationshipKind, RelationshipOption, RelationshipResponse } from "@/lib/studio/relationships";
import { matchesStudioQuery } from "@/lib/studio/navigation";

const records: Record<RelationshipKind, Array<[string, string, string[]]>> = {
  concepts: [["topic:recursion", "Recursion", ["topic", "computer-science", "topic-recursion"]], ["topic:arrays", "Arrays", ["topic"]]],
  exercises: [["exercise:array-linear-scan", "Linear scan condition", ["easy", "fill_code", "topic:arrays"]], ["exercise:binary-search-invariant", "Binary search interval", ["easy", "multiple_choice"]]],
  problems: [["first-occurrence", "First occurrence", ["easy", "python", "topic:arrays"]], ["sorted-pair", "Sorted pair", ["easy"]]],
  references: [["python-ref-len", "len", ["python", "python-builtins", "len(value)"]], ["python-ref-list-append", "list.append", ["python", "python-list-methods"]]],
  examples: [["python-example-first-program", "A small, observable program", ["python", "python"]], ["dsa-example-binary-search", "Find the first matching position", ["dsa", "javascript"]]],
  lessons: [["learn:java:interfaces", "Interfaces", ["java", "Object model"]], ["learn:java:classes", "Classes", ["java", "Object model"]]],
};
export function fixtureOptions(kind: RelationshipKind): RelationshipOption[] {
  return records[kind].map(([id, title, metadata]) => ({ kind, id, label: { en: title, vi: title }, description: { en: "", vi: "" }, metadata }));
}
export async function fixtureSearch(kind: RelationshipKind, query: string): Promise<RelationshipResponse> {
  return { version: 1, kind, items: fixtureOptions(kind).filter((item) => matchesStudioQuery(query, [item.id, item.label.en, ...item.metadata])), unresolvedIds: [], hasMore: false };
}
export async function fixtureResolve(kind: RelationshipKind, ids: readonly string[]): Promise<RelationshipResponse> {
  return { version: 1, kind, items: fixtureOptions(kind).filter((item) => ids.includes(item.id)), unresolvedIds: ids.filter((id) => !fixtureOptions(kind).some((item) => item.id === id)), hasMore: false };
}

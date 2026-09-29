import type { SearchResult } from "@/lib/types";

function normalize(value: string) {
  return value.toLowerCase().replaceAll("đ", "d").normalize("NFKD").replace(/\p{M}/gu, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

export function searchContent(query: string, index: SearchResult[]): SearchResult[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (!terms.length) return index.slice(0, 9);
  return index
    .map((item) => {
      const title = normalize(`${item.title} ${item.titleVi ?? ""}`);
      const haystack = normalize(`${item.title} ${item.titleVi ?? ""} ${item.type} ${item.hierarchy} ${item.hierarchyVi ?? ""} ${item.keywords}`);
      if (!terms.every((term) => haystack.includes(term))) return null;
      const score = terms.reduce((total, term) => total + (title === term ? 100 : title.startsWith(term) ? 50 : title.includes(term) ? 25 : 5), 0);
      return { item, score };
    })
    .filter((entry): entry is { item: SearchResult; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .map(({ item }) => item);
}

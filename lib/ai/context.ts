import { algorithms, domainById, domains, projects, techniques, topics } from "@/content";

export interface AtlasSource {
  id: string;
  title: string;
  type: "Domain" | "Topic" | "Algorithm" | "Technique" | "Project";
  href: string;
  excerpt: string;
}

const stopWords = new Set([
  "a", "about", "and", "can", "does", "explain", "for", "how", "in", "is", "me", "of", "the", "to", "what", "why",
  "ban", "cach", "cho", "co", "cua", "duoc", "giai", "hay", "la", "mot", "nao", "nhu", "tai", "the", "toi", "ve", "voi",
]);

export function normalizeAiText(value: string): string {
  return value.toLowerCase().replaceAll("đ", "d").normalize("NFKD").replace(/\p{M}/gu, "").replace(/[^a-z0-9]+/g, " ").trim();
}

const sources: AtlasSource[] = [
  ...domains.map((item) => ({ id: item.id, title: item.name, type: "Domain" as const, href: `/domains/${item.slug}`, excerpt: `${item.description} Key concepts: ${item.keyConcepts.join(", ")}.` })),
  ...topics.map((item) => ({ id: item.id, title: item.title, type: "Topic" as const, href: `/topics/${item.slug}`, excerpt: [item.summary, ...item.content.filter((block) => block.type === "paragraph" || block.type === "intuition" || block.type === "definition" || block.type === "key-idea").slice(0, 3).map((block) => block.type === "definition" ? block.definition : block.body)].join(" ").slice(0, 1800) })),
  ...algorithms.map((item) => ({ id: item.id, title: item.name, type: "Algorithm" as const, href: `/algorithms/${item.slug}`, excerpt: `${item.summary} ${item.intuition} Time: ${item.timeComplexity}. Space: ${item.spaceComplexity}. Common mistakes: ${item.mistakes.join("; ")}.` })),
  ...techniques.map((item) => ({ id: item.id, title: item.name, type: "Technique" as const, href: `/techniques/${item.slug}`, excerpt: `${item.summary} Use when: ${item.whenToUse.join("; ")}. Steps: ${item.steps.join("; ")}.` })),
  ...projects.map((item) => ({ id: item.id, title: item.title, type: "Project" as const, href: `/projects#${item.slug}`, excerpt: `${item.summary} Domain: ${domainById.get(item.domainId)?.name ?? ""}. Deliverables: ${item.deliverables.join("; ")}.` })),
];

export function retrieveAtlasSources(question: string, limit = 5): AtlasSource[] {
  const terms = [...new Set(normalizeAiText(question).split(" ").filter((term) => term.length > 1 && !stopWords.has(term)))];
  if (!terms.length) return [];
  return sources.map((source) => {
    const title = normalizeAiText(source.title);
    const body = normalizeAiText(source.excerpt);
    const exact = terms.length > 1 && title.includes(terms.join(" ")) ? 20 : 0;
    const score = exact + terms.reduce((total, term) => total + (title === term ? 12 : title.includes(term) ? 8 : body.includes(term) ? 2 : 0), 0);
    return { source, score };
  }).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score || a.source.title.localeCompare(b.source.title)).slice(0, limit).map((entry) => entry.source);
}

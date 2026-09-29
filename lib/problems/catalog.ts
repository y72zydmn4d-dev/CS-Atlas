import type { Locale } from "@/lib/types";
import type { Problem, ProblemDifficulty } from "@/lib/domain/problems";

export interface ProblemCatalogFilters {
  query?: string;
  difficulty?: ProblemDifficulty | "";
  conceptId?: string;
  tag?: string;
  rating?: "under-1000" | "1000-1399" | "1400-plus" | "";
  language?: "python" | "javascript" | "";
}

function normalize(value: string) {
  return value.toLocaleLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replaceAll("đ", "d").trim();
}

export function matchesProblemCatalogFilters(problem: Problem, filters: ProblemCatalogFilters, locale: Locale) {
  const query = normalize(filters.query ?? "");
  if (query && !normalize(`${problem.title[locale]} ${problem.summary[locale]} ${problem.tags.join(" ")}`).includes(query)) return false;
  if (filters.difficulty && problem.difficulty !== filters.difficulty) return false;
  if (filters.conceptId && !problem.conceptIds.includes(filters.conceptId)) return false;
  if (filters.tag && !problem.tags.includes(filters.tag)) return false;
  if (filters.language && !problem.languages.includes(filters.language)) return false;
  if (filters.rating === "under-1000" && problem.rating >= 1000) return false;
  if (filters.rating === "1000-1399" && (problem.rating < 1000 || problem.rating >= 1400)) return false;
  if (filters.rating === "1400-plus" && problem.rating < 1400) return false;
  return true;
}

export function validateProblemCatalog(problems: Problem[], knownConceptIds: Set<string>) {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const problem of problems) {
    if (ids.has(problem.id)) errors.push(`Duplicate problem ID: ${problem.id}`);
    ids.add(problem.id);
    if (!Number.isInteger(problem.rating) || problem.rating < 0 || problem.rating > 5_000) errors.push(`${problem.id}: invalid rating`);
    if (!problem.tags.length || new Set(problem.tags).size !== problem.tags.length) errors.push(`${problem.id}: invalid tags`);
    if (problem.publicExampleIds.length !== problem.publicTestCount || new Set(problem.publicExampleIds).size !== problem.publicExampleIds.length) errors.push(`${problem.id}: public example mismatch`);
    if (!problem.constraints.length || problem.constraints.some((item) => !item.en.trim() || !item.vi.trim())) errors.push(`${problem.id}: invalid constraints`);
    for (const conceptId of [...problem.conceptIds, ...problem.prerequisiteConceptIds]) if (!knownConceptIds.has(conceptId)) errors.push(`${problem.id}: missing Concept ${conceptId}`);
    if (problem.publication.referenceSolution !== "server-only" || problem.publication.discussion !== "unavailable") errors.push(`${problem.id}: unsafe publication policy`);
  }
  return errors;
}

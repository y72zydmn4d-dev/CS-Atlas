import "server-only";
import { requireStudioEnabled } from "@/lib/studio/guard.server";
import { matchesStudioQuery } from "@/lib/studio/navigation";
import { relationshipQueryLimit, relationshipResolveLimit, relationshipSearchLimit, type RelationshipKind, type RelationshipOption, type RelationshipResponse } from "@/lib/studio/relationships";
import type { LocalizedConceptText } from "@/lib/domain/concepts";

const short = (value: string) => value.slice(0, 200);
const localized = (value: LocalizedConceptText): LocalizedConceptText => ({ en: short(value.en), vi: short(value.vi) });

/** Closed literal imports. No paths, lesson bodies, answers, tests or runnable source leave this adapter. */
async function options(kind: RelationshipKind): Promise<RelationshipOption[]> {
  requireStudioEnabled();
  switch (kind) {
    case "concepts": {
      const { concepts } = await import("@/content/concepts/registry");
      return concepts.map((item) => ({ kind, id: item.id, label: localized(item.name), description: localized(item.summary),
        metadata: [item.kind, item.status, ...(item.domainId ? [item.domainId] : []), ...item.aliases].slice(0, 12).map(short) }));
    }
    case "exercises": {
      const { exercises } = await import("@/content/exercises");
      return exercises.map((item) => ({ kind, id: item.id, label: localized(item.title), description: { en: "", vi: "" },
        metadata: [item.difficulty, item.mode, ...item.conceptIds].slice(0, 12).map(short) }));
    }
    case "problems": {
      const { problems } = await import("@/content/problems");
      return problems.map((item) => ({ kind, id: item.id, label: localized(item.title), description: localized(item.summary),
        metadata: [item.difficulty, item.domainId, ...item.languages, ...item.conceptIds].slice(0, 12).map(short) }));
    }
    case "references": {
      const { learnReferences } = await import("@/content/learn/lesson-content");
      return learnReferences.map((item) => ({ kind, id: item.id, label: { en: short(item.name), vi: short(item.name) }, description: localized(item.description),
        metadata: [item.subjectId, item.categoryId, ...(item.signature ? [item.signature] : []), ...item.conceptIds].slice(0, 12).map(short) }));
    }
    case "examples": {
      const { learnExamples } = await import("@/content/learn/lesson-content");
      return learnExamples.map((item) => ({ kind, id: item.id, label: localized(item.title), description: localized(item.description),
        metadata: [item.subjectId, item.language, item.difficulty, item.runtime, item.lessonId].map(short) }));
    }
    case "lessons": {
      const { learnSubjectsForNavigation } = await import("@/content/learn/registry");
      return learnSubjectsForNavigation.flatMap((subject) => subject.sections.flatMap((section) => section.lessons.map((item) => ({
        kind, id: item.id, label: localized(item.title), description: localized(item.description), metadata: [subject.id, section.title.en, section.title.vi, item.status].map(short),
      }))));
    }
  }
}

export async function searchStudioRelationships(kind: RelationshipKind, query: string): Promise<RelationshipResponse> {
  requireStudioEnabled();
  if (query.length > relationshipQueryLimit) throw new Error("Invalid relationship query");
  const matches = (await options(kind)).filter((item) => matchesStudioQuery(query, [item.id, item.label.en, item.label.vi, ...item.metadata]));
  const normalized = query.trim().toLowerCase();
  matches.sort((a, b) => Number(b.id.toLowerCase() === normalized) - Number(a.id.toLowerCase() === normalized)
    || a.label.en.localeCompare(b.label.en, "en") || a.id.localeCompare(b.id, "en"));
  return { version: 1, kind, items: matches.slice(0, relationshipSearchLimit), hasMore: matches.length > relationshipSearchLimit, unresolvedIds: [] };
}

export async function resolveStudioRelationships(kind: RelationshipKind, ids: readonly string[]): Promise<RelationshipResponse> {
  requireStudioEnabled();
  if (ids.length > relationshipResolveLimit || ids.some((id) => !id || id.length > 200)) throw new Error("Invalid relationship IDs");
  const records = new Map((await options(kind)).map((item) => [item.id, item]));
  const items: RelationshipOption[] = [];
  const unresolvedIds: string[] = [];
  for (const id of new Set(ids)) {
    const item = records.get(id);
    if (item) items.push(item); else unresolvedIds.push(id);
  }
  return { version: 1, kind, items, unresolvedIds, hasMore: false };
}

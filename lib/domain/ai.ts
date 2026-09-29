export const atlasAiTasks = ["ask", "explain", "tutor", "hint", "debug", "review", "quiz", "generate-exercise", "summarize", "study-plan"] as const;
export type AtlasAiTask = (typeof atlasAiTasks)[number];

export const aiContextSourceTypes = ["page", "concept", "lesson", "problem", "selected-code", "roadmap", "progress-mastery", "library-item"] as const;
export type AiContextSourceType = (typeof aiContextSourceTypes)[number];
export type AiContextSensitivity = "public" | "sensitive-user-content" | "personal";

export interface AiContextSourcePolicy {
  sourceType: AiContextSourceType;
  sensitivity: AiContextSensitivity;
  available: boolean;
  requiresExplicitConsent: boolean;
  maxCharacters: number;
}

export const aiContextSourcePolicies: Record<AiContextSourceType, AiContextSourcePolicy> = {
  page: { sourceType: "page", sensitivity: "public", available: false, requiresExplicitConsent: false, maxCharacters: 4_000 },
  concept: { sourceType: "concept", sensitivity: "public", available: true, requiresExplicitConsent: false, maxCharacters: 2_000 },
  lesson: { sourceType: "lesson", sensitivity: "public", available: false, requiresExplicitConsent: false, maxCharacters: 6_000 },
  problem: { sourceType: "problem", sensitivity: "public", available: false, requiresExplicitConsent: false, maxCharacters: 6_000 },
  "selected-code": { sourceType: "selected-code", sensitivity: "sensitive-user-content", available: false, requiresExplicitConsent: true, maxCharacters: 20_000 },
  roadmap: { sourceType: "roadmap", sensitivity: "public", available: false, requiresExplicitConsent: false, maxCharacters: 4_000 },
  "progress-mastery": { sourceType: "progress-mastery", sensitivity: "personal", available: false, requiresExplicitConsent: true, maxCharacters: 4_000 },
  "library-item": { sourceType: "library-item", sensitivity: "sensitive-user-content", available: false, requiresExplicitConsent: true, maxCharacters: 8_000 },
};

export interface AiContextReference {
  sourceType: AiContextSourceType;
  sourceId: string;
  sourceVersion: string;
  consent: "public-authored" | "explicit-user-action";
}

export interface AiContextProvider {
  resolve(reference: AiContextReference): Promise<{ text: string; title: string; href?: string } | null>;
}

export interface AtlasAiRequest {
  question: string;
  locale: "en" | "vi";
  task: AtlasAiTask;
  contextConceptId?: string;
}

export function validateAtlasAiRequest(value: unknown): { ok: true; value: AtlasAiRequest } | { ok: false } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false };
  const body = value as Record<string, unknown>;
  if (typeof body.question !== "string" || body.question.trim().length < 3 || body.question.length > 2_000 || (body.locale !== "en" && body.locale !== "vi") || !atlasAiTasks.includes((body.task ?? "ask") as AtlasAiTask)) return { ok: false };
  if (body.contextConceptId !== undefined && (typeof body.contextConceptId !== "string" || body.contextConceptId.length > 160)) return { ok: false };
  if (["contextReferences", "libraryItemIds", "progress", "selectedCode", "providerUrl", "model"].some((field) => field in body)) return { ok: false };
  return { ok: true, value: { question: body.question.trim(), locale: body.locale, task: (body.task ?? "ask") as AtlasAiTask, contextConceptId: body.contextConceptId as string | undefined } };
}

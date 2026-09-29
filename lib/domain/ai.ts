export const atlasAiTasks = ["ask", "explain", "tutor", "hint", "quiz", "generate-exercise", "summarize", "study-plan"] as const;
export type AtlasAiTask = (typeof atlasAiTasks)[number];

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
  return { ok: true, value: { question: body.question.trim(), locale: body.locale, task: (body.task ?? "ask") as AtlasAiTask, contextConceptId: body.contextConceptId as string | undefined } };
}

import type { PracticeLanguage } from "@/lib/practice/types";

export interface PracticeLanguageDefinition {
  id: PracticeLanguage;
  label: string;
  executable: boolean;
}

export const practiceLanguages: readonly PracticeLanguageDefinition[] = [
  { id: "python", label: "Python 3", executable: false },
  { id: "javascript", label: "JavaScript", executable: true },
] as const;

export const practiceLanguageById = new Map(practiceLanguages.map((language) => [language.id, language]));

export function isPracticeLanguage(value: unknown): value is PracticeLanguage {
  return typeof value === "string" && practiceLanguageById.has(value as PracticeLanguage);
}

export function practiceDraftKey(problemId: string, language: PracticeLanguage) {
  return `${problemId}:${language}`;
}

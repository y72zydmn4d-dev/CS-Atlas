import { isValidationReport, type StudioValidationRequest } from "@/lib/studio/validation";

/** Typed read-only computation; never sends a path, write plan or client verdict. */
export async function requestStudioValidation(input: StudioValidationRequest, signal: AbortSignal) {
  const response = await fetch("/api/studio/validation", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", cache: "no-store", body: JSON.stringify(input), signal });
  if (!response.ok) throw new Error(`validation-request-${response.status}`);
  const value: unknown = await response.json();
  if (!isValidationReport(value) || value.subjectId !== input.subjectId || value.lessonId !== input.lessonId) throw new Error("invalid-validation-report");
  return value;
}

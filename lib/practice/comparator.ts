import type { JsonValue } from "@/lib/practice/types";

/** Exact JSON shape and order; only the numeric leaves of ML contracts allow tolerance. */
export function compareOutput(actual: JsonValue, expected: JsonValue, mode: "exact" | "numeric-tolerance"): boolean {
  if (typeof expected === "number" && typeof actual === "number") return Number.isFinite(actual) && (mode === "exact" ? actual === expected : Math.abs(actual - expected) <= 1e-6 * Math.max(1, Math.abs(expected)));
  if (expected === null || actual === null || typeof actual !== "object" || typeof expected !== "object") return actual === expected;
  if (Array.isArray(actual) || Array.isArray(expected)) return Array.isArray(actual) && Array.isArray(expected) && actual.length === expected.length && actual.every((value, index) => compareOutput(value, expected[index], mode));
  const keys = Object.keys(expected);
  return keys.length === Object.keys(actual).length && keys.every((key) => Object.hasOwn(actual, key) && compareOutput(actual[key], expected[key], mode));
}

import "server-only";
import { notFound } from "next/navigation";

/** Local development tool, not an authentication or authorization system. */
export function isStudioEnabled(): boolean {
  return process.env.NODE_ENV === "development" && process.env.AUTHORING_STUDIO_ENABLED === "true";
}

export function requireStudioEnabled(): void {
  if (!isStudioEnabled()) notFound();
}

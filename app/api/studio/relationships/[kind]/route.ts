import { isStudioEnabled } from "@/lib/studio/guard.server";
import { isSameOriginRequest } from "@/lib/http/request-security";
import { isRelationshipKind, isRelationshipResponse, relationshipQueryLimit, relationshipResolveLimit } from "@/lib/studio/relationships";
import { resolveStudioRelationships, searchStudioRelationships } from "@/lib/studio/relationships.server";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
const failure = (code: string, status: number) => Response.json({ code }, { status, headers });
// Fixed local-worker budget, bounded memory. Not multi-user/admin authentication.
let windowStart = 0;
let requestCount = 0;

/** Read-only, bounded registry projections. No request can name a file or change content. */
export async function GET(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  if (!isStudioEnabled()) return failure("studio-unavailable", 404);
  if (!isSameOriginRequest(request) || request.headers.get("sec-fetch-site") === "cross-site") return failure("origin-rejected", 403);
  if (request.url.length > 10_000) return failure("invalid-query", 400);
  const now = Date.now();
  if (now - windowStart >= 60_000) { windowStart = now; requestCount = 0; }
  if (++requestCount > 600) return failure("rate-limited", 429);
  const { kind } = await params;
  if (!isRelationshipKind(kind)) return failure("unknown-relationship-kind", 404);
  const query = new URL(request.url).searchParams;
  const ids = query.getAll("id");
  if ([...query.keys()].some((key) => key !== "q" && key !== "id") || query.getAll("q").length > 1
    || (ids.length && query.has("q")) || ids.length > relationshipResolveLimit
    || ids.some((id) => !id || id.length > 200 || /[\u0000-\u001f]/.test(id))
    || (query.get("q") ?? "").length > relationshipQueryLimit) return failure("invalid-query", 400);
  try {
    const result = ids.length ? await resolveStudioRelationships(kind, ids) : await searchStudioRelationships(kind, query.get("q") ?? "");
    if (!isRelationshipResponse(result, kind)) return failure("invalid-projection", 500);
    return Response.json(result, { headers });
  } catch {
    return failure("relationship-read-failed", 500);
  }
}

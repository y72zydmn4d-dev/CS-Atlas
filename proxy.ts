import { NextResponse } from "next/server";
import { isStudioEnabled } from "@/lib/studio/guard.server";

/** Prevent shared loading boundaries from turning disabled Studio into a soft404. */
export function proxy() {
  if (!isStudioEnabled()) {
    return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  }
  return NextResponse.next();
}

// No learner routes, public assets or unrelated APIs enter this guard.
export const config = { matcher: "/studio/:path*" };

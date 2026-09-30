"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const WorkspaceProvidersShell = dynamic(() => import("@/components/workspace-providers-shell").then((module) => module.WorkspaceProvidersShell));

/** Only workspace URLs mount local learning, search and translation services. */
export function RouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname === "/" ? children : <WorkspaceProvidersShell>{children}</WorkspaceProvidersShell>;
}

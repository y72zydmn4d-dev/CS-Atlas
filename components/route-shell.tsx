"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Message } from "@/components/locale-provider";

const WorkspaceProvidersShell = dynamic(() => import("@/components/workspace-providers-shell").then((module) => module.WorkspaceProvidersShell), {
  loading: () => <main id="main-content" className="page" aria-busy="true"><p role="status"><Message k="workspace.loading" /></p></main>,
});

/** Public entry and internal Studio do not mount learner/Search services. */
export function RouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname === "/" || pathname === "/studio" ? children : <WorkspaceProvidersShell>{children}</WorkspaceProvidersShell>;
}

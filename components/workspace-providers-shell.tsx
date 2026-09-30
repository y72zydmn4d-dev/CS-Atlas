"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { AtlasProvider } from "@/components/atlas-provider";
import { SelectionTranslator } from "@/components/selection-translator";
import { WorkspacePreferencesProvider } from "@/components/workspace-preferences-provider";

export function WorkspaceProvidersShell({ children }: { children: ReactNode }) {
  return <WorkspacePreferencesProvider><AtlasProvider><AppShell>{children}</AppShell><SelectionTranslator /></AtlasProvider></WorkspacePreferencesProvider>;
}

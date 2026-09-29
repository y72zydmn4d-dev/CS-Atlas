"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { storage } from "@/lib/storage";

interface WorkspacePreferences {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const WorkspacePreferencesContext = createContext<WorkspacePreferences | null>(null);

export function WorkspacePreferencesProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    // Browser-only navigation preference is reconciled after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarCollapsed(storage.loadSidebarCollapsed());
  }, []);
  const value = useMemo(() => ({
    sidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed((current) => {
      storage.saveSidebarCollapsed(!current);
      return !current;
    }),
  }), [sidebarCollapsed]);
  return <WorkspacePreferencesContext.Provider value={value}>{children}</WorkspacePreferencesContext.Provider>;
}

export function useWorkspacePreferences() {
  const value = useContext(WorkspacePreferencesContext);
  if (!value) throw new Error("useWorkspacePreferences must be used inside WorkspacePreferencesProvider");
  return value;
}

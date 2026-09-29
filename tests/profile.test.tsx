import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AtlasProvider } from "@/components/atlas-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { LocalProfile } from "@/components/profile/local-profile";
import { createAnonymousLocalProfileExport } from "@/lib/profile/local-profile";
import { storage } from "@/lib/storage";

afterEach(cleanup);
beforeEach(() => localStorage.clear());

describe("anonymous local profile", () => {
  it("exports private versioned learning data and explicit exclusions", () => {
    storage.saveProgress({ arrays: "completed" });
    storage.saveLocale("vi");
    storage.saveTheme("light");
    storage.saveSidebarCollapsed(true);
    const exported = createAnonymousLocalProfileExport("2026-09-30T00:00:00.000Z");
    expect(exported).toMatchObject({
      schemaVersion: 1,
      exportedAt: "2026-09-30T00:00:00.000Z",
      identity: { kind: "anonymous-local", id: "current-browser", visibility: "private" },
      preferences: { locale: "vi", theme: "light", sidebarCollapsed: true },
      learning: { progress: { arrays: "completed" } },
    });
    expect(exported.exclusions).toEqual(["library-metadata", "library-files", "library-extracted-text"]);
  });

  it("clears learning records while retaining preferences", () => {
    storage.saveProgress({ arrays: "completed" });
    storage.saveExercises({ drill: "solved" });
    storage.saveLocale("vi");
    storage.saveTheme("light");
    expect(storage.clearLocalLearningData()).toBe(true);
    expect(storage.loadProgress()).toEqual({});
    expect(storage.loadExercises()).toEqual({});
    expect(storage.loadLocale()).toBe("vi");
    expect(storage.loadTheme()).toBe("light");
  });

  it("requires a second explicit action before deletion", () => {
    render(<LocaleProvider><AtlasProvider><LocalProfile /></AtlasProvider></LocaleProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Delete learning data" }));
    expect(screen.getByRole("button", { name: "Delete now" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("It does not remove Library items or preferences.");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("button", { name: "Delete now" })).not.toBeInTheDocument();
  });
});

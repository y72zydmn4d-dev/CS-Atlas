import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AtlasProvider } from "@/components/atlas-provider";
import { ExerciseWorkspace } from "@/components/exercises/exercise-workspace";
import { LocaleProvider } from "@/components/locale-provider";
import { exerciseById } from "@/content/exercises";
import { storage } from "@/lib/storage";

afterEach(cleanup);
beforeEach(() => localStorage.clear());

describe("exercise workspace", () => {
  it("reveals hints progressively and records a versioned local attempt", async () => {
    const exercise = exerciseById.get("exercise:binary-search-invariant");
    if (!exercise) throw new Error("exercise fixture missing");
    render(<LocaleProvider><AtlasProvider><ExerciseWorkspace exercise={exercise} /></AtlasProvider></LocaleProvider>);
    expect(screen.getByText("No hints revealed yet.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reveal hint 1" }));
    expect(screen.getByText("Think about where a target could still be.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "The target, if present, is within [low, high]." }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByText("Correct")).toBeInTheDocument();
    await waitFor(() => expect(storage.loadExerciseAttempts()).toEqual([
      expect.objectContaining({ exerciseId: exercise.id, exerciseVersion: exercise.version, result: "correct", hintCount: 1 }),
    ]));
    expect(screen.getByText("Attempts are stored only in this browser.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: exercise.conceptIds[0] })).toHaveAttribute("href", `/concepts/${encodeURIComponent(exercise.conceptIds[0])}`);
  });
});

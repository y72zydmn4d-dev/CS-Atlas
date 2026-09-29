import { fireEvent, render, screen } from "@testing-library/react";
import { statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { KnowledgeAtlasPreview } from "@/components/knowledge-atlas-preview";
import { AmbientBackground } from "@/components/ambient-background";
import { AlgorithmVisualizer } from "@/components/algorithm-visualizer";
import { renderWithLocale } from "@/tests/test-utils";

describe("motion presentation components", () => {
  it("keeps the animated atlas navigable without relying on motion", () => {
    renderWithLocale(<KnowledgeAtlasPreview />);
    expect(screen.getByLabelText("Knowledge atlas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mathematics for AI" })).toHaveAttribute("href", "/domains/mathematics-for-ai");
    expect(screen.getByRole("link", { name: "Machine Learning" })).toHaveAttribute("href", "/domains/machine-learning");
    expect(screen.getByRole("link", { name: "AI Engineering" })).toHaveAttribute("href", "/domains/ai-engineering");
  });

  it("marks the global atmospheric background as decorative", () => {
    const { container } = render(<AmbientBackground />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".ambient-background-image")).not.toBeInTheDocument();
    expect(container.querySelector(".ambient-background-grid")).toBeInTheDocument();
    expect(container.querySelector(".ambient-background-radial")).toBeInTheDocument();
  });

  it("ships optimized local topology assets", () => {
    for (const asset of ["knowledge-topology-dark.avif", "knowledge-topology-dark.webp"]) {
      const stats = statSync(resolve(process.cwd(), "public/backgrounds", asset));
      expect(stats.size).toBeLessThan(500_000);
    }
  });

  it("advances and resets visualizer frames deterministically", () => {
    renderWithLocale(<AlgorithmVisualizer type="binary-search" />);
    expect(screen.getByText("Step 1 / 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("Step 2 / 4")).toBeInTheDocument();
    expect(screen.getByText(/Inspect index 4/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("Step 1 / 4")).toBeInTheDocument();
  });
});

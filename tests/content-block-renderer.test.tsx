import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentBlockRenderer } from "@/components/content-block-renderer";
import { AtlasProvider } from "@/components/atlas-provider";
import { topicById } from "@/content";
import { renderWithLocale } from "@/tests/test-utils";

function renderTopic(id: string) {
  const topic = topicById.get(id);
  if (!topic) throw new Error(`Missing test topic ${id}`);
  return renderWithLocale(<AtlasProvider><ContentBlockRenderer topic={topic} /></AtlasProvider>);
}

describe("ContentBlockRenderer", () => {
  it("renders formulas, worked examples, exercises, and citations", () => {
    renderTopic("complexity-analysis");
    expect(screen.getByRole("heading", { name: "Asymptotic notation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Worked example: triangular loop" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Exercise: dependent loop" })).toBeInTheDocument();
    expect(screen.getAllByText(/Introduction to Algorithms/).length).toBeGreaterThan(0);
  });

  it("renders code with a language label and copy control", () => {
    renderTopic("gradient-descent");
    expect(screen.getByText("python")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });
});

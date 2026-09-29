import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JudgeSubmissionStatus } from "@/components/judge/submission-status";
import { renderWithLocale } from "@/tests/test-utils";

describe("Judge status presentation", () => {
  it("renders every lifecycle state and measured terminal verdict without implying a local result", () => {
    const states = ["queued", "running", "failed", "cancelled", "unavailable"] as const;
    for (const status of states) {
      const view = renderWithLocale(<JudgeSubmissionStatus status={status} />);
      expect(view.container.querySelector(`.status-${status}`)).toBeInTheDocument();
      view.unmount();
    }
    renderWithLocale(<JudgeSubmissionStatus status="finished" verdict="TLE" usage={{ durationMs: 1000, memoryBytes: 2048 }} />);
    expect(screen.getByText("Time limit exceeded")).toBeInTheDocument();
    expect(screen.getByText(/1000 ms/)).toBeInTheDocument();
  });
});

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AtlasAssistant } from "@/components/atlas-assistant";
import { LocaleProvider } from "@/components/locale-provider";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("AtlasAssistant", () => {
  it("keeps input disabled until the server has a configured key", () => {
    render(<LocaleProvider><AtlasAssistant configured={false} /></LocaleProvider>);
    expect(screen.getByLabelText("Your question")).toBeDisabled();
    expect(screen.getByText(/Gemini is not configured/)).toBeInTheDocument();
  });

  it("shows a plain-text answer and linked Atlas context", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ answer: "Use the midpoint [1].", sources: [{ id: "binary-search", type: "Algorithm", title: "Binary Search", href: "/algorithms/binary-search", excerpt: "Halve the interval." }] }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<LocaleProvider><AtlasAssistant configured /></LocaleProvider>);
    fireEvent.change(screen.getByLabelText("Your question"), { target: { value: "How does binary search work?" } });
    fireEvent.click(screen.getByRole("button", { name: "Ask Gemini" }));
    await waitFor(() => expect(screen.getByText("Use the midpoint [1].")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: /Binary Search/ })).toHaveAttribute("href", "/algorithms/binary-search");
    expect(fetchMock).toHaveBeenCalledWith("/api/ai/ask", expect.objectContaining({ method: "POST" }));
  });
});

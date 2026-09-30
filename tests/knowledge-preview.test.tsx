import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { KnowledgeAtlasVisual } from "@/components/landing/knowledge-atlas-visual";
import { LocaleProvider } from "@/components/locale-provider";
import { knowledgePreview } from "@/content/landing/knowledge-preview";
import { conceptGraphService } from "@/lib/concepts/service";
import { buildLandingProjection } from "@/lib/concepts/landing-projection";

const projection = buildLandingProjection(conceptGraphService,knowledgePreview);
afterEach(() => { cleanup(); vi.unstubAllGlobals(); Reflect.deleteProperty(document,"hidden"); });
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
});
function preview() { return render(<LocaleProvider><KnowledgeAtlasVisual projection={projection} /></LocaleProvider>); }

describe("supplementary knowledge preview", () => {
  it("renders a non-focusable visual and an independent native relationship list", () => {
    const { container } = preview();
    expect(container.querySelector('[aria-hidden="true"] button, [aria-hidden="true"] a, [aria-hidden="true"] [tabindex]')).toBeNull();
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    if (details) { details.open = true; fireEvent(details,new Event("toggle")); }
    fireEvent.click(screen.getByRole("button", { name: "Python" }));
    expect(screen.getByRole("button", { name: "Python" })).toHaveAttribute("aria-pressed","true");
    expect(screen.getByRole("link", { name: /Open concept/ })).toHaveAttribute("href","/concepts/topic-python");
    expect(screen.getByText("Prerequisite for:")).toBeInTheDocument();
    expect(screen.getByText("Related to:")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("button", { name: "Python" }), { key: "Escape" });
    expect(screen.getByRole("button", { name: "Python" })).toHaveAttribute("aria-pressed","false");
    expect(screen.queryByRole("link", { name: /Open concept/ })).not.toBeInTheDocument();
  });
  it("omits ambient motion controls under reduced motion / non-desktop conditions", () => {
    const { container } = preview();
    expect(screen.queryByRole("button", { name: /gentle motion/ })).not.toBeInTheDocument();
    expect(container.querySelector(".knowledge-graphic")).toHaveAttribute("data-motion","disabled");
  });
  it("starts static, enables optional desktop motion, and pauses for selection", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const { container } = preview();
    const toggle = await screen.findByRole("button", { name: "Enable gentle motion" });
    expect(toggle).toHaveAttribute("aria-pressed","false");
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Pause motion" })).toHaveAttribute("aria-pressed","true");
    const details = container.querySelector("details");
    if (details) { details.open = true; fireEvent(details,new Event("toggle")); }
    fireEvent.click(screen.getByRole("button", { name: "Python" }));
    await waitFor(() => expect(container.querySelector(".knowledge-graphic")).toHaveAttribute("data-paused","true"));
  });
  it("pauses opted-in motion while the document is hidden or the figure is offscreen", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    let visibility: ((entries: Array<{ isIntersecting: boolean }>) => void) | undefined;
    vi.stubGlobal("IntersectionObserver", class { constructor(callback: typeof visibility) { visibility = callback; } observe() {} disconnect() {} });
    const { container } = preview();
    fireEvent.click(await screen.findByRole("button", { name: "Enable gentle motion" }));
    fireEvent(document,new Event("visibilitychange"));
    Object.defineProperty(document,"hidden",{ configurable:true, value:true });
    fireEvent(document,new Event("visibilitychange"));
    expect(container.querySelector(".knowledge-graphic")).toHaveAttribute("data-paused","true");
    Object.defineProperty(document,"hidden",{ configurable:true, value:false });
    fireEvent(document,new Event("visibilitychange"));
    act(() => visibility?.([{ isIntersecting:false }]));
    await waitFor(() => expect(container.querySelector(".knowledge-graphic")).toHaveAttribute("data-paused","true"));
    vi.unstubAllGlobals();
  });
});

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
    expect(screen.queryByRole("button", { name: /motion/ })).not.toBeInTheDocument();
    expect(container.querySelector(".knowledge-graphic")).toHaveAttribute("data-motion","disabled");
    expect(container.querySelector(".knowledge-graphic")).toHaveAttribute("data-atmosphere-motion","disabled");
  });
  it("emphasizes direct neighbors for hover/focus and restores persistent selection", () => {
    const { container } = preview();
    const details = container.querySelector("details");
    if (details) { details.open = true; fireEvent(details,new Event("toggle")); }
    fireEvent.click(screen.getByRole("button", { name: "Python" }));
    const node = (id: string) => container.querySelector(`.knowledge-wide [data-concept="topic:${id}"]`);
    expect(node("python")).toHaveClass("active");
    expect(node("ml-fundamentals")).toHaveClass("neighbor");
    expect(node("programming-fundamentals")).toHaveClass("neighbor");
    expect(node("neural-networks")).toHaveClass("unrelated");
    const neural = node("neural-networks");
    if (neural) fireEvent.pointerEnter(neural);
    expect(node("neural-networks")).toHaveClass("active");
    expect(node("linear-algebra")).toHaveClass("neighbor");
    // Leaving the node into empty graph space restores selection, not only leaving the figure.
    if (neural) fireEvent.pointerLeave(neural);
    expect(node("python")).toHaveClass("active");
    fireEvent.focus(screen.getByRole("button", { name:"Linear Algebra" }));
    expect(node("linear-algebra")).toHaveClass("active");
    expect(node("neural-networks")).toHaveClass("neighbor");
    fireEvent.blur(screen.getByRole("button", { name:"Linear Algebra" }));
    expect(node("python")).toHaveClass("active");
  });
  it("freezes default atmospheric motion while the pointer is over the graph", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches:true, addEventListener:vi.fn(), removeEventListener:vi.fn() })));
    const { container } = preview();
    await screen.findByRole("button", { name:"Pause motion" });
    const graphic = container.querySelector(".knowledge-graphic");
    if (graphic) fireEvent.pointerEnter(graphic);
    expect(graphic).toHaveAttribute("data-paused","true");
    if (graphic) fireEvent.pointerLeave(graphic);
    expect(graphic).toHaveAttribute("data-paused","false");
  });
  it("recalculates ports from measured label boxes with one resize observer", () => {
    let resize: (() => void) | undefined;
    const disconnect = vi.fn();
    vi.stubGlobal("ResizeObserver",class { constructor(callback: () => void) { resize=callback; } observe() {} disconnect=disconnect; });
    const { container,unmount } = preview();
    const wide = container.querySelector<HTMLElement>(".knowledge-wide");
    if (!wide) throw new Error("Missing wide graph");
    Object.defineProperty(wide,"offsetWidth",{ configurable:true,value:880 });
    Object.defineProperty(wide,"offsetHeight",{ configurable:true,value:360 });
    for (const node of wide.querySelectorAll<HTMLElement>(".knowledge-node")) {
      Object.defineProperty(node,"offsetWidth",{ configurable:true,value:node.classList.contains("rank-anchor") ? 164 : 148 });
      Object.defineProperty(node,"offsetHeight",{ configurable:true,value:node.classList.contains("rank-anchor") ? 72 : 64 });
    }
    const before = wide.querySelector(".knowledge-edge")?.getAttribute("d");
    act(() => resize?.());
    expect(wide.querySelector(".knowledge-edge")?.getAttribute("d")).not.toBe(before);
    expect(wide.querySelectorAll(".knowledge-edge.related[marker-end]")).toHaveLength(0);
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
  it("starts atmosphere automatically without graph drift, supports pause/resume, and pauses for selection", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const { container } = preview();
    const toggle = await screen.findByRole("button", { name: "Pause motion" });
    const graphic = container.querySelector(".knowledge-graphic");
    expect(toggle).toHaveAttribute("aria-pressed","true");
    expect(graphic).toHaveAttribute("data-motion","disabled");
    expect(graphic).toHaveAttribute("data-atmosphere-motion","enabled");
    expect(graphic).toHaveAttribute("data-paused","false");
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name:"Enable gentle motion" })).toHaveAttribute("aria-pressed","false");
    expect(graphic).toHaveAttribute("data-atmosphere-motion","disabled");
    expect(graphic).toHaveAttribute("data-motion","disabled");
    fireEvent.click(screen.getByRole("button", { name:"Enable gentle motion" }));
    expect(screen.getByRole("button", { name: "Pause motion" })).toHaveAttribute("aria-pressed","true");
    expect(graphic).toHaveAttribute("data-atmosphere-motion","enabled");
    expect(graphic).toHaveAttribute("data-motion","enabled");
    const details = container.querySelector("details");
    if (details) { details.open = true; fireEvent(details,new Event("toggle")); }
    fireEvent.click(screen.getByRole("button", { name: "Python" }));
    await waitFor(() => expect(container.querySelector(".knowledge-graphic")).toHaveAttribute("data-paused","true"));
  });
  it("pauses default atmospheric motion while the document is hidden or the figure is offscreen", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    let visibility: ((entries: Array<{ isIntersecting: boolean }>) => void) | undefined;
    vi.stubGlobal("IntersectionObserver", class { constructor(callback: typeof visibility) { visibility = callback; } observe() {} disconnect() {} });
    const { container } = preview();
    await screen.findByRole("button", { name: "Pause motion" });
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
  it("disables atmosphere on a live reduced-motion change and preserves an explicit pause on return", async () => {
    let matches = true;
    let notify: (() => void) | undefined;
    vi.stubGlobal("matchMedia", vi.fn(() => ({ get matches() { return matches; }, addEventListener: (_: string, callback: () => void) => { notify = callback; }, removeEventListener: vi.fn() })));
    const { container } = preview();
    const graphic = container.querySelector(".knowledge-graphic");
    await screen.findByRole("button", { name:"Pause motion" });
    act(() => { matches = false; notify?.(); });
    expect(graphic).toHaveAttribute("data-atmosphere-motion","disabled");
    expect(screen.queryByRole("button", { name:/motion/ })).not.toBeInTheDocument();
    act(() => { matches = true; notify?.(); });
    fireEvent.click(screen.getByRole("button", { name:"Pause motion" }));
    act(() => { matches = false; notify?.(); });
    act(() => { matches = true; notify?.(); });
    expect(screen.getByRole("button", { name:"Enable gentle motion" })).toHaveAttribute("aria-pressed","false");
    expect(graphic).toHaveAttribute("data-atmosphere-motion","disabled");
    expect(graphic).toHaveAttribute("data-motion","disabled");
  });
});

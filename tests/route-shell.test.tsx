import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { RouteShell } from "@/components/route-shell";

const path = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => path.current }));
vi.mock("next/dynamic", () => ({ default: () => function Workspace({ children }: { children: ReactNode }) { return <section aria-label="Workspace shell">{children}</section>; } }));
afterEach(cleanup);

describe("public/workspace boundary", () => {
  it("passes public server children through without mounting workspace services", () => {
    path.current = "/";
    render(<RouteShell><h1>Public landing</h1></RouteShell>);
    expect(screen.getByRole("heading", { name: "Public landing" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Workspace shell" })).not.toBeInTheDocument();
  });
  it.each(["/home", "/learn/python", "/practice", "/explore", "/library", "/assistant"])("keeps %s directly accessible in the workspace", (pathname) => {
    path.current = pathname;
    render(<RouteShell><p>Feature content</p></RouteShell>);
    expect(screen.getByRole("region", { name: "Workspace shell" })).toHaveTextContent("Feature content");
  });
});

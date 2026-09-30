import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorFooter } from "@/components/home/author-footer";
import { LocaleProvider } from "@/components/locale-provider";
import { storage } from "@/lib/storage";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

vi.mock("next/image", () => ({
  default: ({ alt, fill, sizes, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; sizes?: string }) => {
    void fill;
    void sizes;
    return (
      // The test double intentionally exposes the accessible image contract.
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt} {...props} />
    );
  },
}));

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : [path];
  });
}

afterEach(cleanup);
beforeEach(() => localStorage.clear());

describe("home author footer", () => {
  it("renders the creator identity, current year and safe external links", () => {
    render(<LocaleProvider><AuthorFooter /></LocaleProvider>);
    expect(screen.getByRole("contentinfo", { name: "Trịnh Gia Huy" })).toBeInTheDocument();
    expect(screen.getByText("IT-E10 · Data Science & Artificial Intelligence")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();

    for (const service of ["GitHub", "LinkedIn", "Facebook"]) {
      const link = screen.getByRole("link", { name: `${service} — Trịnh Gia Huy` });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("uses the existing locale system for Vietnamese copy", async () => {
    storage.saveLocale("vi");
    render(<LocaleProvider><AuthorFooter /></LocaleProvider>);
    await waitFor(() => expect(screen.getByText("Đại học Bách khoa Hà Nội")).toBeInTheDocument());
    expect(screen.getByText(/Khoa học Dữ liệu/)).toBeInTheDocument();
  });

  it("supports the future local portrait without changing its public contract", () => {
    render(<LocaleProvider><AuthorFooter imageSrc="/images/author/trinh-gia-huy.jpg" /></LocaleProvider>);
    expect(screen.getByRole("img", { name: "Trịnh Gia Huy" })).toHaveAttribute("src", "/images/author/trinh-gia-huy.jpg");
  });

  it("is mounted by the home page and no other app route", () => {
    const appRoot = join(process.cwd(), "app");
    const mounts = sourceFiles(appRoot)
      .filter((path) => /(?:page|layout)\.tsx$/.test(path))
      .filter((path) => readFileSync(path, "utf8").includes("<AuthorFooter"))
      .map((path) => relative(process.cwd(), path));

    expect(mounts).toEqual([]);
    expect(readFileSync(join(process.cwd(), "components/home/workspace-home-page.tsx"), "utf8")).toContain("<AuthorFooter");
    expect(readFileSync(join(appRoot, "home/page.tsx"), "utf8")).toContain("<WorkspaceHomePage");
  });
});

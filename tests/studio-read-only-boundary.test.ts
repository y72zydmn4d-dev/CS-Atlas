import { readFile, readdir } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? sourceFiles(`${directory}/${entry.name}`) : Promise.resolve([`${directory}/${entry.name}`])));
  return nested.flat().filter((name) => /\.(ts|tsx)$/.test(name));
}

describe("Studio G exposes only guarded existing-lesson Save", () => {
  it("keeps filesystem writes internal and excludes execution, generic APIs and persisted drafts", async () => {
    const files = (await Promise.all([sourceFiles("app/studio"), sourceFiles("app/api/studio"), sourceFiles("components/studio"), sourceFiles("lib/studio"), sourceFiles("lib/domain/learn-validation")])).flat();
    expect(files.filter((name) => /\/route\.(ts|tsx)$/.test(name)).sort()).toEqual(["app/api/studio/lesson/route.ts", "app/api/studio/preview/route.ts", "app/api/studio/relationships/[kind]/route.ts", "app/api/studio/validation/route.ts"]);
    for (const file of files) {
      const source = await readFile(file, "utf8");
      // F's internal server-only foundation is deliberately not reachable from UI/routes.
      if (file.startsWith("lib/studio/writer/")) {
        expect(source, file).toContain('import "server-only"');
        expect(source, file).not.toMatch(/\b(?:eval|Function|exec|spawn|localStorage|indexedDB)\s*[.(]/);
        expect(source, file).not.toMatch(/child_process|["']use server["']|["']use client["']/);
        continue;
      }
      if (!["lib/studio/save.server.ts", "lib/studio/live-save.server.ts"].includes(file)) expect(source, file).not.toMatch(/(?:from\s*|import\s*\()["'][^"']*(?:studio\/writer|\.\/writer)/);
      expect(source, file).not.toMatch(/["']use server["']/);
      expect(source, file).not.toMatch(/(?:from\s*|import\s*\()["'](?:node:)?(?:fs|fs\/promises|path|child_process)["']/);
      expect(source, file).not.toMatch(/\b(?:eval|Function|exec|spawn|writeFile|localStorage|indexedDB)\s*[.(]/);
      // POST computation is permitted only for validation and ephemeral preview.
      expect(source, file).not.toMatch(/export\s+(?:async\s+)?function\s+(?:PUT|PATCH|DELETE)\b/);
      if (!["app/api/studio/validation/route.ts", "app/api/studio/preview/route.ts"].includes(file)) expect(source, file).not.toMatch(/export\s+(?:async\s+)?function\s+POST\b/);
      if (source.includes('"use client"')) {
        expect(source, file).not.toMatch(/from\s*["']@\/(?:content(?:\/|["'])|lib\/studio\/[^"']*\.server)/);
        expect(source, file).not.toMatch(/\bfetch\s*\(/);
      }
    }
    const transport = await readFile("lib/studio/relationship-client.ts", "utf8");
    expect(transport).toContain('method: "GET"');
    expect(transport).not.toMatch(/\bbody\s*:/);
    const route = await readFile("app/api/studio/relationships/[kind]/route.ts", "utf8");
    expect(route).toContain('if (!isStudioEnabled())');
    const validationRoute = await readFile("app/api/studio/validation/route.ts", "utf8");
    expect(validationRoute).toContain('if (!isStudioEnabled())');
    expect(validationRoute).toContain('readStudioDraftRequest(request, budget)');
    const previewRoute = await readFile("app/api/studio/preview/route.ts", "utf8");
    expect(previewRoute).toContain('if (!isStudioEnabled())');
    expect(previewRoute).toContain('readStudioDraftRequest(request, budget)');
    expect(await readFile("lib/studio/validation-request.server.ts", "utf8")).toContain('isLocalStudioOrigin(request)');
    for (const file of ["components/learn/lesson-content-surface.tsx", "components/learn/lesson-block-renderer.tsx", "components/learn/learn-render-environment.tsx", "components/copy-code-block.tsx", "lib/domain/learn-rendering.ts"]) {
      const source = await readFile(file, "utf8");
      expect(source, file).not.toMatch(/from\s*["']@\/(?:content|components\/atlas-provider|lib\/(?:storage|library|studio\/[^"']*\.server))/);
    }
  });
});

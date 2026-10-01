import { readFile, readdir } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? sourceFiles(`${directory}/${entry.name}`) : Promise.resolve([`${directory}/${entry.name}`])));
  return nested.flat().filter((name) => /\.(ts|tsx)$/.test(name));
}

describe("Studio A/B/C remains a read-only canonical consumer", () => {
  it("has no mutation handler, Server Action, filesystem writer, execution or persisted draft path", async () => {
    const files = (await Promise.all([sourceFiles("app/studio"), sourceFiles("app/api/studio"), sourceFiles("components/studio"), sourceFiles("lib/studio")])).flat();
    expect(files.filter((name) => /\/route\.(ts|tsx)$/.test(name))).toEqual(["app/api/studio/relationships/[kind]/route.ts"]);
    for (const file of files) {
      const source = await readFile(file, "utf8");
      expect(source, file).not.toMatch(/["']use server["']/);
      expect(source, file).not.toMatch(/(?:from\s*|import\s*\()["'](?:node:)?(?:fs|fs\/promises|path|child_process)["']/);
      expect(source, file).not.toMatch(/\b(?:eval|Function|exec|spawn|writeFile|localStorage|indexedDB)\s*[.(]/);
      expect(source, file).not.toMatch(/export\s+(?:async\s+)?function\s+(?:POST|PUT|PATCH|DELETE)\b/);
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
  });
});

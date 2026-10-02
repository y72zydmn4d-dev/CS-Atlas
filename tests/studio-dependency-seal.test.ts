// @vitest-environment node
import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { readFile, writeFile } from "node:fs/promises";
import { inventory } from "@/lib/studio/writer/repository.server";
import { liveDependencies, dependencyValues } from "@/lib/studio/writer/live-dependencies.server";
import { canonicalJson, sha256 } from "@/lib/studio/writer/serialization.server";
it("seals readonly source bytes and imported canonical dependency semantics", async () => {
  const files = (await inventory(process.cwd())).filter(name => !name.startsWith("content/learn/subjects/") && !name.startsWith("content/learn/lessons/") && !name.startsWith("content/learn/generated/"));
  const seal = { sources: Object.fromEntries(await Promise.all(files.map(async name => [name, sha256(await readFile(name))]))), semanticHash: sha256(canonicalJson(dependencyValues(liveDependencies()))) };
  const target = "content/learn/generated/authoring-dependency-seal.json";
  if (process.env.CS_ATLAS_REFRESH_DEPENDENCY_SEAL === "1") await writeFile(target, canonicalJson(seal));
  expect(JSON.parse(await readFile(target, "utf8"))).toEqual(seal);
});

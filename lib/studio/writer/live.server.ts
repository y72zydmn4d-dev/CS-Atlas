import "server-only";
import { readFile } from "node:fs/promises";
import seal from "@/content/learn/generated/authoring-dependency-seal.json";
import { learnRepositoryRoot } from "@/lib/learn/content-storage.server";
import { createCanonicalLessonWriter } from "./service.server";
import { liveDependencies, dependencyValues } from "./live-dependencies.server";
import { canonicalJson, sha256 } from "./serialization.server";
import { checkedPath, guardWriter } from "./paths.server";
import { AuthoringWriteError } from "./types.server";

export async function liveLessonWriter() {
  guardWriter();
  const root = await learnRepositoryRoot();
  return createCanonicalLessonWriter({ rootAnchor: root, readDependencies: async () => {
    const value = liveDependencies();
    if (!Object.keys(seal.sources).length || sha256(canonicalJson(dependencyValues(value))) !== seal.semanticHash) throw new AuthoringWriteError("STORAGE_NOT_READY");
    for (const [relative, expected] of Object.entries(seal.sources)) {
      if (sha256(await readFile(await checkedPath(root, relative))) !== expected) throw new AuthoringWriteError("STORAGE_NOT_READY");
    }
    return value;
  } });
}

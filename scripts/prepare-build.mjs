import { readdir, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";

// Finder may write these files into Next's output between builds. Next's
// clean step expects empty directories and otherwise fails with ENOTEMPTY.
async function removeFinderMetadata(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isFile() && entry.name === ".DS_Store") await unlink(path);
    else if (entry.isDirectory()) await removeFinderMetadata(path);
  }
}

await removeFinderMetadata(resolve(process.cwd(), ".next-production"));

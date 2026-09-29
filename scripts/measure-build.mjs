import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const buildRoot = process.env.CS_ATLAS_BUILD_DIR || ".next-production";
const chunkRoot = join(buildRoot, "static/chunks");

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? filesBelow(join(directory, entry.name)) : [join(directory, entry.name)]);
}

const chunks = filesBelow(chunkRoot).filter((file) => file.endsWith(".js")).map((file) => {
  const bytes = readFileSync(file);
  return { file: relative(chunkRoot, file), bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
});
const routeChunks = chunks.filter((chunk) => chunk.file.startsWith("app/") && chunk.file.includes("/page-"));
const total = chunks.reduce((sum, chunk) => sum + chunk.gzipBytes, 0);
const largest = chunks.toSorted((left, right) => right.gzipBytes - left.gzipBytes)[0];
const largestRoute = routeChunks.toSorted((left, right) => right.gzipBytes - left.gzipBytes)[0];

console.log(JSON.stringify({ buildRoot, chunkCount: chunks.length, totalGzipBytes: total, largestChunk: largest, largestRouteChunk: largestRoute }, null, 2));
if (total > 1_500_000 || (largest?.gzipBytes ?? 0) > 200_000 || (largestRoute?.gzipBytes ?? 0) > 100_000) process.exitCode = 1;

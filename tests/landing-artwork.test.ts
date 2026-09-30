import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

describe("approved landing artwork", () => {
  it("preserves the approved reference and ships a bounded same-size WebP", async () => {
    const reference = resolve(process.cwd(), "docs/ui-redesign/references/approved-aurora-background.png");
    const production = resolve(process.cwd(), "public/backgrounds/cs-atlas-aurora.webp");
    expect(createHash("sha256").update(readFileSync(reference)).digest("hex")).toBe("1ce15b99bc384177de967ceaf27dfed52469d15edba5e1708c7b27d7f125b88b");
    const source = await sharp(reference).metadata();
    const asset = await sharp(production).metadata();
    expect(asset.format).toBe("webp");
    expect([asset.width,asset.height]).toEqual([source.width,source.height]);
    expect(statSync(production).size).toBeLessThan(250_000);
  });
});

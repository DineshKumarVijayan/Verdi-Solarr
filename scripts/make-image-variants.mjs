// Creates 480 px and 960 px WebP copies of every static photo (public/images/**/x.webp -> x-480.webp, x-960.webp)
// so phones download small files (see src/lib/img.ts). Run after adding photos to public/images:
//   node scripts/make-image-variants.mjs
// Requires the `sharp` package (npm i -D sharp). Copies are never larger than the original.

import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const dirs = ["public/images/products", "public/images/site"];
let made = 0;
for (const dir of dirs) {
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".webp") || /-(480|960)\.webp$/.test(f)) continue;
    const src = join(dir, f);
    const { width = 0 } = await sharp(src).metadata();
    for (const w of [480, 960]) {
      const out = src.replace(/\.webp$/, `-${w}.webp`);
      try {
        if (statSync(out).mtimeMs >= statSync(src).mtimeMs) continue; // up to date
      } catch {
        /* missing: create */
      }
      await sharp(src).resize({ width: Math.min(w, width), withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
      made++;
    }
  }
}
console.log(`image variants: ${made} written`);

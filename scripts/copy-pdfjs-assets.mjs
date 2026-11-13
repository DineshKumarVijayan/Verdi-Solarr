// Copies pdf.js runtime data (fonts, cmaps, wasm decoders, ICC profiles) into public/pdfjs
// so the datasheet viewer renders every manufacturer PDF faithfully. Served as static assets.
import { cpSync, existsSync, mkdirSync } from "node:fs";
const src = "node_modules/pdfjs-dist";
const dest = "public/pdfjs";
mkdirSync(dest, { recursive: true });
for (const dir of ["cmaps", "standard_fonts", "wasm", "iccs"]) {
  if (!existsSync(`${src}/${dir}`)) continue;
  cpSync(`${src}/${dir}`, `${dest}/${dir}`, {
    recursive: true,
    filter: (p) => !/quickjs/i.test(p), // JS-in-PDF sandbox is not needed (scripting disabled)
  });
}
console.log("pdf.js assets copied to public/pdfjs");

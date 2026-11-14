import type { SyntheticEvent } from "react";

/**
 * Smaller copies of an image so phones download only what fits their screen.
 *  - Static photos (/images/…/x.webp): x-480.webp and x-960.webp are made by scripts/make-image-variants.mjs.
 *  - Admin uploads (/api/media/image|field/…): an 800 px "-800.webp" copy is uploaded alongside.
 * If a copy is ever missing, `fallbackToOriginal` drops srcset and loads the original.
 */
export function srcSetFor(url: string): string | undefined {
  if (/^\/images\/.+\.webp$/.test(url) && !/-(480|960)\.webp$/.test(url)) {
    const base = url.slice(0, -5);
    return `${base}-480.webp 480w, ${base}-960.webp 960w, ${url} 1600w`;
  }
  const up = url.match(/^(\/api\/media\/(?:image|field)\/.+)\.(webp|jpg|png)$/);
  if (up) return `${up[1]}-800.webp 800w, ${url} 2000w`;
  return undefined;
}

export function fallbackToOriginal(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.srcset) {
    img.removeAttribute("srcset");
    img.src = img.getAttribute("src") ?? img.src;
  }
}

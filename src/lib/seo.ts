import { useEffect } from "react";

const SUFFIX = " | VERDI SOLARR SOLUTION";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Client-side meta updates (static prerendered HTML already carries these for crawlers). */
export function usePageMeta(title: string, description?: string, opts: { noindex?: boolean } = {}) {
  useEffect(() => {
    const full = title.includes("VERDI") ? title : title + SUFFIX;
    document.title = full;
    setMeta("property", "og:title", full);
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
    }
    if (opts.noindex) setMeta("name", "robots", "noindex, nofollow");
    return () => {
      if (opts.noindex) document.head.querySelector('meta[name="robots"]')?.remove();
    };
  }, [title, description, opts.noindex]);
}

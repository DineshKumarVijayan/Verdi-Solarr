// Search-engine & link-preview HTML for product pages, plus a live sitemap.xml and robots.txt.
//
// /products/* runs through the Worker so EVERY product (including ones added in the admin after
// the last build) gets correct <title>, description, Open Graph/Twitter preview tags with the
// product photo, and schema.org Product JSON-LD with the live listed price (Google rich results).
// Only data the business entered is used: no invented stock, ratings or reviews.

import { formatPaise } from "../shared/money";
import type { PublicCatalogue, PublicProduct } from "../shared/types";
import { CATALOGUE_CACHE_KEY, handleCatalogue } from "./catalogue";
import { PAGE_SECURITY_HEADERS } from "./http";
import type { Env } from "./env";

const BUSINESS = "VERDI SOLARR SOLUTION";
const DEFAULT_IMAGE = "/media/hero-solar-farm-golden-1200.webp";

let memo: { version: string; data: PublicCatalogue } | null = null;

/** Parsed public catalogue (edge-cached response; parsed once per isolate per version). */
async function catalogue(env: Env, ctx: ExecutionContext): Promise<PublicCatalogue> {
  const res = await handleCatalogue(new Request(CATALOGUE_CACHE_KEY), env, ctx);
  const version = res.headers.get("X-Catalogue-Version") ?? res.headers.get("ETag") ?? "";
  if (memo && memo.version === version) return memo.data;
  const data = (await res.json()) as PublicCatalogue;
  memo = { version, data };
  return data;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const absolute = (origin: string, u: string) => (u.startsWith("http") ? u : origin + u);

function productJsonLd(p: PublicProduct, cat: PublicCatalogue, origin: string) {
  const brand = cat.brands.find((b) => b.id === p.brandId)?.name;
  const category = cat.categories.find((c) => c.id === p.categoryId);
  const url = `${origin}/products/${p.slug}`;
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    ...(p.model && !p.model.includes("XXX") ? { mpn: p.model } : {}),
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    ...(category ? { category: category.name } : {}),
    url,
    description: p.description ?? p.short ?? p.name,
    image: p.images.length ? p.images.map((i) => absolute(origin, i.url)) : [absolute(origin, DEFAULT_IMAGE)],
    additionalProperty: p.specs.slice(0, 20).map((s) => ({ "@type": "PropertyValue", name: s.l, value: s.v, ...(s.u ? { unitText: s.u } : {}) })),
    // Offer only when a price is actually listed. No availability/ratings (never claimed).
    ...(p.price.sellingPaise != null
      ? {
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "INR",
            price: (p.price.sellingPaise / 100).toFixed(2),
            seller: { "@type": "Organization", name: BUSINESS },
          },
        }
      : {}),
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      ["Home", "/"],
      ["Products", "/products"],
      ...(category ? [[category.name, `/category/${category.slug}`]] : []),
      [p.variant ?? p.name, `/products/${p.slug}`],
    ].map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: origin + path })),
  };
  return [product, crumbs];
}

export async function productPage(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const asset = await env.ASSETS.fetch(request);
  if (request.method !== "GET" || !asset.ok || !(asset.headers.get("Content-Type") ?? "").includes("text/html")) return asset;
  const url = new URL(request.url);
  const slug = decodeURIComponent(url.pathname.split("/")[2] ?? "");
  let cat: PublicCatalogue;
  try {
    cat = await catalogue(env, ctx);
  } catch {
    return asset; // never break the page because of SEO extras
  }
  const p = cat.products.find((x) => x.slug === slug);
  if (!p) return asset;

  const brand = cat.brands.find((b) => b.id === p.brandId)?.name ?? "";
  const title = `${p.name}${p.model ? ` (${p.model})` : ""}${brand ? ` — ${brand}` : ""} | ${BUSINESS}`;
  const price = p.price.sellingPaise != null ? `${formatPaise(p.price.sellingPaise)} ${p.price.unit}. ` : "";
  const description = `${price}${brand} ${p.short ?? p.name}. Specifications, datasheet and WhatsApp enquiry.`.slice(0, 300);
  const image = absolute(url.origin, p.images[0]?.url ?? DEFAULT_IMAGE);
  const canonical = `${url.origin}/products/${p.slug}`;
  const tags = [
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:type" content="product" />`,
    `<meta property="og:site_name" content="${BUSINESS}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:alt" content="${esc(p.images[0]?.alt ?? p.name)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...(p.price.sellingPaise != null ? [`<meta property="product:price:amount" content="${(p.price.sellingPaise / 100).toFixed(2)}" />`, `<meta property="product:price:currency" content="INR" />`] : []),
    ...productJsonLd(p, cat, url.origin).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`),
  ].join("\n    ");

  const remove = {
    element: (el: Element) => {
      el.remove();
    },
  };
  const res = new HTMLRewriter()
    .on("title", {
      element: (el) => {
        el.setInnerContent(title);
      },
    })
    .on('meta[name="description"]', remove)
    .on('meta[property^="og:"]', remove)
    .on('meta[name^="twitter:"]', remove)
    .on('link[rel="canonical"]', remove)
    .on('script[type="application/ld+json"]', remove)
    .on("head", {
      element: (el) => {
        el.append(tags, { html: true });
      },
    })
    .transform(asset);
  const out = new Response(res.body, res);
  out.headers.set("Cache-Control", "public, max-age=0, must-revalidate"); // price in the tags must stay current
  for (const [k, v] of Object.entries(PAGE_SECURITY_HEADERS)) out.headers.set(k, v);
  out.headers.delete("ETag");
  return out;
}

/** sitemap.xml = static routes from the build (routes.json) + every live product and category. */
export async function sitemap(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const origin = new URL(request.url).origin;
  const paths = new Set<string>(["/", "/products"]);
  try {
    const r = await env.ASSETS.fetch(new Request(`${origin}/routes.json`));
    if (r.ok) for (const p of (await r.json()) as string[]) paths.add(p);
  } catch {
    /* build without routes.json */
  }
  try {
    const cat = await catalogue(env, ctx);
    for (const c of cat.categories) paths.add(`/category/${c.slug}`);
    for (const p of cat.products) paths.add(`/products/${p.slug}`);
  } catch {
    /* catalogue unavailable: static routes only */
  }
  const day = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...paths]
    .map((p) => `  <url><loc>${esc(origin + p)}</loc><lastmod>${day}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

export function robots(request: Request): Response {
  const origin = new URL(request.url).origin;
  const body = ["User-agent: *", "Allow: /", "Disallow: /admin", "Disallow: /account", "Disallow: /api/", "Disallow: /enquiry", `Sitemap: ${origin}/sitemap.xml`].join("\n") + "\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

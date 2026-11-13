# Architecture

```
Browser ──► Cloudflare edge
             ├─ Static assets (HTML, JS, CSS, PDFs, pdf.js data)  ← no Worker invocation, free & unlimited
             │    • 98 prerendered SEO pages (products/x.html, category/x.html …)
             │    • SPA fallback index.html for /admin and client routes
             └─ /api/*  ──► Worker (worker/index.ts)
                   ├─ GET  /api/catalogue            public, edge-cached snapshot (1 D1 row on miss)
                   ├─ POST /api/enquiry/revalidate   authoritative prices for ≤50 items (1 query)
                   ├─ GET  /api/media/:key           R2 objects (Phase 2 uploads)
                   ├─ GET  /api/health
                   └─ /api/admin/*                   Access JWT + D1 allowlist + origin check
                         me · dashboard · prices (list) · prices/:id (PUT) · prices/:id/history
                                   │
                         Cloudflare D1 (SQLite)  ·  R2 bucket "verdi-media" (future)
```

## Free-tier-first decisions

Limits read from the official docs on 2026-11-13. Re-check them before relying on these figures, because they change.

| Resource | Free limit | How this site stays inside it |
|---|---|---|
| Worker requests | 100,000/day | Static pages, JS, PDFs and calculators never invoke the Worker. A typical visit makes **1** Worker call (`/api/catalogue`). An enquiry adds 1 (`revalidate`). |
| Worker CPU | 10 ms/request | The catalogue is returned as a pre-serialised string. JWT verification uses cached JWKS. |
| D1 rows read | 5 M/day | Public catalogue = **1 row** per edge-cache miss (≤1/min per location). Revalidate reads ≤50 rows. The rebuild (~1.3 k rows) happens only after an admin save. |
| D1 rows written | 100 k/day | Writes only on admin price saves (≈4 rows + snapshot). |
| D1 storage | 500 MB per DB, 5 GB per account | The catalogue is a few MB. Binaries are never stored in D1. |
| D1 queries per invocation | 50 | `db.batch()` is used (it counts as one). |
| R2 | 10 GB-month, 1 M Class A, 10 M Class B per month, free egress | Reserved for future uploads. Supplied PDFs are static assets. |
| Static assets | 20,000 files, 25 MiB per file | ~200 files today. The largest PDF is 4 MB. |
| Access | Seat count not stated on the pages read. Check Zero Trust → Plans. | Only staff log in. |

**When quotas are exceeded:** Worker requests over the limit return Cloudflare error 1027 for API calls. Static pages keep working, and the catalogue falls back to the copy cached in the visitor’s session. D1 errors are caught and returned as `503 capacity` with a friendly message (`worker/http.ts`). The enquiry page offers “Continue without prices” if revalidation fails, and never quotes stale prices.

**Monitoring:** Cloudflare dashboard → Workers & Pages → verdi-solarr → Metrics (requests, CPU, errors), and Storage & Databases → D1 → verdi-db → Metrics (rows read and written). Workers Observability logs are enabled in `wrangler.jsonc`.

## Catalogue publication and caching

1. D1 is authoritative.
2. `PublishedCatalogue` holds one denormalised JSON snapshot (public fields only) plus a `Version`.
3. `GET /api/catalogue` checks the Cache API (`caches.default`). On a miss it reads the snapshot row (building it if absent) and caches it for `PUBLIC_CACHE_SECONDS` (default 60 s). It returns an `ETag` (`W/"cat-<version>"`), and browsers revalidate after 30 s.
4. An admin price save commits the update, history and audit atomically, then calls `publishCatalogue()` (new version) and purges the local edge cache entry.
5. **Propagation:** Cache API purges are per data-centre, so other locations refresh within `PUBLIC_CACHE_SECONDS` (≤60 s plus up to 30 s of browser cache). The UI shows “Prices last published …”.
6. Before the WhatsApp message is generated, `/api/enquiry/revalidate` reads live prices straight from `ProductPrices`. Cached prices are never quoted as final.

If the catalogue grows past ~1,500 products, or the snapshot approaches D1’s 2 MB row limit, switch the public listing to paginated, indexed SQL search (`IX_Products_*`, optional FTS5) behind the same `shared/search.ts` interface.

## Rendering and SEO

The Vite SPA is code-split per route. pdf.js (≈440 KB) loads only when a datasheet is opened. `scripts/prerender.mjs` writes static HTML for every public route from `data/catalogue.mjs` at build time. Live prices are deliberately not baked in. `main.tsx` replaces the prerendered markup on boot. Products added later in D1 work immediately in the app, and gain prerendered SEO HTML on the next build.

## Security model

| Layer | Implementation |
|---|---|
| Edge authentication | Cloudflare Access application on `/admin*` and `/api/admin*` (production hostnames) |
| Server verification | `worker/auth.ts`: RS256 signature via team JWKS, `iss`, `aud`, `exp` (30 s skew), email claim. Fails **closed** (503) if Access is not configured. |
| Authorisation | Active row in `AdminUsers` (D1). Roles: owner, admin, price_editor (can edit), viewer (read-only). |
| CSRF / origin | Non-GET admin calls need `Origin` = request host, host in `ADMIN_ALLOWED_HOSTS`, and `Sec-Fetch-Site: same-origin`. This blocks writes from preview and workers.dev hosts. |
| Validation | Zod `.strict()` schemas. Integer paise between 0 and ₹10 crore. GST ∈ {0, 5, 12, 18, 28}. Selling price ≤ MRP. Body ≤ 16 KB. |
| Concurrency | `UPDATE … WHERE Version = expected`. History and audit rows are inserted only `WHERE changes() = 1`, all in one atomic batch. Conflicts return 409 with the current values. |
| SQL | Bound parameters only. `LIKE` input is escaped. |
| Rate limiting | Workers rate-limit bindings: 60 per minute per IP (revalidate) and 30 per minute per admin (writes). The code tolerates a missing binding. |
| Headers | CSP, HSTS, X-Frame-Options DENY, nosniff and Permissions-Policy (`public/_headers`). `noindex` on /admin. |
| Secrets | None in the repo. Access identifiers are non-secret vars. `.dev.vars` is git-ignored. |

## Media strategy

`ProductMedia.StorageKey` is either a static path (`/datasheets/x.pdf`) or `r2:<key>`, which is served via `/api/media/<key>` with immutable caching. `mediaUrl()` in `worker/catalogue.ts` abstracts both. D1 stores metadata only.

## Phase 2 expansion plan (product CRUD)

Already in place: brand and category tables, a media abstraction, an R2 binding, roles, audit logs, and snapshot republishing.
To add:
1. `worker/admin.ts`: endpoints for brands, categories, products and specs (create, update, archive via `IsActive`), each calling `publishCatalogue()` and writing `AuditLogs`.
2. Uploads: `POST /api/admin/media` with an extension, size (≤10 MB images, ≤25 MB PDF) and type allowlist. Key `products/<id>/<uuid>.<ext>`, `env.MEDIA.put`, plus a `ProductMedia` row. Replacing or reordering updates rows. Deleting removes the row first, then the R2 object.
3. Admin screens under `/admin/products`.
4. Optional Worker HTMLRewriter SEO for products created after the last build.

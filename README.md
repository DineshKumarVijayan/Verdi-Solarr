# VERDI SOLARR SOLUTION — website

B2B product discovery and enquiry platform for solar panels, inverters, optimisers, solar DC cables and solar electricals.
One Cloudflare application: a React single-page app served as static assets, plus a Worker for `/api/*`, backed by Cloudflare D1 (SQL) and R2 (future uploads).

| What | Where |
|---|---|
| Architecture & free-tier strategy | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Database schema, SQL examples, backups | [DATABASE.md](DATABASE.md) |
| How staff update prices | [ADMIN_GUIDE.md](ADMIN_GUIDE.md) |
| First-time Cloudflare setup (D1, R2, Access) | [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md) |
| GitHub → Cloudflare deploys, GoDaddy domain, rollback | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Rules for AI agents / contributors | [AGENTS.md](AGENTS.md) |

## Features

- **Catalogue**: 45 models (Anchor by Panasonic, SolarEdge) in 15 database-driven categories. Specifications are transcribed from the supplied manufacturer PDFs (`data/catalogue.mjs`).
- **Search**: instant client-side search over a cached catalogue snapshot (wattage, kW, phase, model, SKU, specs), with filters, sorting, highlighting and a Ctrl/⌘+K palette.
- **Datasheet modal**: the real PDF, rendered by pdf.js (lazy-loaded), with scrolling, zoom, download, open in new tab, Escape to close and focus restore.
- **Enquiry basket**: quantities persist in localStorage. Prices are revalidated against D1 in one request, changes are flagged, and a WhatsApp message preview offers Copy or Open WhatsApp.
- **Learning Hub**: system types, module technology, an interactive MPPT curve, a datasheet decoder, BOS, earthing, degradation, myths and warranty registration.
- **Solar tools**: appliance load, sizing and savings, roof fit, kit builder (with datasheet-based compatibility checks), battery, losses, orientation and a system explorer. All maths runs in the browser.
- **Integrated admin** (`/admin`): Cloudflare Access sign-in, a dashboard, and price editing with optimistic concurrency, history and an audit log.
- **SEO**: 74 prerendered routes with unique titles, canonical URLs, Product and Breadcrumb JSON-LD, sitemap and robots.

## Local development

Requirements: Node 20+ (tested on Node 24), npm.

```bash
npm install
cp .dev.vars.example .dev.vars          # local-only settings (admin bypass on localhost)
npm run db:migrate:local                # create tables in the local D1 (miniflare)
npm run db:seed:local                   # import catalogue (idempotent, never overwrites prices)
npm run dev                             # http://localhost:5173  (Worker + D1 run locally)
```

Locally, `/admin` signs you in as `DEV_ADMIN_EMAIL` from `.dev.vars`. This bypass works **only** when `ENVIRONMENT=development` **and** the host is `localhost`/`127.0.0.1`. It can never apply on a deployed site.

| Command | Purpose |
|---|---|
| `npm run typecheck` | TypeScript (app + worker) |
| `npm test` | Vitest unit tests (search, money, validation, WhatsApp, calculators, compatibility, auth) |
| `npm run test:e2e` | Playwright browser tests (desktop + mobile). Uses the dev server on :5173 |
| `BASE_URL=http://localhost:4173 npx playwright test` | Same tests against the production build (`npx vite preview --port 4173`) |
| `npm run build` | Typecheck, Vite build, then prerender SEO pages (set `SITE_URL` for canonical URLs and sitemap) |
| `npm run deploy` | Build and `wrangler deploy` (normally done by Workers Builds instead) |

> **Windows note:** run Vitest from a shell whose working directory is `C:\…` (capital drive letter). A lower-case `c:\` path makes Vitest load twice and fail with “failed to find the current suite”.

## Project structure

```
data/catalogue.mjs       Seed source transcribed from manufacturer PDFs (no prices)
migrations/              Versioned D1 SQL migrations
scripts/                 Seed generator, pdf.js asset copy, SEO prerender
shared/                  Code shared by browser + Worker: types, Zod schemas, search, money, WhatsApp, calculators
worker/                  Cloudflare Worker: routing, Access JWT auth, catalogue publication, admin API
src/                     React app (pages, components, state)
public/datasheets/       Supplied manufacturer PDFs (served as static assets)
public/_headers          Security & cache headers for static assets
tests/unit, tests/e2e    Vitest and Playwright suites
```

## Assets still needed from the business

1. **Company logo.** `src/components/Logo.tsx` is a typographic placeholder.
2. **Product photographs.** Cards currently show labelled category *illustrations* and never fake photos. See ADMIN_GUIDE.md, “Adding product photos”.
3. **Instagram URL.** Set `instagramUrl` in `src/site.ts` (intentionally empty).
4. **Prices.** All 45 products start as “Price on request” until an admin enters prices.
5. **Production domain name.** Used for `SITE_URL`, `ADMIN_ALLOWED_HOSTS` and Access.

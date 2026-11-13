# Cloudflare setup (one-time)

Everything here uses the free plans. Steps marked **(dashboard)** are done at dash.cloudflare.com.

## 0. Prerequisites
- A Cloudflare account (free).
- Node 20+ and this repository cloned. Run `npm install`.
- `npx wrangler login`, which opens the browser to authorise Wrangler.

## 1. Create the D1 database
```bash
npx wrangler d1 create verdi-db
```
Copy the printed `database_id` into `wrangler.jsonc` → `d1_databases[0].database_id` (it replaces the zeros) and commit. The id is not a secret.

```bash
npm run db:migrate:remote      # creates tables (asks for confirmation)
npm run db:seed:remote         # imports the 45 products, categories and the owner admin (insert-only, never touches prices)
```
To make someone else the owner admin at seed time: `node scripts/generate-seed.mjs --admin=person@example.com`, then `npx wrangler d1 execute verdi-db --remote --file=./seed/seed.sql`.

## 2. Create the R2 bucket (for future uploads)
```bash
npx wrangler r2 bucket create verdi-media
```
Leave it **private**. The Worker serves objects through `/api/media/…`, and no public bucket access is needed.

## 3. First deploy (to a workers.dev test URL)
```bash
npm run deploy
```
Open the printed `https://verdi-solarr.<your-subdomain>.workers.dev`, then check:
- `/api/health` returns `{ "ok": true }`
- the home page, `/products`, a product page and a datasheet preview all work
- `/admin` shows **“Admin sign-in not configured”**. This is correct: admin fails closed until Access is set up.

If the deploy is rejected because of the `ratelimits` block (rate-limit bindings might not be available on your plan), remove that block from `wrangler.jsonc`. The code works without it.

## 4. Cloudflare Access (admin login) (dashboard)
Do this once your production domain is on Cloudflare (see DEPLOYMENT.md §3). Access needs a hostname.

1. **Zero Trust** → choose a team name (e.g. `verdisolarr`). Your team domain becomes `https://verdisolarr.cloudflareaccess.com`. Pick the **Free** plan.
2. **Settings → Authentication → Login methods**: keep **One-time PIN** (email code). You can optionally add Google.
3. **Access → Applications → Add an application → Self-hosted**:
   - Name: `VERDI Admin`
   - Session duration: 8 hours
   - Public hostnames (add each one):
     - `www.<your-domain>` path `admin`
     - `www.<your-domain>` path `api/admin`
     - and the same two for the root domain `<your-domain>` if it serves the site
   - Policy: **Allow**, Include → **Emails** → the staff email(s).
4. Open the application → **Overview / Additional settings** and copy the **Application Audience (AUD) Tag**.
5. In `wrangler.jsonc` → `vars` set:
   ```jsonc
   "ACCESS_TEAM_DOMAIN": "https://verdisolarr.cloudflareaccess.com",
   "ACCESS_AUD": "<AUD tag>",
   "ADMIN_ALLOWED_HOSTS": "www.<your-domain>,<your-domain>"
   ```
   Commit and deploy. These values are identifiers, not secrets.
6. Make sure every admin email also exists in D1 `AdminUsers` (the seed adds the owner). Access lets a person sign in, and the D1 allowlist decides whether they may administer.

### Preview / workers.dev hostnames
Access path rules only cover the hostnames you list. The Worker therefore also:
- rejects any admin API call without a valid JWT for **your** AUD (so preview URLs cannot read admin data);
- rejects admin writes on any host not in `ADMIN_ALLOWED_HOSTS`.

Optionally, also enable Access for preview URLs in the Worker’s **Settings → Domains & Routes** if your dashboard offers it. Once the custom domain works, you may set `"workers_dev": false` in `wrangler.jsonc` to switch the workers.dev URL off entirely.

### Verify (must be done on the real deployment)
- In a private window, open `https://www.<domain>/admin`. You should be redirected to the Cloudflare login.
- Sign in with an allowed email. The dashboard loads and shows your email and role.
- Sign in with a non-listed email. Access should block you.
- `curl -X PUT https://www.<domain>/api/admin/prices/1` (no token) should return 401 or Access’s login redirect.
- On the workers.dev URL, `/api/admin/me` should return 401 or 503.

## 5. Environment variables reference

| Name | Where | Example | Purpose |
|---|---|---|---|
| `ENVIRONMENT` | wrangler vars | `production` | Must not be `development` in production |
| `ACCESS_TEAM_DOMAIN` | wrangler vars | `https://verdisolarr.cloudflareaccess.com` | JWT issuer + JWKS |
| `ACCESS_AUD` | wrangler vars | `a1b2…` (comma-separate several) | JWT audience |
| `ADMIN_ALLOWED_HOSTS` | wrangler vars | `www.example.in,example.in` | Hosts allowed to perform admin writes |
| `PUBLIC_CACHE_SECONDS` | wrangler vars | `60` | Edge cache TTL for the public catalogue (10–600) |
| `SITE_URL` | **build** env (Workers Builds → Variables) | `https://www.example.in` | Canonical URLs, sitemap.xml, robots Sitemap |
| `DEV_ADMIN_EMAIL` | `.dev.vars` only | | Local admin bypass (localhost only) |

## 6. Usage monitoring
- Workers & Pages → `verdi-solarr` → **Metrics**: requests per day (free: 100k), errors, CPU.
- Storage & Databases → D1 → `verdi-db` → **Metrics**: rows read and written per day (free: 5M / 100k).
- R2 → `verdi-media` → **Metrics**.
- **Notifications** → add alerts for Workers usage and errors if available on your plan.
Normal expected load is tiny: one Worker request per visitor, plus one per enquiry.

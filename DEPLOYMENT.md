# Deployment: GitHub → Cloudflare Workers Builds, GoDaddy domain, rollback

Repository: `https://github.com/DineshKumarVijayan/Verdi-Solarr`
Branches: `main` = production (merged only with the owner’s approval) · `develop` and feature branches = previews.

## 1. Connect GitHub to Workers Builds (dashboard)
Complete CLOUDFLARE_SETUP.md §1–3 first (D1 id in `wrangler.jsonc`, one manual deploy).

1. Workers & Pages → `verdi-solarr` → **Settings → Builds → Connect** → GitHub → authorise the Cloudflare app for **only** the `Verdi-Solarr` repository.
2. Build configuration:
   | Setting | Value |
   |---|---|
   | Production branch | `main` |
   | Build command | `npm run build` |
   | Deploy command | `npx wrangler deploy` |
   | Non-production branch deploy command | `npx wrangler versions upload` (creates a preview / version URL without touching production) |
   | Root directory | `/` |
   | Build variables | `SITE_URL=https://www.<your-domain>` (and `NODE_VERSION=22` if the default Node is older) |
3. The Worker name in the dashboard must match `"name": "verdi-solarr"` in `wrangler.jsonc`, or the build fails.
4. No secrets are needed in GitHub. Builds use Cloudflare’s own build token. Never commit `.dev.vars`.

**Behaviour:**
- A push to `develop` or a pull request builds and uploads a **preview version**, and production is unchanged. The preview URL appears in the dashboard (and on the PR for supported providers).
- Merging to `main` builds and deploys. If `npm run build` (which includes `tsc`) fails, **nothing is deployed** and the previous production version keeps serving.
- Preview URLs share the production D1 binding. They can read public data, and admin writes are refused there (not in `ADMIN_ALLOWED_HOSTS`). For an isolated preview database, add a second D1 database and a `env.preview` block later.

**Recommended PR checks** (locally or in CI): `npm run typecheck && npm test && npm run build`.

## 2. Database changes during deploys
- Builds **do not** run migrations or seeds automatically, so production data is never reset by a push.
- When a PR adds a file to `migrations/`: review it, then **before merging** run
  `npx wrangler d1 export verdi-db --remote --output=backups/pre-<date>.sql` and `npm run db:migrate:remote`.
  Migrations must be additive and backward compatible, so the currently live code keeps working.
- To import new catalogue products: update `data/catalogue.mjs`, then `npm run db:seed:remote` (insert-only, prices untouched).
- R2 objects and D1 rows are independent of frontend releases.

## 3. GoDaddy domain → Cloudflare
A Workers **custom domain** needs the domain’s DNS zone on Cloudflare. On the Free plan that means changing the domain’s **nameservers** at GoDaddy to Cloudflare’s. This is **not** a domain transfer: GoDaddy stays the registrar and you keep renewing there.

> ⚠️ **Changing nameservers moves ALL DNS for the domain to Cloudflare, including email.** If any record is missed, email (MX), Google/Microsoft verification or other services can stop working. Follow the checklist and change nothing else at GoDaddy.

1. **Test first.** Confirm the workers.dev deployment works (CLOUDFLARE_SETUP.md §3).
2. **Record existing DNS.** In GoDaddy → My Products → Domain → **DNS**, screenshot or export every record. Pay particular attention to:
   - **MX** (mail servers), **TXT** (SPF `v=spf1 …`, DMARC `_dmarc`, Google/Microsoft site verification), **CNAME** (DKIM selectors such as `google._domainkey`, `selector1._domainkey`, plus `autodiscover`, `mail`)
   - any existing **A/CNAME** for `@` and `www` (a current website), and subdomains in use.
3. **Add the site to Cloudflare:** dashboard → **Add a domain** → enter the domain → Free plan. Cloudflare scans and imports records.
4. **Compare** the imported list against your GoDaddy records. Add anything missing, and keep MX, SPF, DKIM and DMARC exactly the same. Set mail-related records to **DNS only** (grey cloud).
5. Cloudflare shows two nameservers (e.g. `xxx.ns.cloudflare.com`). In GoDaddy → Domain → **Nameservers** → **Change** → **“I’ll use my own nameservers”** → enter both → Save. If GoDaddy’s DNSSEC is on, turn it **off** first, then re-enable DNSSEC later from Cloudflare.
6. Wait for Cloudflare to show the domain as **Active** (minutes to 24 h). Send and receive a test email to confirm mail still works.
7. **Attach the Worker:** Workers & Pages → `verdi-solarr` → **Settings → Domains & Routes → Add → Custom domain** → `www.<domain>`, and again for `<domain>` (root). Cloudflare creates the DNS records and the certificate. **If an old website’s A/CNAME record exists for those names, remove it only now**, and only once you are ready to switch.
8. **HTTPS:** SSL/TLS → Overview → **Full (strict)**. Edge Certificates → **Always Use HTTPS** on. Wait for the certificates to show *Active*.
9. **Root vs www:** pick one canonical host (recommended: `www`). Add a Redirect Rule (Rules → Redirect Rules → template “Redirect from root to WWW”) so `https://<domain>/*` → `https://www.<domain>/${1}` with a 301. Use the same host in `SITE_URL` and Access.
10. Configure **Cloudflare Access** (CLOUDFLARE_SETUP.md §4) for the final hostnames and set `ADMIN_ALLOWED_HOSTS`. Deploy.
11. **Verify on the live domain:** home and product pages, a datasheet modal, search, an enquiry through to the WhatsApp preview, `/robots.txt`, `/sitemap.xml`, admin login and a price save (then check it on the public page within about a minute), and email delivery.

Do not modify any other domains or zones in the account.

## 4. Rollback
- **Code:** Workers & Pages → `verdi-solarr` → **Deployments** → choose a previous version → **Rollback**. Or from the CLI: `npx wrangler rollback`. Static assets roll back with the version.
- **Data:** D1 Time Travel (`npx wrangler d1 time-travel restore verdi-db --timestamp=…`, last 7 days on Free) or re-import an export (DATABASE.md). Export first, because a restore replaces the whole database.
- **Bad price:** simply edit it again in Admin → Prices. History keeps the trail.

## 5. Verification status (be explicit)
| Item | Status |
|---|---|
| Local build, typecheck, 40 unit tests, 20 Playwright tests (desktop + mobile) against the production build with CSP | ✅ verified locally (Workers runtime via miniflare + local D1) |
| Seed idempotency (prices untouched on re-run) | ✅ verified locally |
| Cloudflare deploy, remote D1, Workers Builds | ⏳ not yet performed (requires the owner’s Cloudflare login) |
| Cloudflare Access login and JWT verification with a real token | ⏳ must be verified on the deployed domain |
| GoDaddy DNS / HTTPS / custom domain | ⏳ not performed: requires the domain name and the owner’s action |

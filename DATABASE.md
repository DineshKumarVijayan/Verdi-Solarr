# Database (Cloudflare D1, SQLite dialect)

Database name: `verdi-db` · binding: `DB` · migrations: `migrations/` · money = **INTEGER paise** (₹1 = 100 paise) · timestamps = ISO-8601 UTC text.

## Tables

| Table | Purpose | Key columns |
|---|---|---|
| `Brands` | Manufacturers | `BrandSlug` UNIQUE, `IsActive` |
| `Categories` | Product categories (supports `ParentCategoryId`) | `CategorySlug` UNIQUE, `SortOrder` |
| `Products` | One row per sellable model or variant | `SKU` UNIQUE, `ProductSlug` UNIQUE, `BrandId`, `CategoryId`, `SeriesKey` (groups the variants of one datasheet), `HighlightsJson` |
| `ProductPrices` | Current price, 1:1 with product | `SellingPricePaise` (NULL = on request), `MRPPaise`, `GSTIncluded`, `GSTRate`, `PriceUnit`, `Version` (concurrency), `UpdatedBy` |
| `ProductPriceHistory` | Every committed price change | old/new price, MRP and GST, `ChangedBy`, `ChangedAt`, `ChangeReason` |
| `ProductSpecifications` | Key/label/value/unit/group rows | UNIQUE(`ProductId`,`SpecificationKey`) |
| `ProductMedia` | Images and datasheets (metadata only) | `MediaType` image/datasheet/document, `StorageKey` (`/static/path` or `r2:key`) |
| `AdminUsers` | Admin allowlist and roles (no passwords; Access handles login) | `Email` UNIQUE NOCASE, `Role`, `IsActive`, `LastLoginAt` |
| `AuditLogs` | Admin actions with before/after JSON | `AdminIdentity`, `Action`, `EntityType`, `EntityId` |
| `PublishedCatalogue` | Derived public snapshot (1 row). Safe to delete because it rebuilds itself. | `Version`, `PayloadJson`, `PublishedAt` |

## Running SQL

**Cloudflare dashboard:** Storage & Databases → D1 SQL Database → `verdi-db` → **Console**. Type SQL and run it. The **Tables** tab browses rows.

**VS Code / terminal (Wrangler):**
```bash
npx wrangler login                                                   # once
npx wrangler d1 execute verdi-db --remote --command "SELECT COUNT(*) FROM Products"
npx wrangler d1 execute verdi-db --remote --file=./my-query.sql
npx wrangler d1 execute verdi-db --local  --command "..."            # local dev database
```
Add `--json` for machine-readable output. Keep ad-hoc queries in a `queries/` folder and run them with `--file`.

**Local database file:** `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite` can be opened read-only with any SQLite viewer (e.g. the VS Code “SQLite Viewer” extension) while the dev server is stopped.

## Migrations

```bash
npx wrangler d1 migrations list  verdi-db --remote     # what's pending
npm run db:migrate:remote                              # apply pending (tracked in the d1_migrations table)
```
Create a new one with `npx wrangler d1 migrations create verdi-db add_something`, then write additive SQL (`ALTER TABLE … ADD COLUMN`, `CREATE INDEX IF NOT EXISTS`). Never edit an applied migration file.

## Seeding / importing products

`npm run db:seed:remote` runs `scripts/generate-seed.mjs`, then executes `seed/seed.sql`:
- **insert-only**: existing products, specs and media are left untouched, and **prices are never overwritten**;
- `node scripts/generate-seed.mjs --refresh-content` additionally updates descriptions and specs from `data/catalogue.mjs` (still never prices);
- clears only `PublishedCatalogue` (a derived cache).
It is verified idempotent: re-running it leaves counts, prices and history unchanged.

## Backup and recovery

- **Time Travel** (built in, 7 days on Free): `npx wrangler d1 time-travel info verdi-db`, then restore with `npx wrangler d1 time-travel restore verdi-db --timestamp=2026-11-20T10:00:00Z`. A restore replaces the whole database, so export first.
- **Export** (do this before any risky change, and periodically):
  `npx wrangler d1 export verdi-db --remote --output=backups/verdi-$(date +%F).sql`
  Data only: `--no-schema`. Single table: `--table=ProductPrices`.
- **Restore an export into a new database:** `npx wrangler d1 create verdi-db-restore`, then `npx wrangler d1 execute verdi-db-restore --remote --file=backups/….sql`.
Keep exports outside the repository (they contain admin emails).

## Sample queries

```sql
-- All products with brand and category
SELECT p.ProductId, p.SKU, p.ProductName, p.ModelNumber, b.BrandName, c.CategoryName, p.IsActive
FROM Products p JOIN Brands b ON b.BrandId = p.BrandId JOIN Categories c ON c.CategoryId = p.CategoryId
ORDER BY c.SortOrder, p.SeriesKey, p.ProductId;

-- Products by manufacturer
SELECT p.SKU, p.ProductName FROM Products p JOIN Brands b ON b.BrandId = p.BrandId
WHERE b.BrandSlug = 'solaredge' AND p.IsActive = 1;

-- Current prices in rupees
SELECT p.SKU, p.ProductName,
       pp.SellingPricePaise / 100.0 AS SellingRupees, pp.MRPPaise / 100.0 AS MRPRupees,
       pp.GSTRate, CASE pp.GSTIncluded WHEN 1 THEN 'incl.' ELSE 'extra' END AS GST,
       pp.PriceUnit, pp.UpdatedBy, pp.UpdatedAt
FROM Products p JOIN ProductPrices pp ON pp.ProductId = p.ProductId
ORDER BY pp.UpdatedAt DESC;

-- Products missing a price
SELECT p.SKU, p.ProductName FROM Products p JOIN ProductPrices pp ON pp.ProductId = p.ProductId
WHERE p.IsActive = 1 AND pp.SellingPricePaise IS NULL;

-- Price change history for one product
SELECT h.ChangedAt, h.ChangedBy, h.OldPricePaise / 100.0 AS OldRs, h.NewPricePaise / 100.0 AS NewRs, h.ChangeReason
FROM ProductPriceHistory h JOIN Products p ON p.ProductId = h.ProductId
WHERE p.SKU = 'VS-ANC-TOPCON-620' ORDER BY h.ChangedAt DESC;

-- Products missing images
SELECT p.SKU, p.ProductName FROM Products p
WHERE p.IsActive = 1 AND NOT EXISTS (SELECT 1 FROM ProductMedia m WHERE m.ProductId = p.ProductId AND m.MediaType = 'image');

-- Products missing datasheets
SELECT p.SKU, p.ProductName FROM Products p
WHERE p.IsActive = 1 AND NOT EXISTS (SELECT 1 FROM ProductMedia m WHERE m.ProductId = p.ProductId AND m.MediaType = 'datasheet');

-- Recently updated prices (last 7 days)
SELECT p.SKU, p.ProductName, pp.UpdatedAt, pp.UpdatedBy FROM ProductPrices pp JOIN Products p ON p.ProductId = pp.ProductId
WHERE pp.UpdatedAt >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-7 days') ORDER BY pp.UpdatedAt DESC;

-- Active vs inactive products
SELECT CASE IsActive WHEN 1 THEN 'active' ELSE 'archived' END AS Status, COUNT(*) FROM Products GROUP BY IsActive;

-- Admin activity
SELECT CreatedAt, AdminIdentity, Action, EntityType, EntityId FROM AuditLogs ORDER BY CreatedAt DESC LIMIT 50;

-- Look up a spec across products (e.g. all inverters with 2 MPPT)
SELECT p.ProductName FROM ProductSpecifications s JOIN Products p ON p.ProductId = s.ProductId
WHERE s.SpecificationKey = 'mppt_count' AND s.SpecificationValue = '2';
```

**Admin management (SQL):**
```sql
INSERT INTO AdminUsers (Email, DisplayName, Role) VALUES ('person@example.com', 'Name', 'price_editor');
UPDATE AdminUsers SET IsActive = 0 WHERE Email = 'person@example.com';      -- revoke
```
After changing prices or products **directly with SQL**, run `DELETE FROM PublishedCatalogue;` so the public snapshot is rebuilt from D1 on the next visit (within the 60 s edge cache). SQL edits bypass price history and the audit log, so prefer the admin screen.

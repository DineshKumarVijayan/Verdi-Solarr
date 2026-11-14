// Safety gate for automatic production migrations (runs in every build and before deploys).
//
// 1. Applied migrations must never be edited: each file's SHA-256 is pinned in migrations/checksums.json.
//    New files are pinned automatically the first time this runs locally (npm run build / db:migrate:local).
//    In CI (CI=true) an unpinned or changed file fails the build.
// 2. Migrations must be additive: DROP TABLE / DROP COLUMN / DELETE FROM / TRUNCATE and any write to
//    ProductPrices (live prices) are refused, unless the file carries an explicit
//    "-- allow-destructive: <reason>" line approved by the owner.
//
// Usage: node scripts/check-migrations.mjs [--update]

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = "migrations";
const lockFile = join(dir, "checksums.json");
const ci = !!process.env.CI || !!process.env.WORKERS_CI;
const update = process.argv.includes("--update") || !ci;

const lock = existsSync(lockFile) ? JSON.parse(readFileSync(lockFile, "utf8")) : {};
const files = readdirSync(dir).filter((f) => /^\d{4}_[\w-]+\.sql$/.test(f)).sort();
const errors = [];
let changed = false;

const RULES = [
  [/\bDROP\s+TABLE\b/i, "DROP TABLE"],
  [/\bDROP\s+COLUMN\b/i, "DROP COLUMN"],
  [/\bDELETE\s+FROM\b/i, "DELETE FROM"],
  [/\bTRUNCATE\b/i, "TRUNCATE"],
  [/\b(UPDATE|INSERT\s+OR\s+REPLACE\s+INTO|REPLACE\s+INTO|INSERT\s+INTO)\s+ProductPrices\b/i, "a write to ProductPrices (live prices)"],
];

for (const f of files) {
  const sql = readFileSync(join(dir, f), "utf8");
  const hash = createHash("sha256").update(sql.replace(/\r\n/g, "\n")).digest("hex");
  if (lock[f] && lock[f] !== hash) errors.push(`${f} was changed after it was pinned. Never edit an applied migration: add a new numbered file instead.`);
  if (!lock[f]) {
    if (update) {
      lock[f] = hash;
      changed = true;
    } else errors.push(`${f} is not pinned in ${lockFile}. Run "node scripts/check-migrations.mjs --update" locally and commit the file.`);
  }
  const allowed = /^--\s*allow-destructive:\s*\S/m.test(sql);
  const code = sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  // The initial schema creates ProductPrices; only later files are checked for price writes.
  for (const [re, label] of RULES) {
    if (f.startsWith("0001_") && label.includes("ProductPrices")) continue;
    if (re.test(code) && !allowed) errors.push(`${f} contains ${label}. Production migrations must be additive (add "-- allow-destructive: <reason>" only with the owner's approval).`);
  }
}

if (changed) writeFileSync(lockFile, JSON.stringify(lock, null, 2) + "\n");
if (errors.length) {
  console.error("Migration check FAILED:\n - " + errors.join("\n - "));
  process.exit(1);
}
console.log(`Migration check passed (${files.length} files${changed ? ", new files pinned" : ""}).`);

// Same hash format as worker/crypto.ts ("pbkdf2_sha256$iterations$salt$hash"), for setup scripts.
import { webcrypto as crypto } from "node:crypto";

const b64url = (b) => Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export async function hashPassword(password, iterations = 100_000) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password.normalize("NFKC")), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return `pbkdf2_sha256$${iterations}$${b64url(salt)}$${b64url(new Uint8Array(bits))}`;
}

export function normaliseMobile(input) {
  let d = String(input).replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (d.length === 10) d = "91" + d;
  return /^91[6-9]\d{9}$/.test(d) ? d : null;
}

export const sqlString = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

/** Run SQL against D1 via a temp file (avoids shell-quoting problems on Windows). */
export async function runD1(sql, remote = false, quiet = false) {
  const { execFileSync } = await import("node:child_process");
  const { writeFileSync, rmSync, mkdtempSync } = await import("node:fs");
  const { join } = await import("node:path");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(join(tmpdir(), "verdi-sql-"));
  const file = join(dir, "run.sql");
  writeFileSync(file, sql);
  try {
    execFileSync("npx", ["wrangler", "d1", "execute", "verdi-db", remote ? "--remote" : "--local", `--file=${file}`], { stdio: quiet ? "ignore" : "inherit", shell: process.platform === "win32" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

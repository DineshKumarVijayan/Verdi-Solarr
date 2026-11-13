import { execSync } from "node:child_process";
import { request } from "@playwright/test";

// Creates the local test owner + test customer, then signs the owner in once and
// shares that admin session with all tests (storageState).
export const OWNER = { mobile: "9000000001", password: "Owner@12345" };
export const CUSTOMER = { mobile: "9000000002", password: "Customer@12345" };

export default async function globalSetup() {
  execSync("node scripts/dev-users.mjs", { stdio: "inherit" });
  const base = process.env.BASE_URL ?? "http://localhost:5173";
  const ctx = await request.newContext({ baseURL: base });
  const r = await ctx.post("/api/admin/login", { headers: { Origin: base }, data: { login: OWNER.mobile, password: OWNER.password } });
  if (!r.ok()) throw new Error(`Test owner sign-in failed: ${r.status()} ${await r.text()}`);
  await ctx.storageState({ path: "tests/e2e/.auth/owner.json" });
  await ctx.dispose();
}

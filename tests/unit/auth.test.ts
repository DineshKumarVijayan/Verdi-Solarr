import { describe, expect, it } from "vitest";
import { assertCanEditPrices, assertSameOrigin, requireAdmin } from "../../worker/auth";
import type { Env } from "../../worker/env";
import { HttpError } from "../../worker/http";

const env = (over: Partial<Env> = {}): Env =>
  ({ ENVIRONMENT: "production", ADMIN_ALLOWED_HOSTS: "verdi.example", PUBLIC_CACHE_SECONDS: "60", ...over }) as Env;

async function status(p: Promise<unknown>): Promise<number> {
  try {
    await p;
    return 200;
  } catch (e) {
    return e instanceof HttpError ? e.status : 500;
  }
}

describe("admin session check (server-side, fail closed)", () => {
  // DB that never finds a session: proves unknown/forged tokens are rejected.
  const db = { prepare: () => ({ bind: () => ({ first: async () => null }) }) } as unknown as D1Database;
  it("401 when no session cookie is presented", async () => {
    expect(await status(requireAdmin(new Request("https://verdi.example/api/admin/me"), env({ DB: db })))).toBe(401);
  });
  it("401 for a malformed cookie", async () => {
    const req = new Request("https://verdi.example/api/admin/me", { headers: { Cookie: "__Host-vs_admin=<script>" } });
    expect(await status(requireAdmin(req, env({ DB: db })))).toBe(401);
  });
  it("401 for an unknown / forged session token", async () => {
    const req = new Request("https://verdi.example/api/admin/me", { headers: { Cookie: "__Host-vs_admin=" + "A".repeat(43) } });
    expect(await status(requireAdmin(req, env({ DB: db })))).toBe(401);
  });
  it("a customer session cookie is not an admin session", async () => {
    const req = new Request("https://verdi.example/api/admin/me", { headers: { Cookie: "__Host-vs_session=" + "A".repeat(43) } });
    expect(await status(requireAdmin(req, env({ DB: db })))).toBe(401);
  });
});

describe("origin / CSRF protection", () => {
  const put = (url: string, headers: Record<string, string>) => new Request(url, { method: "PUT", headers });
  it("allows a same-origin request on an allowed host", () => {
    expect(() => assertSameOrigin(put("https://verdi.example/api/admin/prices/1", { Origin: "https://verdi.example", "Sec-Fetch-Site": "same-origin" }), env())).not.toThrow();
  });
  it("rejects a missing Origin", () => {
    expect(() => assertSameOrigin(put("https://verdi.example/api/admin/prices/1", {}), env())).toThrow(HttpError);
  });
  it("rejects a cross-site Origin", () => {
    expect(() => assertSameOrigin(put("https://verdi.example/api/admin/prices/1", { Origin: "https://evil.example" }), env())).toThrow(/Cross-origin/);
  });
  it("rejects writes on a non-allowlisted hostname (e.g. preview URL)", () => {
    expect(() => assertSameOrigin(put("https://abc.verdi-solarr.workers.dev/api/admin/prices/1", { Origin: "https://abc.verdi-solarr.workers.dev" }), env())).toThrow(/not permitted/);
  });
});

describe("roles", () => {
  it("viewer cannot edit prices", () => {
    expect(() => assertCanEditPrices({ email: "a@b.c", displayName: null, role: "viewer" })).toThrow(/role/);
    expect(() => assertCanEditPrices({ email: "a@b.c", displayName: null, role: "price_editor" })).not.toThrow();
  });
});

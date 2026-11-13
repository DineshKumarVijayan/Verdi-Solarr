import { describe, expect, it } from "vitest";
import { assertCanEditPrices, assertSameOrigin, normaliseTeamDomain, verifyAccessIdentity } from "../../worker/auth";
import type { Env } from "../../worker/env";
import { HttpError } from "../../worker/http";

const env = (over: Partial<Env> = {}): Env =>
  ({ ENVIRONMENT: "production", ACCESS_TEAM_DOMAIN: "", ACCESS_AUD: "", ADMIN_ALLOWED_HOSTS: "verdi.example", PUBLIC_CACHE_SECONDS: "60", ...over }) as Env;

async function status(p: Promise<unknown>): Promise<number> {
  try {
    await p;
    return 200;
  } catch (e) {
    return e instanceof HttpError ? e.status : 500;
  }
}

describe("Access JWT verification (server-side, fail closed)", () => {
  it("refuses admin access when Access is not configured", async () => {
    expect(await status(verifyAccessIdentity(new Request("https://verdi.example/api/admin/me"), env()))).toBe(503);
  });
  it("401 when no Access token is presented", async () => {
    const e = env({ ACCESS_TEAM_DOMAIN: "verdi.cloudflareaccess.com", ACCESS_AUD: "aud123" });
    expect(await status(verifyAccessIdentity(new Request("https://verdi.example/api/admin/me"), e))).toBe(401);
  });
  it("401 for a forged / malformed token", async () => {
    const e = env({ ACCESS_TEAM_DOMAIN: "verdi.cloudflareaccess.com", ACCESS_AUD: "aud123" });
    const req = new Request("https://verdi.example/api/admin/me", { headers: { "Cf-Access-Jwt-Assertion": "eyJhbGciOiJub25lIn0.eyJlbWFpbCI6ImFAYi5jIn0." } });
    expect(await status(verifyAccessIdentity(req, e))).toBe(401);
  });
  it("ignores the dev bypass on non-localhost hosts", async () => {
    const e = env({ ENVIRONMENT: "development", DEV_ADMIN_EMAIL: "x@y.z" });
    expect(await status(verifyAccessIdentity(new Request("https://preview.workers.dev/api/admin/me"), e))).toBe(503);
  });
  it("ignores the dev bypass in production even on localhost", async () => {
    const e = env({ ENVIRONMENT: "production", DEV_ADMIN_EMAIL: "x@y.z" });
    expect(await status(verifyAccessIdentity(new Request("http://localhost/api/admin/me"), e))).toBe(503);
  });
  it("normalises team domains", () => {
    expect(normaliseTeamDomain("verdi.cloudflareaccess.com/")).toBe("https://verdi.cloudflareaccess.com");
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

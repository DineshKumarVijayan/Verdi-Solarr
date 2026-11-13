// Admin authentication & authorisation.
//
// Layer 1 (edge): Cloudflare Access application protects /admin* and /api/admin* on the
//                 production hostname(s) and redirects unauthenticated users to log in.
// Layer 2 (here): EVERY privileged API call independently verifies the Access JWT
//                 (signature via team JWKS, issuer, audience, expiry) — so preview URLs,
//                 workers.dev, or a misconfigured Access path cannot bypass authentication.
// Layer 3 (here): the verified email must be an active row in the D1 AdminUsers allowlist,
//                 and the role must permit the action.

import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import type { AdminIdentity, AdminRole } from "../shared/types";
import type { Env } from "./env";
import { HttpError } from "./http";

let jwksCache: { url: string; jwks: JWTVerifyGetKey } | null = null;

function getJwks(teamDomain: string): JWTVerifyGetKey {
  const url = `${teamDomain}/cdn-cgi/access/certs`;
  if (!jwksCache || jwksCache.url !== url) jwksCache = { url, jwks: createRemoteJWKSet(new URL(url)) };
  return jwksCache.jwks;
}

export function normaliseTeamDomain(raw: string): string {
  const t = raw.trim().replace(/\/+$/, "");
  if (!t) return "";
  return t.startsWith("https://") ? t : `https://${t}`;
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Returns the verified email of the caller, or throws 401. */
export async function verifyAccessIdentity(request: Request, env: Env): Promise<string> {
  const url = new URL(request.url);

  // Local development shortcut — impossible to trigger in production because it requires
  // BOTH ENVIRONMENT=development (set only in .dev.vars) AND a localhost hostname.
  if (env.ENVIRONMENT === "development" && env.DEV_ADMIN_EMAIL && LOCAL_HOSTS.has(url.hostname)) {
    return env.DEV_ADMIN_EMAIL.toLowerCase();
  }

  const team = normaliseTeamDomain(env.ACCESS_TEAM_DOMAIN ?? "");
  const audiences = (env.ACCESS_AUD ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!team || audiences.length === 0) {
    // Fail closed: never allow admin access when Access is not configured.
    throw new HttpError(503, "auth_not_configured", "Admin sign-in is not configured for this deployment.");
  }

  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) throw new HttpError(401, "unauthenticated", "Please sign in to continue.");

  try {
    const { payload } = await jwtVerify(token, getJwks(team), {
      issuer: team,
      audience: audiences,
      algorithms: ["RS256"],
      clockTolerance: 30,
    });
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!email) throw new HttpError(401, "unauthenticated", "Your sign-in token has no email identity.");
    return email;
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(401, "unauthenticated", "Your session is invalid or has expired. Please sign in again.");
  }
}

export async function requireAdmin(request: Request, env: Env): Promise<AdminIdentity> {
  const email = await verifyAccessIdentity(request, env);
  const row = await env.DB.prepare("SELECT Email, DisplayName, Role FROM AdminUsers WHERE Email = ?1 AND IsActive = 1")
    .bind(email)
    .first<{ Email: string; DisplayName: string | null; Role: AdminRole }>();
  if (!row) throw new HttpError(403, "forbidden", "This account is not authorised to administer VERDI SOLARR.");
  return { email: row.Email.toLowerCase(), displayName: row.DisplayName, role: row.Role };
}

const CAN_EDIT_PRICES: AdminRole[] = ["owner", "admin", "price_editor"];

export function assertCanEditPrices(id: AdminIdentity): void {
  if (!CAN_EDIT_PRICES.includes(id.role)) throw new HttpError(403, "forbidden", "Your role does not allow editing prices.");
}

/**
 * CSRF / origin protection for state-changing admin requests.
 * Requires a same-origin browser request whose Origin host is explicitly allowed.
 */
export function assertSameOrigin(request: Request, env: Env): void {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (!origin) throw new HttpError(403, "bad_origin", "Missing Origin header.");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, "bad_origin", "Invalid Origin header.");
  }
  if (originHost !== url.host) throw new HttpError(403, "bad_origin", "Cross-origin requests are not allowed.");
  const allowed = (env.ADMIN_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const hostname = url.hostname.toLowerCase();
  if (allowed.length === 0 || !allowed.includes(hostname)) {
    throw new HttpError(403, "bad_host", "Admin changes are not permitted on this hostname.");
  }
  const site = request.headers.get("Sec-Fetch-Site");
  if (site && site !== "same-origin") throw new HttpError(403, "bad_origin", "Cross-site requests are not allowed.");
}

// Admin authentication & authorisation.
//
// Admins sign in with mobile number (or email) + password, checked against the D1 AdminUsers table.
//  * Passwords: salted PBKDF2-SHA256 hashes (worker/crypto.ts); never stored or logged in plaintext.
//  * Sessions: random token in an HttpOnly, SameSite=Strict cookie; only its SHA-256 is stored (AdminSessions).
//  * Every privileged API call re-checks the session AND that the admin is still active, then the role.
//  * Brute force: per-IP rate limit (index.ts) + account lock after 5 failures for 15 minutes.

import { issues, LoginSchema, normaliseMobile } from "../shared/admin-schemas";
import type { AdminIdentity, AdminRole } from "../shared/types";
import { DUMMY_HASH, randomToken, sha256Hex, verifyPassword } from "./crypto";
import { readCookie } from "./customers";
import type { Env } from "./env";
import { HttpError, json, nowIso } from "./http";

const SESSION_HOURS = 12;
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

export const adminCookieName = (url: URL) => (url.protocol === "https:" ? "__Host-vs_admin" : "vs_admin");

function adminCookies(url: URL, token: string | null): string[] {
  const secure = url.protocol === "https:" ? "; Secure" : "";
  const maxAge = token ? SESSION_HOURS * 3600 : 0;
  return [
    `${adminCookieName(url)}=${token ?? ""}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`,
    // Non-secret hint so the public pages can show "Admin dashboard" instead of "Staff sign-in".
    `vs_staff=${token ? "1" : ""}; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`,
  ];
}

export async function requireAdmin(request: Request, env: Env): Promise<AdminIdentity> {
  const token = readCookie(request, adminCookieName(new URL(request.url)));
  if (!token || !/^[A-Za-z0-9_-]{30,100}$/.test(token)) throw new HttpError(401, "unauthenticated", "Please sign in to continue.");
  const row = await env.DB.prepare(
    `SELECT a.Email, a.DisplayName, a.Role FROM AdminSessions s JOIN AdminUsers a ON a.AdminId = s.AdminId
     WHERE s.SessionHash = ?1 AND s.ExpiresAt > ?2 AND a.IsActive = 1`,
  )
    .bind(await sha256Hex(token), nowIso())
    .first<{ Email: string; DisplayName: string | null; Role: AdminRole }>();
  if (!row) throw new HttpError(401, "unauthenticated", "Your session has expired. Please sign in again.");
  return { email: row.Email.toLowerCase(), displayName: row.DisplayName, role: row.Role };
}

export async function adminLogin(request: Request, env: Env, body: unknown): Promise<Response> {
  const p = LoginSchema.safeParse(body);
  if (!p.success) throw new HttpError(422, "validation", p.error.issues[0]?.message ?? "Please check the form.", issues(p.error));
  const mobile = normaliseMobile(p.data.login);
  const row = await env.DB.prepare(
    `SELECT AdminId, Email, DisplayName, Role, PasswordHash, IsActive, FailedLogins, LockedUntil FROM AdminUsers WHERE ${mobile ? "Mobile = ?1" : "Email = ?1"}`,
  )
    .bind(mobile ?? p.data.login.toLowerCase())
    .first<{ AdminId: number; Email: string; DisplayName: string | null; Role: AdminRole; PasswordHash: string | null; IsActive: number; FailedLogins: number; LockedUntil: string | null }>();

  const ok = await verifyPassword(p.data.password, row?.PasswordHash ?? DUMMY_HASH); // always hash: no timing hint
  const generic = new HttpError(401, "bad_credentials", "Mobile number or password is incorrect.");
  if (!row || !row.PasswordHash) throw generic;
  if (row.LockedUntil && row.LockedUntil > nowIso()) throw new HttpError(429, "locked", `Too many failed attempts. Try again in ${LOCK_MINUTES} minutes.`);
  if (!row.IsActive) throw new HttpError(403, "disabled", "This admin account is disabled.");
  if (!ok) {
    const failed = row.FailedLogins + 1;
    const lock = failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null;
    await env.DB.prepare("UPDATE AdminUsers SET FailedLogins = ?1, LockedUntil = ?2 WHERE AdminId = ?3").bind(lock ? 0 : failed, lock, row.AdminId).run();
    throw generic;
  }

  const token = randomToken();
  const now = new Date();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM AdminSessions WHERE ExpiresAt < ?1").bind(now.toISOString()), // expired sessions only
    env.DB.prepare("INSERT INTO AdminSessions (SessionHash, AdminId, CreatedAt, ExpiresAt, UserAgent) VALUES (?1, ?2, ?3, ?4, ?5)").bind(
      await sha256Hex(token),
      row.AdminId,
      now.toISOString(),
      new Date(now.getTime() + SESSION_HOURS * 3600_000).toISOString(),
      (request.headers.get("User-Agent") ?? "").slice(0, 200),
    ),
    env.DB.prepare("UPDATE AdminUsers SET FailedLogins = 0, LockedUntil = NULL, LastLoginAt = ?1 WHERE AdminId = ?2").bind(now.toISOString(), row.AdminId),
    env.DB.prepare("INSERT INTO AuditLogs (AdminIdentity, Action, EntityType, EntityId, CreatedAt) VALUES (?1, 'admin.login', 'AdminUser', ?2, ?3)").bind(row.Email.toLowerCase(), String(row.AdminId), now.toISOString()),
  ]);
  const res = json({ admin: { email: row.Email.toLowerCase(), displayName: row.DisplayName, role: row.Role } satisfies AdminIdentity });
  for (const c of adminCookies(new URL(request.url), token)) res.headers.append("Set-Cookie", c);
  return res;
}

export async function adminLogout(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const token = readCookie(request, adminCookieName(url));
  if (token) await env.DB.prepare("DELETE FROM AdminSessions WHERE SessionHash = ?1").bind(await sha256Hex(token)).run();
  const res = json({ ok: true });
  for (const c of adminCookies(url, null)) res.headers.append("Set-Cookie", c);
  return res;
}

const CAN_EDIT_PRICES: AdminRole[] = ["owner", "admin", "price_editor"];

export function assertCanEditPrices(id: AdminIdentity): void {
  if (!CAN_EDIT_PRICES.includes(id.role)) throw new HttpError(403, "forbidden", "Your role does not allow editing prices.");
}

/**
 * CSRF / origin protection for state-changing admin requests.
 * Requires a same-origin browser request whose host is explicitly allowed (ADMIN_ALLOWED_HOSTS).
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
  if (allowed.length === 0 || !allowed.includes(url.hostname.toLowerCase())) {
    throw new HttpError(403, "bad_host", "Admin changes are not permitted on this hostname.");
  }
  const site = request.headers.get("Sec-Fetch-Site");
  if (site && site !== "same-origin") throw new HttpError(403, "bad_origin", "Cross-site requests are not allowed.");
}

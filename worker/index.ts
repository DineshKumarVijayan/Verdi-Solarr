// VERDI SOLARR — Cloudflare Worker entry.
// Only /api/* reaches this code (see wrangler.jsonc `run_worker_first`); every other
// request is served directly from static assets without a Worker invocation.

import { RevalidateSchema } from "../shared/schemas";
import { dashboard, listPrices, priceHistory, recordLogin, updatePrice } from "./admin";
import { assertSameOrigin, requireAdmin } from "./auth";
import { handleCatalogue, revalidate } from "./catalogue";
import type { Env } from "./env";
import { errorResponse, HttpError, json, readJson } from "./http";

async function rateLimit(limiter: Env["PUBLIC_LIMITER"], key: string): Promise<void> {
  if (!limiter) return;
  try {
    const { success } = await limiter.limit({ key });
    if (!success) throw new HttpError(429, "rate_limited", "Too many requests. Please wait a minute and try again.");
  } catch (e) {
    if (e instanceof HttpError) throw e; // limiter infrastructure errors must not take the site down
  }
}

const R2_KEY = /^[a-z0-9][a-z0-9/_.-]{0,200}$/i;

async function route(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();
  const ip = request.headers.get("CF-Connecting-IP") ?? "local";

  // ------------------------------------------------------------------ public
  if (path === "/api/health" && method === "GET") {
    return json({ ok: true, time: new Date().toISOString() });
  }

  if (path === "/api/catalogue" && (method === "GET" || method === "HEAD")) {
    return handleCatalogue(request, env, ctx);
  }

  if (path === "/api/enquiry/revalidate" && method === "POST") {
    await rateLimit(env.PUBLIC_LIMITER, `reval:${ip}`);
    const parsed = RevalidateSchema.safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(422, "validation", "Invalid enquiry items.");
    return json(await revalidate(env, parsed.data));
  }

  if (path.startsWith("/api/media/") && method === "GET") {
    // Phase 2: admin-uploaded images/datasheets stored in R2 (read-only, public).
    const key = decodeURIComponent(path.slice("/api/media/".length));
    if (!R2_KEY.test(key) || key.includes("..")) throw new HttpError(400, "bad_key", "Invalid media key.");
    if (!env.MEDIA) throw new HttpError(404, "not_found", "Media storage not configured.");
    const obj = await env.MEDIA.get(key);
    if (!obj) throw new HttpError(404, "not_found", "File not found.");
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set("ETag", obj.httpEtag);
    headers.set("Cache-Control", "public, max-age=86400, immutable");
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(obj.body, { headers });
  }

  // ------------------------------------------------------------------- admin
  if (path.startsWith("/api/admin/")) {
    const admin = await requireAdmin(request, env);
    if (method !== "GET") {
      assertSameOrigin(request, env);
      await rateLimit(env.ADMIN_LIMITER, `admin:${admin.email}`);
    }

    if (path === "/api/admin/me" && method === "GET") {
      ctx.waitUntil(recordLogin(env, admin).catch(() => undefined));
      return json({ admin });
    }
    if (path === "/api/admin/dashboard" && method === "GET") return json(await dashboard(env));
    if (path === "/api/admin/prices" && method === "GET") return json(await listPrices(env, url));

    const m = path.match(/^\/api\/admin\/prices\/(\d{1,9})(\/history)?$/);
    if (m) {
      const productId = Number(m[1]);
      if (m[2] && method === "GET") return json({ history: await priceHistory(env, productId) });
      if (!m[2] && method === "PUT") return json(await updatePrice(env, admin, productId, await readJson(request)));
    }
    throw new HttpError(404, "not_found", "Unknown admin endpoint.");
  }

  throw new HttpError(404, "not_found", "Unknown API endpoint.");
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await route(request, env, ctx);
    } catch (err) {
      return errorResponse(err);
    }
  },
} satisfies ExportedHandler<Env>;

export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  DB: D1Database;
  MEDIA?: R2Bucket;
  ASSETS: Fetcher;
  PUBLIC_LIMITER?: RateLimiter;
  ADMIN_LIMITER?: RateLimiter;
  ENVIRONMENT: string;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  ADMIN_ALLOWED_HOSTS: string;
  PUBLIC_CACHE_SECONDS: string;
  /** Local development only — ignored unless ENVIRONMENT=development AND host is localhost. */
  DEV_ADMIN_EMAIL?: string;
}

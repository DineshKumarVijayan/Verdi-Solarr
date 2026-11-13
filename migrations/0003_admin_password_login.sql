-- Migration 0003: admins sign in with mobile number + password (replaces Cloudflare Access).
-- Additive only. Passwords are stored as salted PBKDF2-SHA256 hashes, never plaintext.
-- Set an admin's mobile/password with: npm run admin:set -- --email=... --mobile=... --password=... [--remote]

ALTER TABLE AdminUsers ADD COLUMN Mobile TEXT;
ALTER TABLE AdminUsers ADD COLUMN PasswordHash TEXT;
ALTER TABLE AdminUsers ADD COLUMN FailedLogins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE AdminUsers ADD COLUMN LockedUntil TEXT;
CREATE UNIQUE INDEX UX_AdminUsers_Mobile ON AdminUsers(Mobile) WHERE Mobile IS NOT NULL;

-- Opaque admin session tokens; only the SHA-256 of the token is stored.
CREATE TABLE AdminSessions (
  SessionHash TEXT    PRIMARY KEY,
  AdminId     INTEGER NOT NULL REFERENCES AdminUsers(AdminId) ON DELETE CASCADE,
  CreatedAt   TEXT    NOT NULL,
  ExpiresAt   TEXT    NOT NULL,
  UserAgent   TEXT
);
CREATE INDEX IX_AdminSessions_Admin ON AdminSessions(AdminId);

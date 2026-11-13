-- Migration 0002: admin-managed site content, customer accounts, enquiry history, reward points.
-- Additive only: no existing table, row or price is modified or removed.
-- Apply with: npx wrangler d1 migrations apply verdi-db --local|--remote

PRAGMA foreign_keys = ON;

-- Who last edited a product's descriptive data (prices keep their own UpdatedBy).
ALTER TABLE Products ADD COLUMN UpdatedBy TEXT;
ALTER TABLE Brands ADD COLUMN Website TEXT;
ALTER TABLE Brands ADD COLUMN SortOrder INTEGER NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------- site content
-- "In the field" gallery. StorageKey is a static asset path or "r2:<key>" (admin upload).
CREATE TABLE FieldPhotos (
  PhotoId    INTEGER PRIMARY KEY AUTOINCREMENT,
  StorageKey TEXT    NOT NULL,
  Caption    TEXT    NOT NULL,
  Tag        TEXT    NOT NULL DEFAULT 'Rooftop',
  IsTall     INTEGER NOT NULL DEFAULT 0 CHECK (IsTall IN (0, 1)),
  SortOrder  INTEGER NOT NULL DEFAULT 0,
  IsActive   INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
  CreatedAt  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UpdatedAt  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UpdatedBy  TEXT
);
CREATE INDEX IX_FieldPhotos_Order ON FieldPhotos(IsActive, SortOrder);

-- Initial gallery (the photos supplied by the business). Runs once, with the migration.
INSERT INTO FieldPhotos (StorageKey, Caption, Tag, IsTall, SortOrder, UpdatedBy) VALUES
  ('/images/site/rooftop-elevated-structure.webp', 'Elevated rooftop structure', 'Rooftop', 1, 10, 'migration'),
  ('/images/site/inverter-installation-2.webp', 'Anchor inverter with DC & AC junction boxes', 'Inverters', 0, 20, 'migration'),
  ('/images/site/metal-roof-clamp.webp', 'Module clamping on a metal-sheet roof', 'Mounting', 1, 30, 'migration'),
  ('/images/site/acdb-boxes.webp', 'Solar ACDB enclosures', 'Protection', 0, 40, 'migration'),
  ('/images/site/rooftop-chennai.webp', 'Residential rooftop array, Chennai', 'Rooftop', 0, 50, 'migration'),
  ('/images/site/inverter-installation-1.webp', 'Anchor inverter between DCDB and ACDB', 'Inverters', 0, 60, 'migration'),
  ('/images/site/metal-roof-install.webp', 'Modules on a metal-sheet roof', 'Mounting', 1, 70, 'migration'),
  ('/images/site/metal-roof-rails.webp', 'Mounting rails on a trapezoidal roof', 'Mounting', 0, 80, 'migration'),
  ('/images/site/anchor-module-pallets.webp', 'Anchor by Panasonic modules, palletised', 'Stock', 1, 90, 'migration');

-- Editable business details / social links / announcement. Keys are whitelisted in shared/schemas.ts.
CREATE TABLE SiteSettings (
  SettingKey   TEXT PRIMARY KEY,
  SettingValue TEXT NOT NULL,
  UpdatedAt    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UpdatedBy    TEXT
);

-- ------------------------------------------------------------------ customers
-- Customer accounts are completely separate from admins (admins sign in via Cloudflare Access).
-- Passwords are never stored: only a salted PBKDF2-SHA256 hash ("pbkdf2_sha256$iter$salt$hash").
CREATE TABLE Customers (
  CustomerId     INTEGER PRIMARY KEY AUTOINCREMENT,
  FullName       TEXT    NOT NULL,
  Mobile         TEXT    NOT NULL UNIQUE,              -- normalised digits, e.g. 919876543210
  Email          TEXT    UNIQUE COLLATE NOCASE,
  BusinessName   TEXT,
  City           TEXT,
  PasswordHash   TEXT    NOT NULL,
  IsActive       INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
  FailedLogins   INTEGER NOT NULL DEFAULT 0,
  LockedUntil    TEXT,
  CreatedAt      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UpdatedAt      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  LastLoginAt    TEXT
);
CREATE INDEX IX_Customers_Created ON Customers(CreatedAt DESC);

-- Opaque session tokens; only the SHA-256 of the token is stored.
CREATE TABLE CustomerSessions (
  SessionHash TEXT    PRIMARY KEY,
  CustomerId  INTEGER NOT NULL REFERENCES Customers(CustomerId) ON DELETE CASCADE,
  CreatedAt   TEXT    NOT NULL,
  ExpiresAt   TEXT    NOT NULL,
  UserAgent   TEXT
);
CREATE INDEX IX_Sessions_Customer ON CustomerSessions(CustomerId);
CREATE INDEX IX_Sessions_Expires ON CustomerSessions(ExpiresAt);

-- One-time password-reset links issued by an admin (shared with the customer on WhatsApp).
CREATE TABLE PasswordResetTokens (
  TokenHash  TEXT    PRIMARY KEY,
  CustomerId INTEGER NOT NULL REFERENCES Customers(CustomerId) ON DELETE CASCADE,
  CreatedBy  TEXT    NOT NULL,
  CreatedAt  TEXT    NOT NULL,
  ExpiresAt  TEXT    NOT NULL,
  UsedAt     TEXT
);

-- ------------------------------------------------------------------ enquiries
-- Every enquiry sent from the basket. CustomerId is NULL for guests.
CREATE TABLE Enquiries (
  EnquiryId            INTEGER PRIMARY KEY AUTOINCREMENT,
  Reference            TEXT    NOT NULL UNIQUE,
  CustomerId           INTEGER REFERENCES Customers(CustomerId) ON DELETE SET NULL,
  ContactName          TEXT    NOT NULL,
  BusinessName         TEXT,
  Mobile               TEXT    NOT NULL,
  Location             TEXT    NOT NULL,
  Comments             TEXT,
  Status               TEXT    NOT NULL DEFAULT 'new' CHECK (Status IN ('new', 'contacted', 'quoted', 'won', 'lost', 'cancelled')),
  PricesVerified       INTEGER NOT NULL DEFAULT 0 CHECK (PricesVerified IN (0, 1)),
  IndicativeTotalPaise INTEGER,
  AdminNotes           TEXT,
  CreatedAt            TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UpdatedAt            TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UpdatedBy            TEXT
);
CREATE INDEX IX_Enquiries_Customer ON Enquiries(CustomerId, CreatedAt DESC);
CREATE INDEX IX_Enquiries_Status ON Enquiries(Status, CreatedAt DESC);

-- Line items are a snapshot (name/model/price as listed at the time of the enquiry).
CREATE TABLE EnquiryItems (
  EnquiryItemId  INTEGER PRIMARY KEY AUTOINCREMENT,
  EnquiryId      INTEGER NOT NULL REFERENCES Enquiries(EnquiryId) ON DELETE CASCADE,
  ProductId      INTEGER REFERENCES Products(ProductId) ON DELETE SET NULL,
  ProductName    TEXT    NOT NULL,
  BrandName      TEXT,
  ModelNumber    TEXT,
  Quantity       INTEGER NOT NULL CHECK (Quantity > 0),
  UnitPricePaise INTEGER,
  PriceUnit      TEXT,
  GSTRate        REAL,
  GSTIncluded    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IX_EnquiryItems_Enquiry ON EnquiryItems(EnquiryId);

-- ---------------------------------------------------------------- reward points
-- Append-only ledger. Balance = SUM(Points). Positive = credited, negative = redeemed/adjusted.
CREATE TABLE RewardTransactions (
  TransactionId INTEGER PRIMARY KEY AUTOINCREMENT,
  CustomerId    INTEGER NOT NULL REFERENCES Customers(CustomerId) ON DELETE CASCADE,
  Points        INTEGER NOT NULL CHECK (Points <> 0 AND Points BETWEEN -10000000 AND 10000000),
  Reason        TEXT    NOT NULL,
  EnquiryId     INTEGER REFERENCES Enquiries(EnquiryId) ON DELETE SET NULL,
  CreatedBy     TEXT    NOT NULL,
  CreatedAt     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IX_Rewards_Customer ON RewardTransactions(CustomerId, CreatedAt DESC);

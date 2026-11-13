-- Migration 0001: initial VERDI SOLARR schema (Cloudflare D1 / SQLite)
-- Apply with: npx wrangler d1 migrations apply verdi-db --local|--remote
-- Money is stored as INTEGER paise (1 INR = 100 paise). Timestamps are ISO-8601 UTC text.

PRAGMA foreign_keys = ON;

CREATE TABLE Brands (
  BrandId        INTEGER PRIMARY KEY AUTOINCREMENT,
  BrandName      TEXT    NOT NULL,
  BrandSlug      TEXT    NOT NULL UNIQUE,
  Description    TEXT,
  LogoStorageKey TEXT,
  IsActive       INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
  CreatedAt      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UpdatedAt      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE Categories (
  CategoryId       INTEGER PRIMARY KEY AUTOINCREMENT,
  CategoryName     TEXT    NOT NULL,
  CategorySlug     TEXT    NOT NULL UNIQUE,
  ParentCategoryId INTEGER REFERENCES Categories(CategoryId) ON DELETE SET NULL,
  Description      TEXT,
  SortOrder        INTEGER NOT NULL DEFAULT 0,
  IsActive         INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1))
);

-- One row per sellable model/variant (each has its own price).
-- SeriesKey/SeriesName group variants that share one datasheet (e.g. 600–630 Wp).
CREATE TABLE Products (
  ProductId        INTEGER PRIMARY KEY AUTOINCREMENT,
  SKU              TEXT    NOT NULL UNIQUE,
  ProductName      TEXT    NOT NULL,
  ProductSlug      TEXT    NOT NULL UNIQUE,
  BrandId          INTEGER NOT NULL REFERENCES Brands(BrandId),
  CategoryId       INTEGER NOT NULL REFERENCES Categories(CategoryId),
  SeriesKey        TEXT,
  SeriesName       TEXT,
  VariantLabel     TEXT,
  ModelNumber      TEXT,
  ShortDescription TEXT,
  Description      TEXT,
  HighlightsJson   TEXT,   -- JSON array of short strings (display-only list; justified to avoid a 1:N table for bullets)
  IsActive         INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
  IsFeatured       INTEGER NOT NULL DEFAULT 0 CHECK (IsFeatured IN (0, 1)),
  CreatedAt        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UpdatedAt        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IX_Products_Brand    ON Products(BrandId, IsActive);
CREATE INDEX IX_Products_Category ON Products(CategoryId, IsActive);
CREATE INDEX IX_Products_Series   ON Products(SeriesKey);
CREATE INDEX IX_Products_Updated  ON Products(UpdatedAt);

-- Current price (1:1 with Products). NULL SellingPricePaise = "price pending admin input".
CREATE TABLE ProductPrices (
  ProductId         INTEGER PRIMARY KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
  SellingPricePaise INTEGER CHECK (SellingPricePaise IS NULL OR (SellingPricePaise >= 0 AND SellingPricePaise <= 100000000000)),
  MRPPaise          INTEGER CHECK (MRPPaise IS NULL OR (MRPPaise >= 0 AND MRPPaise <= 100000000000)),
  Currency          TEXT    NOT NULL DEFAULT 'INR' CHECK (Currency = 'INR'),
  GSTIncluded       INTEGER NOT NULL DEFAULT 0 CHECK (GSTIncluded IN (0, 1)),
  GSTRate           REAL    CHECK (GSTRate IS NULL OR (GSTRate >= 0 AND GSTRate <= 28)),
  PriceUnit         TEXT    NOT NULL DEFAULT 'per piece',
  Version           INTEGER NOT NULL DEFAULT 1,   -- optimistic concurrency token
  UpdatedAt         TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UpdatedBy         TEXT
);
CREATE INDEX IX_ProductPrices_Updated ON ProductPrices(UpdatedAt);

CREATE TABLE ProductPriceHistory (
  HistoryId     INTEGER PRIMARY KEY AUTOINCREMENT,
  ProductId     INTEGER NOT NULL REFERENCES Products(ProductId) ON DELETE CASCADE,
  OldPricePaise INTEGER,
  NewPricePaise INTEGER,
  OldMRPPaise   INTEGER,
  NewMRPPaise   INTEGER,
  OldGSTRate    REAL,
  NewGSTRate    REAL,
  OldGSTIncluded INTEGER,
  NewGSTIncluded INTEGER,
  ChangedBy     TEXT    NOT NULL,
  ChangedAt     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ChangeReason  TEXT
);
CREATE INDEX IX_PriceHistory_Product ON ProductPriceHistory(ProductId, ChangedAt DESC);

CREATE TABLE ProductSpecifications (
  SpecificationId    INTEGER PRIMARY KEY AUTOINCREMENT,
  ProductId          INTEGER NOT NULL REFERENCES Products(ProductId) ON DELETE CASCADE,
  SpecificationKey   TEXT    NOT NULL,
  SpecificationLabel TEXT    NOT NULL,
  SpecificationValue TEXT    NOT NULL,
  Unit               TEXT,
  SpecGroup          TEXT    NOT NULL DEFAULT 'General',
  SortOrder          INTEGER NOT NULL DEFAULT 0,
  UNIQUE (ProductId, SpecificationKey)
);
CREATE INDEX IX_Specs_Key ON ProductSpecifications(SpecificationKey, SpecificationValue);

-- Images and datasheets. StorageKey is either a static asset path ("/datasheets/x.pdf")
-- or an R2 object key ("r2:products/123/abc.pdf"). Binary data never goes into D1.
CREATE TABLE ProductMedia (
  MediaId    INTEGER PRIMARY KEY AUTOINCREMENT,
  ProductId  INTEGER NOT NULL REFERENCES Products(ProductId) ON DELETE CASCADE,
  MediaType  TEXT    NOT NULL CHECK (MediaType IN ('image', 'datasheet', 'document')),
  StorageKey TEXT    NOT NULL,
  AltText    TEXT,
  Title      TEXT,
  IsPrimary  INTEGER NOT NULL DEFAULT 0 CHECK (IsPrimary IN (0, 1)),
  SortOrder  INTEGER NOT NULL DEFAULT 0,
  CreatedAt  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (ProductId, MediaType, StorageKey)
);
CREATE INDEX IX_Media_Product ON ProductMedia(ProductId, MediaType);

CREATE TABLE AdminUsers (
  AdminId     INTEGER PRIMARY KEY AUTOINCREMENT,
  Email       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  DisplayName TEXT,
  Role        TEXT    NOT NULL DEFAULT 'price_editor' CHECK (Role IN ('owner', 'admin', 'price_editor', 'viewer')),
  IsActive    INTEGER NOT NULL DEFAULT 1 CHECK (IsActive IN (0, 1)),
  CreatedAt   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UpdatedAt   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  LastLoginAt TEXT
);

CREATE TABLE AuditLogs (
  AuditId       INTEGER PRIMARY KEY AUTOINCREMENT,
  AdminIdentity TEXT    NOT NULL,
  Action        TEXT    NOT NULL,
  EntityType    TEXT    NOT NULL,
  EntityId      TEXT,
  BeforeValue   TEXT,   -- JSON snapshot
  AfterValue    TEXT,   -- JSON snapshot
  CreatedAt     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IX_Audit_Created ON AuditLogs(CreatedAt DESC);

-- Published, denormalised public catalogue (one row). Rebuilt by the Worker whenever an
-- admin changes catalogue data, so a public cache miss costs ONE D1 row read instead of hundreds.
CREATE TABLE PublishedCatalogue (
  Id          INTEGER PRIMARY KEY CHECK (Id = 1),
  Version     INTEGER NOT NULL,
  PayloadJson TEXT    NOT NULL,
  PublishedAt TEXT    NOT NULL
);

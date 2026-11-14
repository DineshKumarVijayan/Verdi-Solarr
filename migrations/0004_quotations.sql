-- 0004: Quotations prepared by admins (PDF generated in the admin's browser, optionally stored in R2
-- so a WhatsApp message can carry a link). Prices are COPIED onto each line when the quotation is
-- saved, so later catalogue price changes never alter a quotation already sent.

CREATE TABLE Quotations (
  QuotationId     INTEGER PRIMARY KEY,
  Number          TEXT    NOT NULL UNIQUE,              -- VSQ-YYMM-0001
  CustomerName    TEXT    NOT NULL,
  CustomerCompany TEXT,
  CustomerMobile  TEXT,                                 -- normalised, e.g. 919876543210
  CustomerEmail   TEXT,
  CustomerAddress TEXT,
  Notes           TEXT,
  ValidDays       INTEGER NOT NULL DEFAULT 15 CHECK (ValidDays BETWEEN 1 AND 365),
  Status          TEXT    NOT NULL DEFAULT 'draft' CHECK (Status IN ('draft', 'sent', 'accepted', 'declined')),
  SubtotalPaise   INTEGER NOT NULL DEFAULT 0 CHECK (SubtotalPaise >= 0),
  DiscountPaise   INTEGER NOT NULL DEFAULT 0 CHECK (DiscountPaise >= 0),
  TotalPaise      INTEGER NOT NULL DEFAULT 0 CHECK (TotalPaise >= 0),
  PdfKey          TEXT,                                 -- R2 key of the last shared PDF
  ShareToken      TEXT    UNIQUE,                       -- unguessable link token for the shared PDF
  CreatedBy       TEXT    NOT NULL,
  CreatedAt       TEXT    NOT NULL,
  UpdatedBy       TEXT    NOT NULL,
  UpdatedAt       TEXT    NOT NULL,
  SentAt          TEXT
);
CREATE INDEX IX_Quotations_Created ON Quotations(CreatedAt DESC);
CREATE INDEX IX_Quotations_Mobile ON Quotations(CustomerMobile);

CREATE TABLE QuotationItems (
  ItemId          INTEGER PRIMARY KEY,
  QuotationId     INTEGER NOT NULL REFERENCES Quotations(QuotationId) ON DELETE CASCADE,
  SortOrder       INTEGER NOT NULL DEFAULT 0,
  ProductId       INTEGER REFERENCES Products(ProductId) ON DELETE SET NULL,  -- NULL = custom line
  Name            TEXT    NOT NULL,
  BrandName       TEXT,
  Model           TEXT,
  Unit            TEXT    NOT NULL DEFAULT 'per piece',
  GstNote         TEXT,                                 -- e.g. "+ 18% GST", copied from the price row
  ImageUrl        TEXT,
  Qty             INTEGER NOT NULL CHECK (Qty BETWEEN 1 AND 100000),
  UnitPaise       INTEGER NOT NULL CHECK (UnitPaise >= 0),
  DiscountType    TEXT    NOT NULL DEFAULT 'none' CHECK (DiscountType IN ('none', 'pct', 'amount')),
  DiscountValue   INTEGER NOT NULL DEFAULT 0 CHECK (DiscountValue >= 0), -- pct: basis points (1250 = 12.5%); amount: paise for the line
  DiscountPaise   INTEGER NOT NULL DEFAULT 0 CHECK (DiscountPaise >= 0),
  LineTotalPaise  INTEGER NOT NULL CHECK (LineTotalPaise >= 0)
);
CREATE INDEX IX_QuotationItems_Quotation ON QuotationItems(QuotationId, SortOrder);

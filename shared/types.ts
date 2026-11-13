// Shared public data contracts between the Worker and the browser.
// NOTE: nothing admin-only (UpdatedBy, audit data, admin emails) may appear in the public types.

export interface PublicPrice {
  sellingPaise: number | null; // null => price pending / on request
  mrpPaise: number | null;
  gstIncluded: boolean;
  gstRate: number | null; // percent, e.g. 18
  unit: string; // "per piece", "per metre" ...
  version: number;
  updatedAt: string;
}

export interface PublicSpec {
  k: string; // key
  l: string; // label
  v: string; // value
  u: string | null; // unit
  g: string; // group
}

export interface PublicProduct {
  id: number;
  sku: string;
  slug: string;
  name: string;
  seriesKey: string | null;
  seriesName: string | null;
  variant: string | null;
  model: string | null;
  brandId: number;
  categoryId: number;
  short: string | null;
  description: string | null;
  highlights: string[];
  featured: boolean;
  price: PublicPrice;
  datasheet: string | null; // public URL
  images: { url: string; alt: string | null }[];
  specs: PublicSpec[];
}

export interface PublicBrand {
  id: number;
  slug: string;
  name: string;
  description: string | null;
}

export interface PublicCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  sort: number;
}

export interface PublicCatalogue {
  version: number;
  publishedAt: string;
  brands: PublicBrand[];
  categories: PublicCategory[];
  products: PublicProduct[];
}

export interface RevalidatedItem {
  productId: number;
  found: boolean;
  active: boolean;
  name: string | null;
  model: string | null;
  brand: string | null;
  price: PublicPrice | null;
  changed: boolean;
}

export type AdminRole = "owner" | "admin" | "price_editor" | "viewer";

export interface AdminIdentity {
  email: string;
  displayName: string | null;
  role: AdminRole;
}

export interface AdminPriceRow {
  productId: number;
  sku: string;
  name: string;
  model: string | null;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  isActive: boolean;
  sellingPaise: number | null;
  mrpPaise: number | null;
  gstIncluded: boolean;
  gstRate: number | null;
  unit: string;
  version: number;
  updatedAt: string;
  updatedBy: string | null;
}

export interface PriceHistoryRow {
  historyId: number;
  oldPricePaise: number | null;
  newPricePaise: number | null;
  oldMrpPaise: number | null;
  newMrpPaise: number | null;
  oldGstRate: number | null;
  newGstRate: number | null;
  changedBy: string;
  changedAt: string;
  reason: string | null;
}

export interface AdminDashboard {
  activeProducts: number;
  inactiveProducts: number;
  brands: number;
  categories: { name: string; slug: string; count: number }[];
  missingPrices: number;
  missingImages: number;
  missingDatasheets: number;
  recentPrices: { productId: number; name: string; sellingPaise: number | null; updatedAt: string; updatedBy: string | null }[];
  recentActivity: { auditId: number; adminIdentity: string; action: string; entityType: string; entityId: string | null; createdAt: string }[];
  catalogueVersion: number | null;
  cataloguePublishedAt: string | null;
}

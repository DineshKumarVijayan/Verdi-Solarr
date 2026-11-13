import { describe, expect, it } from "vitest";
import { flattenProducts } from "../../data/catalogue.mjs";
import {
  batteryRuntimeHours,
  consumptionSummary,
  lossWaterfall,
  modulesNeeded,
  relativeOrientationYield,
  requiredCapacityKwp,
  roofLayout,
  savingsEstimate,
} from "../../shared/calculators";
import { kitChecks } from "../../shared/compat";
import { formatPaise, gstLabel } from "../../shared/money";
import { PriceUpdateSchema, RevalidateSchema, paiseToRupeeInput, rupeesToPaise } from "../../shared/schemas";
import { buildIndex, highlightSegments, normalise, search } from "../../shared/search";
import type { PublicCatalogue, PublicProduct } from "../../shared/types";
import { buildEnquiryMessage, whatsappUrl } from "../../shared/whatsapp";

// Build a catalogue fixture from the real seed source (same data that goes into D1).
const raw = flattenProducts();
const brandIds: Record<string, number> = { "anchor-by-panasonic": 1, solaredge: 2 };
const catSlugs = [...new Set(raw.map((p: { category: string }) => p.category))] as string[];
const catalogue: PublicCatalogue = {
  version: 1,
  publishedAt: "2026-11-13T00:00:00Z",
  brands: [
    { id: 1, slug: "anchor-by-panasonic", name: "Anchor by Panasonic", description: null },
    { id: 2, slug: "solaredge", name: "SolarEdge", description: null },
  ],
  categories: catSlugs.map((s, i) => ({ id: i + 1, slug: s, name: s, description: null, sort: i })),
  products: raw.map(
    (p: any, i: number): PublicProduct => ({
      id: i + 1,
      sku: p.sku,
      slug: p.slug,
      name: p.name,
      seriesKey: p.seriesKey,
      seriesName: p.seriesName,
      variant: p.variant,
      model: p.model,
      brandId: brandIds[p.brand],
      categoryId: catSlugs.indexOf(p.category) + 1,
      short: p.short,
      description: p.description,
      highlights: p.highlights,
      featured: p.featured,
      price: { sellingPaise: i % 3 === 0 ? null : 100000 * (i + 1), mrpPaise: null, gstIncluded: false, gstRate: 12, unit: p.priceUnit, version: 1, updatedAt: "" },
      datasheet: p.datasheet,
      images: [],
      specs: p.specs.map((s: any) => ({ k: s.key, l: s.label, v: s.value, u: s.unit, g: s.group })),
    }),
  ),
};
const index = buildIndex(catalogue);
const find = (sku: string) => catalogue.products.find((p) => p.sku === sku)!;

describe("catalogue source data", () => {
  it("has unique SKUs and slugs and no prices", () => {
    expect(new Set(raw.map((p: any) => p.sku)).size).toBe(raw.length);
    expect(new Set(raw.map((p: any) => p.slug)).size).toBe(raw.length);
    expect(JSON.stringify(raw)).not.toMatch(/price"?\s*:\s*\d/i);
  });
  it("transcribes TOPCon 630 values from the datasheet", () => {
    const p = find("VS-ANC-TOPCON-630");
    const v = (k: string) => p.specs.find((s) => s.k === k)?.v;
    expect(v("voc_v")).toBe("49.61");
    expect(v("efficiency_pct")).toBe("23.32");
    expect(v("temp_coeff_pmax")).toBe("-0.29");
  });
  it("excludes the Sri-Lanka-only SE5000H", () => {
    expect(raw.some((p: any) => p.sku.includes("SE5000H"))).toBe(false);
  });
});

describe("search", () => {
  it("normalises units and phases", () => {
    expect(normalise("620 Wp")).toBe("620wp");
    expect(normalise("5 kW three phase")).toBe("5kw threephase");
    expect(normalise("6 sq mm")).toBe("6sqmm");
  });
  it("finds a module by wattage", () => {
    const hits = search(index, { q: "620 Wp", brands: [], categories: [] });
    expect(hits[0].item.p.sku).toBe("VS-ANC-TOPCON-620");
  });
  it("finds three-phase 5 kW inverters", () => {
    const hits = search(index, { q: "5 kW three phase", brands: [], categories: [] });
    expect(hits[0].item.p.sku).toBe("VS-ANC-STELLAR-5KTL3X");
  });
  it("finds by SKU and model", () => {
    expect(search(index, { q: "S650B", brands: [], categories: [] })[0].item.p.sku).toBe("VS-SE-S650B");
  });
  it("filters by brand, category, phase and power", () => {
    const se = search(index, { q: "", brands: ["solaredge"], categories: [] });
    expect(se.length).toBe(6);
    expect(se.every((h) => h.item.brandSlug === "solaredge")).toBe(true);
    const single = search(index, { q: "", brands: [], categories: ["solar-inverters"], phase: "single" });
    expect(single.every((h) => h.item.p.specs.find((s) => s.k === "phase")!.v.includes("Single"))).toBe(true);
    const big = search(index, { q: "", brands: [], categories: ["solar-panels"], minPower: 620 });
    expect(big.map((h) => h.item.p.variant).sort()).toEqual(["620 Wp", "625 Wp", "630 Wp"]);
  });
  it("sorts by price with unpriced last", () => {
    const hits = search(index, { q: "", brands: [], categories: [], sort: "price-asc" });
    const prices = hits.map((h) => h.item.p.price.sellingPaise);
    const firstNull = prices.indexOf(null);
    expect(prices.slice(firstNull).every((p) => p === null)).toBe(true);
    const priced = prices.slice(0, firstNull) as number[];
    expect([...priced].sort((a, b) => a - b)).toEqual(priced);
  });
  it("returns nothing for nonsense", () => {
    expect(search(index, { q: "zzzqqq", brands: [], categories: [] })).toHaveLength(0);
  });
  it("highlights matches", () => {
    expect(highlightSegments("TOPCon 620 Wp", "620").some((s) => s.hit && s.t === "620")).toBe(true);
  });
});

describe("money & price validation", () => {
  it("converts rupee input to integer paise", () => {
    expect(rupeesToPaise("12,499.50")).toBe(1249950);
    expect(rupeesToPaise("₹ 800")).toBe(80000);
    expect(rupeesToPaise("0.1")).toBe(10);
    expect(rupeesToPaise("")).toBeNull();
    expect(rupeesToPaise("-5")).toBeNaN();
    expect(rupeesToPaise("12.345")).toBeNaN();
    expect(rupeesToPaise("abc")).toBeNaN();
    expect(paiseToRupeeInput(1249950)).toBe("12499.50");
  });
  it("formats paise and GST labels", () => {
    expect(formatPaise(1650000)).toBe("₹16,500");
    expect(formatPaise(null)).toBe("Price on request");
    expect(gstLabel({ gstIncluded: false, gstRate: 12 })).toBe("+ 12% GST");
    expect(gstLabel({ gstIncluded: true, gstRate: null })).toBe("incl. GST");
  });
  const base = { sellingPricePaise: 100, mrpPaise: 200, gstIncluded: false, gstRate: 12, priceUnit: "per piece", expectedVersion: 1 };
  it("accepts a valid price update", () => expect(PriceUpdateSchema.safeParse(base).success).toBe(true));
  it("rejects negative, fractional, oversize, bad GST, selling > MRP and unknown fields", () => {
    expect(PriceUpdateSchema.safeParse({ ...base, sellingPricePaise: -1 }).success).toBe(false);
    expect(PriceUpdateSchema.safeParse({ ...base, sellingPricePaise: 1.5 }).success).toBe(false);
    expect(PriceUpdateSchema.safeParse({ ...base, sellingPricePaise: 1e12, mrpPaise: null }).success).toBe(false);
    expect(PriceUpdateSchema.safeParse({ ...base, gstRate: 7 }).success).toBe(false);
    expect(PriceUpdateSchema.safeParse({ ...base, sellingPricePaise: 300 }).success).toBe(false);
    expect(PriceUpdateSchema.safeParse({ ...base, isAdmin: true }).success).toBe(false);
    expect(PriceUpdateSchema.safeParse({ ...base, expectedVersion: 0 }).success).toBe(false);
  });
  it("limits revalidation batch size", () => {
    const items = Array.from({ length: 51 }, (_, i) => ({ productId: i + 1, quantity: 1 }));
    expect(RevalidateSchema.safeParse({ items }).success).toBe(false);
    expect(RevalidateSchema.safeParse({ items: items.slice(0, 50) }).success).toBe(true);
  });
});

describe("WhatsApp enquiry message", () => {
  const customer = { name: "Ravi", business: "Sun Installers", mobile: "+91 98765 43210", location: "Coimbatore", comments: "Need DCR modules" };
  const lines = [
    { name: "TOPCon 620 Wp", brand: "Anchor by Panasonic", model: "PE-132", quantity: 10, unitPaise: 1650000, unit: "per piece", gstIncluded: false, gstRate: 12 },
    { name: "Solar DC Cable 4 sq mm", brand: "Anchor by Panasonic", model: "4.0 mm²", quantity: 100, unitPaise: null, unit: "per metre", gstIncluded: false, gstRate: null },
  ];
  const msg = buildEnquiryMessage(customer, lines, new Date("2026-11-13"));
  it("contains customer, products, quantities, totals and disclaimer", () => {
    expect(msg).toContain("Name: Ravi");
    expect(msg).toContain("Business: Sun Installers");
    expect(msg).toContain("Qty: 10 × ₹16,500 per piece (+ 12% GST) = ₹1,65,000");
    expect(msg).toContain("Price: on request");
    expect(msg).toContain("₹1,65,000");
    expect(msg).toContain("priced items only");
    expect(msg).toContain("Need DCR modules");
    expect(msg).toMatch(/subject to confirmation by VERDI SOLARR SOLUTION/);
  });
  it("URL-encodes the message for wa.me", () => {
    const url = whatsappUrl(msg);
    expect(url.startsWith("https://wa.me/918939277997?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1])).toBe(msg);
    expect(url).not.toMatch(/[\s₹]/);
  });
});

describe("calculators", () => {
  it("appliance consumption", () => {
    const s = consumptionSummary([{ name: "AC", watts: 1500, quantity: 1, hoursPerDay: 6 }, { name: "Fan", watts: 75, quantity: 4, hoursPerDay: 10 }], 7);
    expect(s.dailyKwh).toBeCloseTo(12);
    expect(s.monthlyKwh).toBeCloseTo(360);
    expect(s.monthlyCost).toBeCloseTo(2520);
  });
  it("capacity and module count", () => {
    expect(requiredCapacityKwp(360, 4)).toBeCloseTo(3);
    expect(modulesNeeded(3, 550)).toBe(6);
    expect(requiredCapacityKwp(0)).toBe(0);
  });
  it("savings and payback", () => {
    const s = savingsEstimate({ capacityKwp: 3, specificYield: 4, monthlyConsumptionKwh: 300, tariffPerKwh: 7, exportTariffPerKwh: 2, systemCostRupees: 180000 });
    expect(s.monthlyGen).toBeCloseTo(360);
    expect(s.monthlySavings).toBeCloseTo(300 * 7 + 60 * 2);
    expect(s.payback).toBeCloseTo(180000 / (2220 * 12));
  });
  it("roof layout picks the better orientation", () => {
    const r = roofLayout({ roofLengthM: 10, roofWidthM: 5, edgeSetbackM: 0.5, moduleLengthMm: 2278, moduleWidthMm: 1133, moduleWp: 550, rowGapM: 0.5 });
    expect(r.count).toBeGreaterThan(0);
    expect(r.capacityKwp).toBeCloseTo((r.count * 550) / 1000);
  });
  it("battery runtime", () => {
    const r = batteryRuntimeHours({ capacityAh: 150, voltage: 12, usablePct: 80, inverterEfficiencyPct: 90, loadWatts: 324 });
    expect(r.usableWh).toBeCloseTo(1440);
    expect(r.hours).toBeCloseTo(4);
  });
  it("loss chain is multiplicative", () => {
    const r = lossWaterfall({ soilingPct: 10, shadingPct: 0, ambientC: 25 - 25, tempCoeffPctPerC: -0.3, inverterEfficiencyPct: 100, dcCablePct: 0, acCablePct: 0, mismatchPct: 0 });
    expect(r.rows[0].remaining).toBeCloseTo(90);
    expect(r.performanceRatio).toBeLessThan(0.9);
  });
  it("south-facing at latitude tilt beats west-facing steep", () => {
    expect(relativeOrientationYield(13, 13, 180)).toBeGreaterThan(0.97);
    expect(relativeOrientationYield(13, 45, 270)).toBeLessThan(relativeOrientationYield(13, 13, 180));
  });
});

describe("kit compatibility", () => {
  const mod = find("VS-ANC-TOPCON-620");
  it("flags a string voltage above inverter max DC", () => {
    const c = kitChecks({ module: mod, moduleQty: 13, inverter: find("VS-ANC-RENO-3KTLX"), inverterQty: 1, modulesPerString: 13, strings: 1, minCellC: 10, maxCellC: 70 });
    expect(c.some((x) => x.level === "error" && /String voltage too high/.test(x.title))).toBe(true);
  });
  it("flags module Isc above inverter short-circuit limit", () => {
    const c = kitChecks({ module: mod, moduleQty: 8, inverter: find("VS-ANC-STELLAR-5KTL3X"), inverterQty: 1, modulesPerString: 8, strings: 1, minCellC: 10, maxCellC: 70 });
    expect(c.some((x) => x.level === "ok" && /Short-circuit/.test(x.title))).toBe(true); // 15.63 A ≤ 16 A
  });
  it("requires optimisers for SolarEdge", () => {
    const c = kitChecks({ module: mod, moduleQty: 10, inverter: find("VS-SE-SE4000H"), inverterQty: 1, inverterBrandSlug: "solaredge", modulesPerString: 10, strings: 1, minCellC: 10, maxCellC: 70 });
    expect(c.some((x) => x.level === "error" && /optimisers required/i.test(x.title))).toBe(true);
  });
  it("flags a module larger than the optimiser rating", () => {
    const c = kitChecks({ module: mod, moduleQty: 10, inverter: find("VS-SE-SE4000H"), inverterQty: 1, inverterBrandSlug: "solaredge", optimiser: find("VS-SE-S500"), modulesPerString: 10, strings: 1, minCellC: 10, maxCellC: 70 });
    expect(c.some((x) => x.level === "error" && /too large for optimiser/.test(x.title))).toBe(true);
  });
});

import { residentialSubsidy } from "../../shared/calculators";
describe("PM Surya Ghar residential subsidy", () => {
  it("follows ₹30k/kW for 2 kW, ₹18k for 3rd kW, capped at ₹78k", () => {
    expect(residentialSubsidy(1)).toBe(30000);
    expect(residentialSubsidy(2)).toBe(60000);
    expect(residentialSubsidy(3)).toBe(78000);
    expect(residentialSubsidy(10)).toBe(78000);
    expect(residentialSubsidy(2.5)).toBe(69000);
  });
});

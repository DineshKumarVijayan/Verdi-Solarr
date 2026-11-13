import { expect, test } from "@playwright/test";

// Runs with the test owner session created in global-setup.ts (local test account).


const ORIGIN = { Origin: process.env.BASE_URL ?? "http://localhost:5173", "Content-Type": "application/json" };

async function productId(request: import("@playwright/test").APIRequestContext, sku: string) {
  const r = await request.get(`/api/admin/prices?q=${sku}`);
  const j = await r.json();
  return j.rows[0] as { productId: number; version: number; sellingPaise: number | null };
}

test("admin can edit a price, see history, and the public catalogue updates", async ({ page, request }) => {
  const row = await productId(request, "VS-ANC-RENO-1KTLX");
  await page.goto("/admin/prices?q=VS-ANC-RENO-1KTLX");
  await expect(page.getByTestId("admin-price-row")).toHaveCount(1);
  await page.getByRole("button", { name: /Edit price for/ }).click();
  const newPrice = String(10000 + Math.floor(Math.random() * 1000));
  await page.getByTestId("price-input").fill(newPrice);
  await page.getByLabel("GST rate").selectOption("12");
  await page.getByLabel(/Reason/).fill("e2e test");
  await page.getByTestId("save-price").click();
  await expect(page.getByText(/Saved .*Live on the website/)).toBeVisible();
  await expect(page.getByTestId("price-history").locator("li").first()).toContainText("e2e test");

  const cat = await (await request.get("/api/catalogue")).json();
  const pub = cat.products.find((p: { id: number }) => p.id === row.productId);
  expect(pub.price.sellingPaise).toBe(Number(newPrice) * 100);
  expect(JSON.stringify(cat)).not.toMatch(/UpdatedBy|updatedBy|AdminIdentity|@gmail/); // no admin fields leak
});

test("rejects invalid prices and stale versions; no history on failure", async ({ request }) => {
  const row = await productId(request, "VS-ANC-RENO-2KTLX");
  const before = (await (await request.get(`/api/admin/prices/${row.productId}/history`)).json()).history.length;
  const bad = await request.put(`/api/admin/prices/${row.productId}`, {
    headers: ORIGIN,
    data: { sellingPricePaise: -100, mrpPaise: null, gstIncluded: false, gstRate: null, priceUnit: "per piece", expectedVersion: row.version },
  });
  expect(bad.status()).toBe(422);
  const ok = await request.put(`/api/admin/prices/${row.productId}`, {
    headers: ORIGIN,
    data: { sellingPricePaise: 2500000, mrpPaise: null, gstIncluded: false, gstRate: 12, priceUnit: "per piece", expectedVersion: row.version },
  });
  expect(ok.status()).toBe(200);
  const stale = await request.put(`/api/admin/prices/${row.productId}`, {
    headers: ORIGIN,
    data: { sellingPricePaise: 2600000, mrpPaise: null, gstIncluded: false, gstRate: 12, priceUnit: "per piece", expectedVersion: row.version },
  });
  expect(stale.status()).toBe(409);
  const after = (await (await request.get(`/api/admin/prices/${row.productId}/history`)).json()).history.length;
  expect(after).toBe(before + 1);
  const unknown = await request.put(`/api/admin/prices/999999`, {
    headers: ORIGIN,
    data: { sellingPricePaise: 1, mrpPaise: null, gstIncluded: false, gstRate: null, priceUnit: "per piece", expectedVersion: 1 },
  });
  expect(unknown.status()).toBe(404);
});

test("cross-origin writes are blocked", async ({ request }) => {
  const r = await request.put(`/api/admin/prices/1`, { headers: { Origin: "https://evil.example", "Content-Type": "application/json" }, data: {} });
  expect(r.status()).toBe(403);
});

test("final enquiry revalidation detects a price change", async ({ request }) => {
  const row = await productId(request, "VS-ANC-RENO-3KTLX");
  const seen = row.sellingPaise;
  const upd = await request.put(`/api/admin/prices/${row.productId}`, {
    headers: ORIGIN,
    data: { sellingPricePaise: (seen ?? 0) + 100, mrpPaise: null, gstIncluded: false, gstRate: 12, priceUnit: "per piece", expectedVersion: row.version },
  });
  expect(upd.status()).toBe(200);
  const r = await request.post("/api/enquiry/revalidate", { headers: { "Content-Type": "application/json" }, data: { items: [{ productId: row.productId, quantity: 2, seenSellingPaise: seen }] } });
  const j = await r.json();
  expect(j.items[0].changed).toBe(true);
  expect(j.items[0].price.sellingPaise).toBe((seen ?? 0) + 100);
});

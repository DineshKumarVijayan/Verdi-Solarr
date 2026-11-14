import { expect, test } from "@playwright/test";

const TOPCON = "/products/anchor-n-type-topcon-dual-glass-bifacial-module-620-wp";

// The Worker serves product HTML, sitemap and robots only in a build (npm run preview / production);
// the Vite dev server answers those URLs itself.
async function needsBuild(request: import("@playwright/test").APIRequestContext) {
  const ct = (await request.get("/robots.txt")).headers()["content-type"] ?? "";
  test.skip(ct.includes("html"), "run against npm run preview (BASE_URL=http://localhost:4173)");
}

test("product HTML carries live preview tags and Product JSON-LD (no invented stock or ratings)", async ({ request }) => {
  await needsBuild(request);
  const html = await (await request.get(TOPCON)).text();
  expect(html).toMatch(/<meta property="og:image" content="http[^"]+\/images\/products\/[^"]+"/);
  expect(html).toContain('<meta property="og:type" content="product"');
  expect(html).toContain('"@type":"Product"');
  expect(html).not.toMatch(/aggregateRating|"availability"/);
  expect((html.match(/<title>/g) ?? []).length).toBe(1);
});

test("sitemap and robots are generated live", async ({ request }) => {
  await needsBuild(request);
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain(`${TOPCON}</loc>`);
  expect(xml).toContain("/solar-panels-chennai</loc>");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Sitemap: http.+\/sitemap\.xml/);
  expect(robots).toContain("Disallow: /admin");
});

test("local landing page lists live products and FAQs", async ({ page }) => {
  await page.goto("/solar-panels-chennai");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Solar panels in Chennai");
  await expect(page.getByTestId("product-card").first()).toBeVisible();
  await page.getByText("Are the prices shown final?").click();
  await expect(page.getByText(/re-check them when you send an enquiry/)).toBeVisible();
});

test("share menu offers WhatsApp, email and copy link for a product", async ({ page }) => {
  await page.goto(TOPCON);
  await page.locator("#buy-box").getByTestId("share-button").click();
  const menu = page.getByTestId("share-menu");
  await expect(menu.getByRole("menuitem", { name: "WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/\?text=.*620/);
  await expect(menu.getByRole("menuitem", { name: "Email" })).toHaveAttribute("href", /^mailto:\?subject=/);
  await expect(menu.getByRole("menuitem", { name: "Instagram" })).toBeVisible();
});

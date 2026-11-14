import { expect, test } from "@playwright/test";

for (const path of ["/", "/in-the-field", "/products", "/products/anchor-ino-residential-single-phase-pv-inverter-5ktlx", "/enquiry", "/learn", "/solar-tools/kit-builder", "/compare", "/admin/prices", "/admin/quotations", "/admin/quotations/new", "/solar-panels-chennai", "/account"]) {
  test(`no horizontal overflow on mobile: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("mobile navigation menu and fullscreen datasheet dialog", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.locator("#mobile-nav").getByRole("link", { name: "Learn" }).click();
  await expect(page).toHaveURL(/\/learn/);
  await page.goto("/products/anchor-solar-dc-cable-4-sq-mm");
  await page.getByTestId("preview-datasheet").first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator("canvas").first()).toBeVisible({ timeout: 30_000 });
  const box = await dialog.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(page.viewportSize()!.width - 2);
  await dialog.getByRole("button", { name: "Close dialog" }).click();
  await expect(dialog).toBeHidden();
});

test("product page: sticky add-to-enquiry bar appears after scrolling and adds to the basket; gallery swipes", async ({ page }) => {
  await page.goto("/products/anchor-n-type-topcon-dual-glass-bifacial-module-620-wp");
  await expect(page.getByTestId("sticky-buy-bar")).toHaveCount(0);
  await page.locator("#buy-box").evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().bottom + window.scrollY + 200));
  const bar = page.getByTestId("sticky-buy-bar");
  await expect(bar).toBeVisible();
  await bar.getByRole("button", { name: "Add to enquiry" }).click();
  await expect(page.getByTestId("basket-count")).toHaveText("1");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

// Small phones (360 px) with someone signed in: the header (name pill, basket, menu) must still fit.
test.describe("360 px phone, signed in", () => {
  test.use({ viewport: { width: 360, height: 760 } });
  for (const path of ["/", "/products", "/admin/products/new", "/admin/quotations/new"]) {
    test(`no horizontal overflow at 360 px: ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    });
  }
});

// Admin lists on phones are cards: nothing hidden in a sideways-scrolling box (price, status, edit visible).
for (const path of ["/admin/products", "/admin/prices", "/admin/customers", "/admin/users"]) {
  test(`admin list shows everything without sideways scrolling: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll("main *")].filter((el) => {
        const o = getComputedStyle(el).overflowX;
        return (o === "auto" || o === "scroll") && el.scrollWidth > el.clientWidth + 2 && !el.closest('nav[aria-label="Admin"]') && !String(el.className).includes("scrollbar-none");
      }).length,
    );
    expect(hidden).toBe(0);
    const firstRow = page.locator("table.rtable tbody tr").first();
    const box = await firstRow.boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  });
}

// Pages must actually render (a blank page passes width checks): heading visible, no script errors.
for (const path of ["/", "/products", "/products/anchor-ino-residential-single-phase-pv-inverter-5ktlx", "/enquiry", "/account"]) {
  test(`renders without script errors: ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && /Content Security Policy|Uncaught|preamble/i.test(m.text()) && errors.push(m.text()));
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("home catalogue is a swipeable card carousel on phones; dots move between categories", async ({ page }) => {
  await page.goto("/");
  const cards = page.getByTestId("catalogue-cards");
  await cards.scrollIntoViewIfNeeded();
  await expect(cards.getByTestId("catalogue-card").first()).toBeVisible();
  const dots = cards.getByRole("tab");
  await expect(dots.first()).toHaveAttribute("aria-selected", "true");
  await dots.nth(1).click();
  await expect(dots.nth(1)).toHaveAttribute("aria-selected", "true");
  // the desktop rail is not shown on phones
  await expect(page.locator('[role="tablist"][aria-label="Product categories"]')).toBeHidden();
});

// Very small phones (Galaxy Fold folded ≈ 280 px): header buttons stay on screen, nothing overflows.
test.describe("280 px phone", () => {
  test.use({ viewport: { width: 280, height: 640 }, isMobile: false });
  for (const path of ["/", "/products", "/products/anchor-ino-residential-single-phase-pv-inverter-5ktlx", "/solar-tools", "/in-the-field", "/account", "/admin/products", "/admin/quotations/new"]) {
    test(`fits at 280 px: ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(280);
      const menu = page.getByRole("button", { name: "Menu", exact: true });
      if (await menu.count()) {
        const box = await menu.boundingBox();
        expect(box!.x + box!.width).toBeLessThanOrEqual(280);
      }
    });
  }
});

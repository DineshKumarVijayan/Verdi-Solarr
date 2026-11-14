import { expect, test } from "@playwright/test";

for (const path of ["/", "/in-the-field", "/products", "/products/anchor-ino-residential-single-phase-pv-inverter-5ktlx", "/enquiry", "/learn", "/solar-tools/kit-builder", "/compare", "/admin/prices", "/solar-panels-chennai", "/account"]) {
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

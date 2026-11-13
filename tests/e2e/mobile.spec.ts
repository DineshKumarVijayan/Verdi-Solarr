import { expect, test } from "@playwright/test";

for (const path of ["/", "/products", "/products/anchor-ino-residential-single-phase-pv-inverter-5ktlx", "/enquiry", "/learn", "/solar-tools/kit-builder", "/compare", "/admin/prices"]) {
  test(`no horizontal overflow on mobile: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("mobile navigation menu and fullscreen datasheet dialog", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
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

import { expect, test } from "@playwright/test";
import { CUSTOMER, OWNER } from "./global-setup";

// These tests start signed OUT (no shared admin session).
test.use({ storageState: { cookies: [], origins: [] } });

test("admin API is closed without a session", async ({ request }) => {
  expect((await request.get("/api/admin/me")).status()).toBe(401);
  expect((await request.get("/api/admin/customers")).status()).toBe(401);
});

test("admin signs in with mobile + password, wrong password is rejected, sign out ends the session", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByTestId("admin-login-form")).toBeVisible();
  await page.getByLabel("Mobile number").fill(OWNER.mobile);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByTestId("admin-login-submit").click();
  await expect(page.getByRole("alert")).toContainText("incorrect");
  await page.getByLabel("Password").fill(OWNER.password);
  await page.getByTestId("admin-login-submit").click();
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();
  await page.getByTestId("admin-sign-out").click();
  await expect(page.getByTestId("admin-login-form")).toBeVisible();
  expect((await page.request.get("/api/admin/me")).status()).toBe(401);
});

test("test customer signs in and gets the My account menu (hidden when signed out)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const primary = page.getByRole("navigation", { name: "Primary" });
  await expect(primary.getByRole("link", { name: "My account" })).toHaveCount(0);
  await page.goto("/account");
  await page.getByLabel("Mobile number or email").fill(CUSTOMER.mobile);
  await page.getByLabel("Password").fill(CUSTOMER.password);
  await page.getByTestId("account-submit").click();
  await expect(page.getByTestId("account-name")).toContainText("Hello, Test");
  await expect(page.getByTestId("points-balance")).toBeVisible();
  await expect(primary.getByRole("link", { name: "My account" })).toBeVisible();
  await page.getByTestId("sign-out").click();
  await expect(primary.getByRole("link", { name: "My account" })).toHaveCount(0);
});

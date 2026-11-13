import { defineConfig, devices } from "@playwright/test";

// Runs against the local Vite + Workers runtime (miniflare) with local D1.
// This verifies application behaviour locally; it does NOT prove Cloudflare Access,
// DNS or production deployment — those are verified separately (see DEPLOYMENT.md).
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:5173", trace: "retain-on-failure", storageState: "tests/e2e/.auth/owner.json" },
  webServer: { command: "npm run dev -- --port 5173 --strictPort", url: (process.env.BASE_URL ?? "http://localhost:5173") + "/api/health", reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: /mobile.spec.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec\.ts/ },
  ],
});

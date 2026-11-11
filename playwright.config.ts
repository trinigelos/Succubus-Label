import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests need a running dev server against a real Supabase project
 * (migrations applied, seed data loaded) and PayPal sandbox credentials.
 * Without that configuration the specs skip themselves instead of failing
 * — see e2e/README.md.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.SHOP_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: process.env.SHOP_URL ?? "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});

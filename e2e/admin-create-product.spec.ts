import { expect, test } from "@playwright/test";
import path from "node:path";
import { loginAsAdmin } from "./helpers/adminAuth";

const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const hasEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !!TEST_ADMIN_EMAIL;

test.describe("admin creates a product", () => {
  test.skip(
    !hasEnv,
    "Needs a real Supabase project (migrations + ADMIN_EMAILS) and TEST_ADMIN_EMAIL."
  );

  // SPEC §13.6: from the panel, on mobile, create a product with photos,
  // sizes and stock, publish it, and see it in the shop in under a minute.
  test("create, publish and find it in the shop", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAsAdmin(page, TEST_ADMIN_EMAIL!);
    await expect(page).toHaveURL(/\/admin$/);

    const productName = `Test E2E ${Date.now()}`;

    await page.goto("/admin/prodotti/nuovo");
    await page.getByLabel("Nome").fill(productName);
    await page.getByLabel("Prezzo (€, IVA incl.)").fill("49,00");
    await page.getByRole("button", { name: /continua/i }).click();

    await expect(page).toHaveURL(/\/admin\/prodotti\/[^/]+$/);

    await page
      .locator('input[type="file"]')
      .setInputFiles(path.join(__dirname, "../docs/img/harness.jpg"));
    await expect(page.locator("img[alt='Foto 1']")).toBeVisible({ timeout: 15_000 });

    const sRow = page.getByText("S", { exact: true }).locator("..");
    await sRow.getByRole("button", { name: "Più" }).click();

    await page.getByRole("button", { name: "Pubblica" }).click();
    await expect(page.getByText("Pubblicato. È già visibile nel negozio.")).toBeVisible();

    await page.goto("/shop");
    await expect(page.getByText(productName)).toBeVisible();
  });
});

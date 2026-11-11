import { expect, test } from "@playwright/test";

const hasEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
  !!process.env.PAYPAL_SANDBOX_BUYER_EMAIL &&
  !!process.env.PAYPAL_SANDBOX_BUYER_PASSWORD;

test.describe("purchase flow", () => {
  test.skip(
    !hasEnv,
    "Needs a seeded Supabase project, PAYPAL_ENV=sandbox and PAYPAL_SANDBOX_BUYER_* credentials."
  );

  // SPEC §13.2 and §13.4: a size must be chosen before adding to cart, and
  // paying in the PayPal sandbox marks the order as paid with stock deducted.
  test("add a product to the cart and pay with the PayPal sandbox", async ({ page }) => {
    await page.goto("/shop");
    await page.locator('a[href^="/prodotto/"]').first().click();

    await page.getByRole("button", { name: "Aggiungi al carrello" }).click();
    await expect(page.getByText("Scegli una taglia per continuare.")).toBeVisible();

    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Aggiungi al carrello" }).click();
    await expect(page.getByText(/Aggiunto:/)).toBeVisible();

    await page.goto("/checkout");
    await page.getByLabel("Email").fill("cliente.e2e@example.com");
    await page.getByLabel("Nome").fill("Maria");
    await page.getByLabel("Cognome").fill("Rossi");
    await page.getByLabel("Indirizzo e numero civico").fill("Via Roma 1");
    await page.getByLabel("CAP").fill("20100");
    await page.getByLabel("Città").fill("Milano");
    await page
      .getByText(/Accetto i Termini di vendita/)
      .locator("input[type=checkbox]")
      .check();

    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: /PayPal/i }).click();
    const popup = await popupPromise;

    await popup.getByLabel(/email|telefono/i).fill(process.env.PAYPAL_SANDBOX_BUYER_EMAIL!);
    await popup.getByRole("button", { name: /avanti|next/i }).click();
    await popup.getByLabel(/password/i).fill(process.env.PAYPAL_SANDBOX_BUYER_PASSWORD!);
    await popup.getByRole("button", { name: /accedi|log in/i }).click();
    await popup.getByRole("button", { name: /paga ora|pay now|completa/i }).click();

    await expect(page).toHaveURL(/\/ordine\/\d+\?t=/, { timeout: 30_000 });
    await expect(page.getByText("È TUO.")).toBeVisible();
  });
});

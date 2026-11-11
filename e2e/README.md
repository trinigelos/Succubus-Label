# E2E tests

These Playwright specs need live infrastructure that does not exist yet in
this environment (no Supabase project, no PayPal sandbox app). Each spec
checks for its required environment variables and skips itself — rather than
failing — when they are missing, so `npm run test:e2e` stays green until
that infrastructure is in place.

## `admin-create-product.spec.ts` (SPEC §13.6)

Logs in as an admin through a real Supabase-generated magic link (no inbox
needed) and creates, publishes and finds a product in the shop. Requires:

- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — migrations applied
- `TEST_ADMIN_EMAIL` — an address already listed in `ADMIN_EMAILS`

## `purchase.spec.ts` (SPEC §13.2, §13.4)

Adds a product to the cart and pays through the **PayPal sandbox**. Requires:

- `NEXT_PUBLIC_SUPABASE_URL` with the catalog seeded (`npm run db:seed`)
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`,
  `PAYPAL_ENV=sandbox`
- `PAYPAL_SANDBOX_BUYER_EMAIL`, `PAYPAL_SANDBOX_BUYER_PASSWORD` — a sandbox
  personal account from the [PayPal Developer Dashboard](https://developer.paypal.com)

The PayPal popup selectors are best-effort (PayPal's own login UI, outside
our control) — adjust them if PayPal changes it.

## Running locally

```bash
npm run dev          # in one terminal
npm run test:e2e      # in another, with the env vars above set
```

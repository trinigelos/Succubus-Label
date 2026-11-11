import { createClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

/**
 * Logs the Playwright browser context in as an admin by generating a real
 * magic link through the Supabase Admin API and visiting it — this
 * exercises the actual /auth/callback flow instead of faking a session.
 * Requires SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL and an
 * email already present in ADMIN_EMAILS.
 */
export async function loginAsAdmin(page: Page, email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const shopUrl = process.env.SHOP_URL ?? "http://localhost:3000";

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${shopUrl}/auth/callback?next=/admin` },
  });
  if (error || !data.properties?.action_link) {
    throw new Error(`Could not generate a magic link for ${email}: ${error?.message}`);
  }

  await page.goto(data.properties.action_link);
}

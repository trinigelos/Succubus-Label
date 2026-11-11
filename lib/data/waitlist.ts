import { createClient } from "@/lib/supabase/client";

export type WaitlistResult = { ok: true } | { ok: false; error: string };

export async function joinWaitlist(
  list: string,
  email: string
): Promise<WaitlistResult> {
  const trimmed = email.trim();
  if (!trimmed || !trimmed.includes("@")) {
    return { ok: false, error: "Inserisci un'email valida." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("waitlist")
    .insert({ email: trimmed, list, consent: true });

  if (error) return { ok: false, error: "Qualcosa è andato storto. Riprova." };
  return { ok: true };
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useTransition } from "react";
import styles from "./page.module.css";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return (
      <p className={styles.message}>
        Se il tuo indirizzo è autorizzato, ti abbiamo mandato un link per
        entrare. Controlla la posta.
      </p>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const supabase = createClient();
          const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
          await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
              emailRedirectTo: `${window.location.origin}${basePath}/auth/callback?next=/admin`,
            },
          });
          setSent(true);
        });
      }}
    >
      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? "…" : "Entra con un link"}
      </button>
    </form>
  );
}

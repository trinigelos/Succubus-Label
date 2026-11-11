"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Completes the magic-link login (Supabase Auth, PKCE flow) in the browser. */
export function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .exchangeCodeForSession(window.location.href)
      .finally(() => router.replace(next));
  }, [next, router]);

  return null;
}

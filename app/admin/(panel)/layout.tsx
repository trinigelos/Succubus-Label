"use client";

import { getOrdersBadgeCount } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminNav } from "./AdminNav";
import styles from "./layout.module.css";

type Status = "loading" | "ok" | "denied";

export default function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [ordersBadge, setOrdersBadge] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user?.email) {
        router.replace("/admin/login");
        return;
      }
      // Real gate: RLS only lets an email in app_admins read its own row.
      const { data } = await supabase
        .from("app_admins")
        .select("email")
        .eq("email", user.email)
        .maybeSingle();
      if (!data) {
        setStatus("denied");
        return;
      }
      setStatus("ok");
      getOrdersBadgeCount()
        .then(setOrdersBadge)
        .catch(() => {});
    });
  }, [router]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (status === "loading") return null;

  if (status === "denied") {
    return (
      <div className={styles.shell}>
        <main className={styles.main}>
          <p>Questo indirizzo non è autorizzato ad entrare nel pannello.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <nav className={styles.nav} aria-label="Pannello">
        <Link href="/admin" className={styles.logo}>
          SUCCUBUS
        </Link>
        <AdminNav ordersBadge={ordersBadge} />
        <button type="button" className={styles.signOut} onClick={signOut}>
          Esci
        </button>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

"use client";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getSettings } from "@/lib/data/products";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const [shippingRates, setShippingRates] = useState({
    standard: 0,
    express: 0,
    europe: 0,
  });
  const [freeShippingThresholdCents, setFreeShippingThresholdCents] = useState<
    number | null
  >(null);
  const [bankTransferReserveDays, setBankTransferReserveDays] = useState(3);

  useEffect(() => {
    getSettings()
      .then((settings) => {
        const rates = settings["shipping_rates_cents"];
        if (rates && typeof rates === "object") {
          setShippingRates((prev) => ({ ...prev, ...(rates as object) }));
        }
        const threshold = settings["free_shipping_threshold_cents"];
        setFreeShippingThresholdCents(
          typeof threshold === "number" ? threshold : null
        );
        const days = settings["bank_transfer_reserve_days"];
        if (typeof days === "number") setBankTransferReserveDays(days);
      })
      .catch(() => {
        // Supabase not configured yet: defaults are used
      });
  }, []);

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <span>SUCCUBUS</span>
            <span>LABEL</span>
          </Link>
          <ol aria-label="Passaggi" className={styles.steps}>
            <li>
              <Link href="/carrello">Carrello</Link>
            </li>
            <li aria-current="step">Dati e spedizione</li>
            <li>Pagamento</li>
          </ol>
        </div>
      </header>

      <main className={styles.main}>
        <CheckoutForm
          shippingRates={shippingRates}
          freeShippingThresholdCents={freeShippingThresholdCents}
          bankTransferReserveDays={bankTransferReserveDays}
        />
      </main>
    </div>
  );
}

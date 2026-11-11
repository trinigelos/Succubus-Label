"use client";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getSettings } from "@/lib/data/products";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function CheckoutPage() {
  const [shippingRates, setShippingRates] = useState({
    express_it: 0,
    express_eu: 0,
    hand_re: 0,
  });
  const [freeShippingThresholdCents, setFreeShippingThresholdCents] = useState<
    number | null
  >(null);
  const [bankTransferReserveDays, setBankTransferReserveDays] = useState(3);
  const [handDeliveryCaps, setHandDeliveryCaps] = useState<string[]>([]);

  useEffect(() => {
    getSettings()
      .then((settings) => {
        const rates = settings["shipping_prices"];
        if (rates && typeof rates === "object") {
          setShippingRates((prev) => ({ ...prev, ...(rates as object) }));
        }
        const threshold = settings["free_shipping_threshold_cents"];
        setFreeShippingThresholdCents(
          typeof threshold === "number" ? threshold : null
        );
        const days = settings["bank_transfer_reserve_days"];
        if (typeof days === "number") setBankTransferReserveDays(days);
        const caps = settings["hand_delivery_caps"];
        if (Array.isArray(caps)) setHandDeliveryCaps(caps as string[]);
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
          handDeliveryCaps={handDeliveryCaps}
        />
      </main>
    </div>
  );
}

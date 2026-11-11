"use client";

import { useCart } from "@/lib/cart/CartContext";
import { formatCents } from "@/lib/format";
import Link from "next/link";
import styles from "./CartSummary.module.css";

export function CartSummary() {
  const {
    count,
    subtotalCents,
    discreetPackaging,
    setDiscreetPackaging,
    freeShippingThresholdCents,
  } = useCart();

  const missingCents = freeShippingThresholdCents
    ? Math.max(0, freeShippingThresholdCents - subtotalCents)
    : 0;
  const progress = freeShippingThresholdCents
    ? Math.min(
        100,
        Math.round((subtotalCents / freeShippingThresholdCents) * 100)
      )
    : 100;

  return (
    <div className={styles.wrap}>
      {freeShippingThresholdCents ? (
        <div className={styles.shippingBar}>
          <span>
            {missingCents > 0
              ? `Ti mancano ${formatCents(missingCents)} per la spedizione gratuita.`
              : "Hai la spedizione gratuita."}
          </span>
          <div
            role="progressbar"
            aria-label="Progresso verso la spedizione gratuita"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className={styles.track}
          >
            <div className={styles.fill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      <div className={styles.row}>
        <span>Subtotale ({count} articoli)</span>
        <span>{formatCents(subtotalCents)}</span>
      </div>
      <div className={`${styles.row} ${styles.muted}`}>
        <span>Spedizione</span>
        <span>Calcolata al checkout</span>
      </div>

      <label className={styles.discreet}>
        <input
          type="checkbox"
          checked={discreetPackaging}
          onChange={(e) => setDiscreetPackaging(e.target.checked)}
        />
        <span>
          Imballo discreto: pacco neutro, senza logo né nome del contenuto
          all&apos;esterno.
        </span>
      </label>

      <div className={styles.total}>
        <span>Totale</span>
        <span>{formatCents(subtotalCents)}</span>
      </div>

      <Link href="/checkout" className={styles.checkoutBtn}>
        Vai al checkout
      </Link>
      <p className={styles.paymentNote}>
        PayPal (anche con carta) · Bonifico bancario
      </p>
    </div>
  );
}

"use client";

import type { CartLine } from "@/lib/cart/queries";
import { formatCents } from "@/lib/format";
import Link from "next/link";
import styles from "./CartLineItem.module.css";

export function CartLineItem({
  line,
  onSetQty,
  onRemove,
}: {
  line: CartLine & { qty: number };
  onSetQty: (variantId: string, qty: number) => void;
  onRemove: (variantId: string) => void;
}) {
  return (
    <div className={styles.row}>
      <Link href={`/prodotto?slug=${line.productSlug}`} className={styles.image}>
        {line.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={line.image}
            alt={line.productName}
            className={styles.image}
          />
        ) : null}
      </Link>
      <div className={styles.info}>
        <div className={styles.top}>
          <div>
            <Link href={`/prodotto?slug=${line.productSlug}`} className={styles.name}>
              {line.productName}
            </Link>
            <div className={styles.size}>Taglia: {line.size}</div>
          </div>
          <span className={styles.price}>
            {formatCents(line.priceCents * line.qty)}
          </span>
        </div>
        <div className={styles.controls}>
          <div className={styles.stepper}>
            <button
              type="button"
              aria-label="Diminuisci quantità"
              onClick={() => onSetQty(line.variantId, line.qty - 1)}
            >
              −
            </button>
            <span aria-live="polite">{line.qty}</span>
            <button
              type="button"
              aria-label="Aumenta quantità"
              disabled={line.qty >= line.stock}
              onClick={() => onSetQty(line.variantId, line.qty + 1)}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className={styles.remove}
            onClick={() => onRemove(line.variantId)}
          >
            Rimuovi
          </button>
        </div>
      </div>
    </div>
  );
}

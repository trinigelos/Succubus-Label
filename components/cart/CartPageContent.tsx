"use client";

import { useCart } from "@/lib/cart/CartContext";
import Link from "next/link";
import styles from "@/app/(storefront)/carrello/page.module.css";
import { CartLineItem } from "./CartLineItem";
import { CartSummary } from "./CartSummary";

export function CartPageContent() {
  const { lines, setQty, removeItem } = useCart();

  if (lines.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyLines}>
          <span>Ancora niente</span>
          <span>DI NERO QUI</span>
        </p>
        <Link href="/shop" className={styles.emptyCta}>
          Vai alla lingerie
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.items}>
        {lines.map((line) => (
          <CartLineItem
            key={line.variantId}
            line={line}
            onSetQty={setQty}
            onRemove={removeItem}
          />
        ))}
      </div>
      <aside aria-label="Riepilogo ordine" className={styles.summary}>
        <h2 className={styles.summaryTitle}>Riepilogo</h2>
        <CartSummary />
      </aside>
    </div>
  );
}

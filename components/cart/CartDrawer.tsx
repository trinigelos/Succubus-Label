"use client";

import { useCart } from "@/lib/cart/CartContext";
import Link from "next/link";
import { useEffect } from "react";
import { CartLineItem } from "./CartLineItem";
import styles from "./CartDrawer.module.css";
import { CartSummary } from "./CartSummary";

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, lines, setQty, removeItem } = useCart();

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Chiudi il carrello"
        className={styles.overlay}
        onClick={closeDrawer}
      />
      <aside
        aria-label="Carrello"
        role="dialog"
        aria-modal="true"
        className={styles.drawer}
      >
        <div className={styles.header}>
          <span className={styles.title}>Il tuo carrello</span>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Chiudi"
            onClick={closeDrawer}
          >
            ×
          </button>
        </div>
        <div className={styles.body}>
          {lines.length === 0 ? (
            <div className={styles.empty}>
              <span>Ancora niente di nero qui.</span>
              <Link href="/shop" onClick={closeDrawer}>
                Vai alla lingerie
              </Link>
            </div>
          ) : (
            lines.map((line) => (
              <CartLineItem
                key={line.variantId}
                line={line}
                onSetQty={setQty}
                onRemove={removeItem}
              />
            ))
          )}
        </div>
        {lines.length > 0 ? (
          <div className={styles.footer}>
            <CartSummary />
            <Link
              href="/carrello"
              onClick={closeDrawer}
              style={{ fontSize: 12, textAlign: "center" }}
            >
              Vedi il carrello completo
            </Link>
          </div>
        ) : null}
      </aside>
    </>
  );
}

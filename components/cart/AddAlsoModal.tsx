"use client";

import { useCart } from "@/lib/cart/CartContext";
import { imageUrl, productCover } from "@/lib/data/product-helpers";
import { getUpsellProducts } from "@/lib/data/upsell";
import { formatCents } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useEffect, useState } from "react";
import styles from "./AddAlsoModal.module.css";

function SuggestionCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const cover = productCover(product);
  const availableVariants = product.variants.filter(
    (v) => v.active && v.stock > 0
  );

  function handleAdd() {
    if (availableVariants.length === 1) {
      addItem(availableVariants[0].id, 1);
      setAdded(true);
      return;
    }
    setPickerOpen((v) => !v);
  }

  function pick(variantId: string) {
    addItem(variantId, 1);
    setAdded(true);
    setPickerOpen(false);
  }

  return (
    <div className={styles.card}>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl(cover.path)}
          alt={cover.alt || product.name}
          className={styles.cardImage}
        />
      ) : (
        <div className={styles.cardImage} />
      )}
      <span className={styles.cardName}>{product.name}</span>
      {added ? (
        <span className={styles.cardAdded}>Aggiunto ✓</span>
      ) : (
        <div className={styles.pickerWrap}>
          <button type="button" className={styles.cardBtn} onClick={handleAdd}>
            Aggiungi · {formatCents(product.price_cents)}
          </button>
          {pickerOpen ? (
            <div className={styles.picker} role="group" aria-label="Scegli la taglia">
              {availableVariants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={styles.pickerSize}
                  onClick={() => pick(v.id)}
                >
                  {v.size}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function AddAlsoModal() {
  const { showUpsell, closeUpsell, lines } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!showUpsell) return;
    const cartProductIds = Array.from(new Set(lines.map((l) => l.productId)));
    let cancelled = false;
    getUpsellProducts(cartProductIds)
      .then((prods) => {
        if (cancelled) return;
        setProducts(prods);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUpsell]);

  useEffect(() => {
    if (showUpsell && loaded && products.length === 0) {
      closeUpsell();
    }
  }, [showUpsell, loaded, products.length, closeUpsell]);

  useEffect(() => {
    if (!showUpsell) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeUpsell();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showUpsell, closeUpsell]);

  if (!showUpsell || !loaded || products.length === 0) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Chiudi"
        className={styles.overlay}
        onClick={closeUpsell}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Aggiungi anche questi pezzi"
        className={styles.sheet}
      >
        <div className={styles.header}>
          <span className={styles.title}>Aggiungi anche</span>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Chiudi"
            onClick={closeUpsell}
          >
            ×
          </button>
        </div>
        <span className={styles.eyebrow}>QUESTI PEZZI</span>
        <div className={styles.grid}>
          {products.map((p) => (
            <SuggestionCard key={p.id} product={p} />
          ))}
        </div>
        <button type="button" className={styles.skipBtn} onClick={closeUpsell}>
          No grazie, vai al carrello
        </button>
        <div className={styles.footer}>
          <span aria-hidden="true">🚚</span>
          <span>Spedizione sempre Express</span>
        </div>
      </div>
    </>
  );
}

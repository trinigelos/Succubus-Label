"use client";

import { WaitlistForm } from "@/components/WaitlistForm";
import { useCart } from "@/lib/cart/CartContext";
import {
  imageUrl,
  productCover,
  productLabel,
  totalStock,
} from "@/lib/data/product-helpers";
import { formatCents } from "@/lib/format";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./ProductCard.module.css";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const cover = productCover(product);
  const label = productLabel(product);
  const soldOut = totalStock(product) === 0;
  const discountPercent =
    product.is_outlet && product.compare_at_cents
      ? Math.round(
          ((product.compare_at_cents - product.price_cents) /
            product.compare_at_cents) *
            100
        )
      : null;
  const availableVariants = product.variants.filter(
    (v) => v.active && v.stock > 0
  );
  const href = `/prodotto?slug=${product.slug}`;

  function handleAdd() {
    if (availableVariants.length === 1) {
      addItem(availableVariants[0].id, 1);
      setAdded(true);
      return;
    }
    setPickerOpen((open) => !open);
  }

  function pick(variantId: string) {
    addItem(variantId, 1);
    setAdded(true);
    setPickerOpen(false);
  }

  return (
    <div className={styles.card}>
      <Link href={href} className={styles.imageWrap}>
        {cover ? (
          <Image
            src={imageUrl(cover.path)}
            alt={cover.alt || product.name}
            width={520}
            height={650}
            className={`${styles.image} ${soldOut ? styles.imageSoldOut : ""}`}
          />
        ) : (
          <div className={`${styles.image} ${soldOut ? styles.imageSoldOut : ""}`} />
        )}
        {label === "nuovo" ? (
          <span className={`${styles.badge} ${styles.badgeNuovo}`}>Nuovo</span>
        ) : null}
        {label === "ultimi-pezzi" ? (
          <span className={`${styles.badge} ${styles.badgeUltimi}`}>
            Ultimi pezzi
          </span>
        ) : null}
        {label === "esaurito" ? (
          <span className={styles.badgeEsaurito}>Esaurito</span>
        ) : null}
        {discountPercent !== null ? (
          <span className={`${styles.badge} ${styles.badgeOutlet}`}>
            −{discountPercent}%
          </span>
        ) : null}
      </Link>

      <div className={styles.titleRow}>
        <Link href={href}>{product.name}</Link>
        <span className={styles.priceRow}>
          {product.compare_at_cents ? (
            <span className={styles.priceCompare}>
              {formatCents(product.compare_at_cents)}
            </span>
          ) : null}
          <span>{formatCents(product.price_cents)}</span>
        </span>
      </div>

      <div className={styles.metaRow}>
        <span className={styles.sizes}>
          {soldOut
            ? "Tornerà presto"
            : product.variants.map((v) => v.size).join(" · ")}
        </span>

        {soldOut ? (
          notifyOpen ? (
            <WaitlistForm
              list={`restock:${product.id}`}
              label={`Avvisami quando ${product.name} torna disponibile`}
              buttonClassName={styles.actionBtn}
            />
          ) : (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => setNotifyOpen(true)}
            >
              Avvisami
            </button>
          )
        ) : added ? (
          <span className={styles.added}>Aggiunto ✓</span>
        ) : (
          <div className={styles.pickerWrap}>
            <button type="button" className={styles.actionBtn} onClick={handleAdd}>
              + Aggiungi
            </button>
            {pickerOpen ? (
              <div className={styles.picker} role="group" aria-label="Scegli la taglia">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={styles.pickerSize}
                    disabled={!v.active || v.stock === 0}
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
    </div>
  );
}

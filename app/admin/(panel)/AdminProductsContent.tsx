"use client";

import {
  getAdminDashboard,
  getAdminProducts,
  type AdminProductFilter,
} from "@/lib/data/admin";
import { imageUrl, productCover, totalStock } from "@/lib/data/product-helpers";
import { formatCents } from "@/lib/format";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminProductFilters } from "./AdminProductFilters";
import { DeleteProductButton } from "./DeleteProductButton";
import styles from "./page.module.css";

const STATUS_LABEL: Record<string, string> = {
  draft: "Bozza",
  published: "Pubblicato",
};

export function AdminProductsContent() {
  const searchParams = useSearchParams();
  const filter = (searchParams.get("filtro") || "tutti") as AdminProductFilter;
  const q = searchParams.get("q") ?? "";

  const [dashboard, setDashboard] = useState({
    toShip: 0,
    outOfStockVariants: 0,
    salesThisMonthCents: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);

  function reload() {
    getAdminDashboard().then(setDashboard).catch(() => {});
    getAdminProducts(filter, q)
      .then(setProducts)
      .catch(() => {});
  }

  useEffect(reload, [filter, q]);

  return (
    <div>
      <div className={styles.topRow}>
        <div className={styles.titleBlock}>
          <span className={styles.kicker}>Ciao —</span>
          <h1 className={styles.title}>Prodotti</h1>
        </div>
        <Link href="/admin/prodotti/nuovo" className={styles.newBtn}>
          + Nuovo prodotto
        </Link>
      </div>

      <div className={styles.summary}>
        <Link href="/admin/ordini?filtro=da-spedire" className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Da spedire</span>
          <span className={styles.summaryValue}>{dashboard.toShip}</span>
        </Link>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Taglie esaurite</span>
          <span className={styles.summaryValue}>{dashboard.outOfStockVariants}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Vendite questo mese</span>
          <span className={styles.summaryValue}>
            {formatCents(dashboard.salesThisMonthCents)}
          </span>
        </div>
      </div>

      <AdminProductFilters />

      <div className={styles.tableWrap}>
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.headRow}`}>
            <span></span>
            <span>Prodotto</span>
            <span>Categoria</span>
            <span>Prezzo</span>
            <span>Stock per taglia</span>
            <span>Stato</span>
            <span style={{ textAlign: "right" }}>Azioni</span>
          </div>

          {products.map((product) => {
            const cover = productCover(product);
            const stock = totalStock(product);
            const soldOut = stock === 0;
            return (
              <div key={product.id} className={styles.row}>
                {cover ? (
                  <Image
                    src={imageUrl(cover.path)}
                    alt=""
                    width={64}
                    height={80}
                    className={`${styles.thumb} ${soldOut ? styles.thumbFaded : ""}`}
                  />
                ) : (
                  <div className={styles.thumb} />
                )}
                <Link
                  href={`/admin/prodotti/modifica?id=${product.id}`}
                  className={styles.productName}
                >
                  {product.name}
                </Link>
                <span className={styles.category}>
                  {product.categories?.name ?? "—"}
                </span>
                <span>{formatCents(product.price_cents)}</span>
                <span className={styles.stock}>
                  {product.variants.map((v) => (
                    <span
                      key={v.id}
                      className={`${styles.stockChip} ${v.stock === 0 ? styles.stockChipEmpty : ""}`}
                    >
                      {v.size} {v.stock}
                    </span>
                  ))}
                </span>
                <span
                  className={
                    product.status === "draft"
                      ? styles.statusMuted
                      : soldOut
                        ? styles.statusError
                        : undefined
                  }
                >
                  {soldOut && product.status === "published"
                    ? "Esaurito"
                    : STATUS_LABEL[product.status]}
                </span>
                <span className={styles.actions}>
                  <Link href={`/admin/prodotti/modifica?id=${product.id}`}>
                    Modifica
                  </Link>
                  <DeleteProductButton
                    productId={product.id}
                    productName={product.name}
                    onDeleted={reload}
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className={styles.footnote}>
        Le taglie in rosso sono esaurite. Un prodotto con tutte le taglie a 0
        diventa &ldquo;Esaurito&rdquo; in automatico nel negozio.
      </p>
    </div>
  );
}

"use client";

import { ProductCard } from "@/components/shop/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { getCategories, getShopProducts } from "@/lib/data/products";
import type { Category, Product, ShopSort } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const VALID_SORTS: ShopSort[] = ["novita", "prezzo-asc", "prezzo-desc"];

export function ShopPageContent() {
  const searchParams = useSearchParams();
  const categoria = searchParams.get("categoria") ?? undefined;
  const taglia = searchParams.get("taglia") ?? undefined;
  const ordinaParam = searchParams.get("ordina");
  const ordina = VALID_SORTS.includes(ordinaParam as ShopSort)
    ? (ordinaParam as ShopSort)
    : "novita";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getCategories(),
      getShopProducts({ categoria, taglia, ordina }),
    ])
      .then(([cats, prods]) => {
        if (cancelled) return;
        setCategories(cats);
        setProducts(prods);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [categoria, taglia, ordina]);

  return (
    <main className={styles.main}>
      <p className={styles.breadcrumb}>
        <Link href="/">Home</Link> / Lingerie
      </p>
      <div className={styles.heading}>
        <h1 className={styles.title}>
          <span>The black label</span>
          <span className={styles.titleImpact}>OF LINGERIE</span>
        </h1>
        <p className={styles.count}>{products.length} pezzi</p>
      </div>

      <ShopFilters categories={categories} />

      {loaded && products.length === 0 ? (
        <p className={styles.empty}>Nessun pezzo trovato con questi filtri.</p>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

"use client";

import { ProductCard } from "@/components/shop/ProductCard";
import { getOutletProducts } from "@/lib/data/products";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import shopStyles from "../shop/page.module.css";
import styles from "./page.module.css";

export function OutletPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const collezione = searchParams.get("collezione") ?? "";

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOutletProducts()
      .then((prods) => {
        if (cancelled) return;
        setAllProducts(prods);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const collections = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.collection) set.add(p.collection);
    });
    return Array.from(set);
  }, [allProducts]);

  const products = collezione
    ? allProducts.filter((p) => p.collection === collezione)
    : allProducts;

  function chipHref(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("collezione", value);
    else params.delete("collezione");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <main className={shopStyles.main}>
      <p className={shopStyles.breadcrumb}>
        <Link href="/">Home</Link> / Outlet
      </p>
      <div className={shopStyles.heading}>
        <h1 className={shopStyles.title}>
          <span>Collezioni precedenti</span>
          <span className={shopStyles.titleImpact}>OUTLET</span>
        </h1>
        <p className={shopStyles.count}>{products.length} pezzi</p>
      </div>

      {collections.length > 0 ? (
        <div className={styles.chips} role="group" aria-label="Collezione">
          <Link
            href={chipHref("")}
            className={`${styles.chip} ${collezione === "" ? styles.chipActive : ""}`}
            aria-pressed={collezione === ""}
          >
            Tutto
          </Link>
          {collections.map((c) => (
            <Link
              key={c}
              href={chipHref(c)}
              className={`${styles.chip} ${collezione === c ? styles.chipActive : ""}`}
              aria-pressed={collezione === c}
            >
              {c}
            </Link>
          ))}
        </div>
      ) : null}

      {loaded && products.length === 0 ? (
        <p className={shopStyles.empty}>
          Nessun pezzo in outlet al momento.
        </p>
      ) : (
        <div className={shopStyles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

"use client";

import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductTile } from "@/components/shop/ProductTile";
import { imageUrl } from "@/lib/data/product-helpers";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import detailStyles from "@/components/product/ProductDetail.module.css";
import styles from "./page.module.css";

export function ProductPageContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    getProductBySlug(slug)
      .then(async (p) => {
        if (cancelled) return;
        setProduct(p);
        document.title = p ? `${p.name} · Succubus Label` : "Succubus Label";
        if (p) {
          const relatedProducts = await getRelatedProducts(p);
          if (!cancelled) setRelated(relatedProducts);
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!loaded) return null;

  if (!product) {
    return (
      <main className={styles.main}>
        <p>Prodotto non trovato.</p>
        <Link href="/shop">Torna allo shop</Link>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.product_images.map((img) => imageUrl(img.path)),
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (product.price_cents / 100).toFixed(2),
      availability: product.variants.some((v) => v.active && v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className={styles.breadcrumb}>
        <Link href="/">Home</Link> / <Link href="/shop">Lingerie</Link> /{" "}
        {product.name}
      </p>

      <ProductDetail product={product} />

      {related.length > 0 ? (
        <section className={detailStyles.related}>
          <h2 className={detailStyles.relatedTitle}>
            <span>Completa</span>
            <span className={detailStyles.relatedTitleImpact}>IL LOOK</span>
          </h2>
          <div className={detailStyles.relatedGrid}>
            {related.map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

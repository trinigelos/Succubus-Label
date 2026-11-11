"use client";

import {
  getAdminCategories,
  getAdminProductById,
  getAdminProducts,
  getRelatedProductIds,
} from "@/lib/data/admin";
import type { Category, Product } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductEditForm } from "./ProductEditForm";

export function EditProductContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      const [p, cats, allProducts, related] = await Promise.all([
        getAdminProductById(id),
        getAdminCategories(),
        getAdminProducts("tutti"),
        getRelatedProductIds(id),
      ]);
      if (cancelled) return;
      setProduct(p);
      setCategories(cats);
      setOtherProducts(allProducts.filter((item) => item.id !== id));
      setRelatedIds(related);
    })().finally(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!loaded) return null;

  if (!product) {
    return (
      <div>
        <p>Prodotto non trovato.</p>
        <Link href="/admin">← Prodotti</Link>
      </div>
    );
  }

  return (
    <ProductEditForm
      product={product}
      initialCategories={categories}
      otherProducts={otherProducts}
      initialRelatedIds={relatedIds}
    />
  );
}

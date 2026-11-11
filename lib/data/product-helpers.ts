import type { Product, ProductLabel } from "@/lib/types";

export function sortImages<T extends { position: number }>(images: T[]) {
  return [...images].sort((a, b) => a.position - b.position);
}

export function totalStock(product: Pick<Product, "variants">) {
  return product.variants
    .filter((v) => v.active)
    .reduce((sum, v) => sum + v.stock, 0);
}

export function productLabel(product: Product): ProductLabel {
  const stock = totalStock(product);
  if (stock === 0) return "esaurito";
  if (stock <= 3) return "ultimi-pezzi";
  const publishedDaysAgo =
    (Date.now() - new Date(product.created_at).getTime()) / 86_400_000;
  if (publishedDaysAgo < 30) return "nuovo";
  return null;
}

export function productCover(product: Product) {
  const [cover] = sortImages(product.product_images);
  return cover ?? null;
}

export function imageUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/products/${path}`;
}

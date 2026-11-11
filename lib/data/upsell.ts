import { sortImages } from "@/lib/data/product-helpers";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

const PRODUCT_SELECT = "*, categories(id, name, slug), variants(*), product_images(*)";

function hasStock(product: Product) {
  return product.variants.some((v) => v.active && v.stock > 0);
}

/**
 * Suggested products for the "Aggiungi anche" cart modal (CAMBIOS §5):
 * settings.upsell_product_ids when set, otherwise the related_products of
 * what's already in the cart, excluding items already there and anything
 * sold out.
 */
export async function getUpsellProducts(
  cartProductIds: string[]
): Promise<Product[]> {
  const supabase = createClient();

  const { data: settingsRow } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "upsell_product_ids")
    .maybeSingle();
  const configuredIds = Array.isArray(settingsRow?.value)
    ? (settingsRow!.value as string[])
    : [];

  if (configuredIds.length > 0) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .in("id", configuredIds)
      .eq("status", "published")
      .is("archived_at", null);
    if (error) throw error;
    const products = (data as Product[])
      .map((p) => ({ ...p, product_images: sortImages(p.product_images) }))
      .filter((p) => !cartProductIds.includes(p.id) && hasStock(p));
    if (products.length > 0) return products.slice(0, 2);
  }

  if (cartProductIds.length === 0) return [];

  const { data: related, error: relatedError } = await supabase
    .from("related_products")
    .select("related_id, products:related_id(" + PRODUCT_SELECT + ")")
    .in("product_id", cartProductIds)
    .returns<{ related_id: string; products: Product | null }[]>();
  if (relatedError) throw relatedError;

  const seen = new Set<string>();
  const suggestions: Product[] = [];
  for (const row of related ?? []) {
    const product = row.products;
    if (!product || seen.has(product.id)) continue;
    if (cartProductIds.includes(product.id)) continue;
    if (product.status !== "published" || !hasStock(product)) continue;
    seen.add(product.id);
    suggestions.push({ ...product, product_images: sortImages(product.product_images) });
    if (suggestions.length >= 2) break;
  }
  return suggestions;
}

import { imageUrl } from "@/lib/data/product-helpers";
import { createClient } from "@/lib/supabase/client";

export type CartLine = {
  variantId: string;
  productSlug: string;
  productName: string;
  size: string;
  priceCents: number;
  image: string | null;
  stock: number;
  active: boolean;
};

type VariantRow = {
  id: string;
  size: string;
  stock: number;
  active: boolean;
  products: {
    slug: string;
    name: string;
    price_cents: number;
    product_images: { path: string; position: number }[];
  } | null;
};

/** Revalidates the cart (SPEC §5.4): current price and stock for each saved variant. */
export async function fetchCartLines(variantIds: string[]): Promise<CartLine[]> {
  if (variantIds.length === 0) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("variants")
    .select(
      "id, size, stock, active, products(slug, name, price_cents, product_images(path, position))"
    )
    .in("id", variantIds)
    .returns<VariantRow[]>();

  if (error || !data) return [];

  return data
    .filter((row) => row.products)
    .map((row) => {
      const product = row.products!;
      const [cover] = [...product.product_images].sort(
        (a, b) => a.position - b.position
      );
      return {
        variantId: row.id,
        productSlug: product.slug,
        productName: product.name,
        size: row.size,
        priceCents: product.price_cents,
        image: cover ? imageUrl(cover.path) : null,
        stock: row.stock,
        active: row.active,
      };
    });
}

import { sortImages } from "@/lib/data/product-helpers";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product, ShopSort } from "@/lib/types";

const PRODUCT_SELECT = "*, categories(id, name, slug), variants(*), product_images(*)";

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getSettings(): Promise<Record<string, unknown>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
}

type ShopFilters = {
  categoria?: string;
  taglia?: string;
  ordina?: ShopSort;
};

export async function getShopProducts(
  filters: ShopFilters = {}
): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .eq("is_outlet", false)
    .is("archived_at", null);
  if (error) throw error;

  let products = (data as Product[]).map((p) => ({
    ...p,
    product_images: sortImages(p.product_images),
  }));

  if (filters.categoria) {
    products = products.filter((p) => p.categories?.slug === filters.categoria);
  }
  if (filters.taglia) {
    products = products.filter((p) =>
      p.variants.some(
        (v) => v.size === filters.taglia && v.active && v.stock > 0
      )
    );
  }

  switch (filters.ordina) {
    case "prezzo-asc":
      products.sort((a, b) => a.price_cents - b.price_cents);
      break;
    case "prezzo-desc":
      products.sort((a, b) => b.price_cents - a.price_cents);
      break;
    default:
      products.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }

  return products;
}

export async function getOutletProducts(filters: {
  collection?: string;
} = {}): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .eq("is_outlet", true)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;

  let products = (data as Product[]).map((p) => ({
    ...p,
    product_images: sortImages(p.product_images),
  }));

  if (filters.collection) {
    products = products.filter((p) => p.collection === filters.collection);
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, product_images: sortImages(data.product_images) } as Product;
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .eq("line", "lingerie")
    .eq("is_outlet", false)
    .is("archived_at", null)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Product[]).map((p) => ({
    ...p,
    product_images: sortImages(p.product_images),
  }));
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  type RelatedRow = { position: number; products: Product | null };

  const supabase = createClient();
  const { data: related, error: relatedError } = await supabase
    .from("related_products")
    .select("position, products:related_id(" + PRODUCT_SELECT + ")")
    .eq("product_id", product.id)
    .order("position", { ascending: true })
    .limit(limit)
    .returns<RelatedRow[]>();
  if (relatedError) throw relatedError;

  const fromTable = (related ?? [])
    .map((r) => r.products)
    .filter((p): p is Product => Boolean(p));
  if (fromTable.length > 0) {
    return fromTable.map((p) => ({
      ...p,
      product_images: sortImages(p.product_images),
    }));
  }

  if (!product.category_id) return [];
  const { data: sameCategory, error: sameCategoryError } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .is("archived_at", null)
    .limit(limit);
  if (sameCategoryError) throw sameCategoryError;
  return (sameCategory as Product[]).map((p) => ({
    ...p,
    product_images: sortImages(p.product_images),
  }));
}

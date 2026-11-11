import { compressForUpload } from "@/lib/image-compression";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/client";
import type { ProductImage } from "@/lib/types";

const MAX_SIZE = 15 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/heic", "image/webp"];

export async function createProduct(input: {
  name: string;
  line: "lingerie" | "day-to-day";
  categoryId: string | null;
  priceCents: number;
}): Promise<{ id: string }> {
  const supabase = createClient();
  const slug = slugify(input.name);
  if (!slug) throw new Error("Il nome è obbligatorio.");

  const { data, error } = await supabase
    .from("products")
    .insert({
      slug,
      name: input.name,
      line: input.line,
      category_id: input.categoryId,
      price_cents: input.priceCents,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export type ProductUpdateFields = {
  name?: string;
  description?: string | null;
  line?: "lingerie" | "day-to-day";
  category_id?: string | null;
  price_cents?: number;
  compare_at_cents?: number | null;
  materials?: string | null;
  care_tags?: string[];
  care_note?: string | null;
  is_outlet?: boolean;
  collection?: string | null;
  featured?: boolean;
  status?: "draft" | "published";
};

export async function updateProduct(
  id: string,
  fields: ProductUpdateFields
): Promise<void> {
  const supabase = createClient();

  if (
    fields.is_outlet &&
    (!fields.compare_at_cents ||
      (fields.price_cents !== undefined &&
        fields.compare_at_cents <= fields.price_cents))
  ) {
    throw new Error(
      "Per mettere il prodotto in Outlet serve un prezzo scontato più basso del prezzo pieno."
    );
  }

  if (fields.status === "published") {
    const { data: product } = await supabase
      .from("products")
      .select("name, price_cents, product_images(id)")
      .eq("id", id)
      .maybeSingle();
    if (!product || !product.name || !product.price_cents) {
      throw new Error("Nome e prezzo sono obbligatori per pubblicare.");
    }
    if (!product.product_images || product.product_images.length === 0) {
      throw new Error("Serve almeno una foto per pubblicare.");
    }
  }

  const { error } = await supabase.from("products").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteOrArchiveProduct(
  id: string
): Promise<{ archived: boolean }> {
  const supabase = createClient();

  const { data: variants } = await supabase
    .from("variants")
    .select("id")
    .eq("product_id", id);
  const variantIds = (variants ?? []).map((v) => v.id);

  let hasOrders = false;
  if (variantIds.length > 0) {
    const { count } = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .in("variant_id", variantIds);
    hasOrders = (count ?? 0) > 0;
  }

  if (hasOrders) {
    const { error } = await supabase
      .from("products")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { archived: true };
  }

  const { data: images } = await supabase
    .from("product_images")
    .select("path")
    .eq("product_id", id);

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (images && images.length > 0) {
    await supabase.storage.from("products").remove(images.map((i) => i.path));
  }

  return { archived: false };
}

export async function uploadProductImages(
  productSlug: string,
  productId: string,
  files: File[],
  startPosition: number
): Promise<ProductImage[]> {
  const supabase = createClient();
  const inserted: ProductImage[] = [];

  for (const [i, file] of files.entries()) {
    if (file.size > MAX_SIZE) {
      throw new Error(`${file.name}: supera i 15 MB.`);
    }
    if (!ACCEPTED.includes(file.type)) {
      throw new Error(`${file.name}: formato non supportato.`);
    }

    const compressed = await compressForUpload(file);
    const position = startPosition + i;
    const path = `${productSlug}/${Date.now()}-${position}.webp`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(path, compressed, { contentType: "image/webp", upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    const { data: row, error: insertError } = await supabase
      .from("product_images")
      .insert({ product_id: productId, path, alt: "", position })
      .select("*")
      .single();
    if (insertError) throw new Error(insertError.message);
    inserted.push(row);
  }

  return inserted;
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const supabase = createClient();
  const { data: image } = await supabase
    .from("product_images")
    .select("path")
    .eq("id", imageId)
    .maybeSingle();

  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw new Error(error.message);

  if (image) await supabase.storage.from("products").remove([image.path]);
}

export async function reorderProductImages(imageIds: string[]): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    imageIds.map((id, position) =>
      supabase.from("product_images").update({ position }).eq("id", id)
    )
  );
}

export type VariantInput = { size: string; stock: number; active: boolean };

/** Replaces all sizes for the product (the whole table is sent at once). */
export async function replaceVariants(
  productId: string,
  variants: VariantInput[]
): Promise<void> {
  if (variants.length === 0) throw new Error("Serve almeno una taglia.");
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("variants")
    .select("id, size")
    .eq("product_id", productId);
  const bySize = new Map((existing ?? []).map((v) => [v.size, v.id]));

  const upserts = variants.map((v) => ({
    id: bySize.get(v.size),
    product_id: productId,
    size: v.size,
    stock: v.stock,
    active: v.active,
  }));

  const { error } = await supabase
    .from("variants")
    .upsert(upserts, { onConflict: "product_id,size" });
  if (error) throw new Error(error.message);

  const keepSizes = new Set(variants.map((v) => v.size));
  const toRemove = (existing ?? [])
    .filter((v) => !keepSizes.has(v.size))
    .map((v) => v.id);
  if (toRemove.length > 0) {
    await supabase.from("variants").delete().in("id", toRemove);
  }
}

export async function setRelatedProducts(
  productId: string,
  relatedIds: string[]
): Promise<void> {
  const supabase = createClient();
  await supabase.from("related_products").delete().eq("product_id", productId);

  const rows = relatedIds
    .slice(0, 4)
    .map((relatedId, position) => ({
      product_id: productId,
      related_id: relatedId,
      position,
    }));
  if (rows.length > 0) {
    const { error } = await supabase.from("related_products").insert(rows);
    if (error) throw new Error(error.message);
  }
}

export async function createCategory(
  name: string,
  line: "lingerie" | "day-to-day"
) {
  const supabase = createClient();
  const slug = slugify(name);
  if (!slug) throw new Error("Il nome è obbligatorio.");

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, slug, line, position: 99 })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function markOrderPaid(orderId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("id", orderId)
    .eq("status", "pending_payment")
    .in("payment_method", ["bonifico", "whatsapp"]);
  if (error) throw new Error(error.message);
}

export async function markOrderShipped(
  orderId: string,
  trackingCode: string
): Promise<void> {
  if (!trackingCode.trim()) {
    throw new Error("Il numero di tracking è obbligatorio.");
  }
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: "shipped", tracking_code: trackingCode.trim() })
    .eq("id", orderId)
    .eq("status", "paid");
  if (error) throw new Error(error.message);
}

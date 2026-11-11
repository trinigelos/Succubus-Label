import { sortImages } from "@/lib/data/product-helpers";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

const PRODUCT_SELECT = "*, categories(id, name, slug), variants(*), product_images(*)";

export type AdminProductFilter = "tutti" | "pubblicati" | "bozze" | "esauriti";

export async function getAdminProducts(
  filter: AdminProductFilter = "tutti",
  search = ""
): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (filter === "pubblicati") query = query.eq("status", "published");
  if (filter === "bozze") query = query.eq("status", "draft");
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;

  let products = (data as Product[]).map((p) => ({
    ...p,
    product_images: sortImages(p.product_images),
  }));

  if (filter === "esauriti") {
    products = products.filter(
      (p) => p.variants.reduce((n, v) => n + (v.active ? v.stock : 0), 0) === 0
    );
  }

  return products;
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, product_images: sortImages(data.product_images) } as Product;
}

export async function getRelatedProductIds(productId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("related_products")
    .select("related_id")
    .eq("product_id", productId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => r.related_id);
}

export async function getAdminCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAdminDashboard() {
  const supabase = createClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ count: toShip }, { data: variants }, { data: salesOrders }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "paid"),
      supabase.from("variants").select("stock, active"),
      supabase
        .from("orders")
        .select("total_cents")
        .in("status", ["paid", "shipped"])
        .gte("created_at", startOfMonth.toISOString()),
    ]);

  const outOfStockVariants = (variants ?? []).filter(
    (v) => v.active && v.stock === 0
  ).length;
  const salesThisMonthCents = (salesOrders ?? []).reduce(
    (sum, o) => sum + o.total_cents,
    0
  );

  return {
    toShip: toShip ?? 0,
    outOfStockVariants,
    salesThisMonthCents,
  };
}

export type AdminOrderFilter = "tutti" | "da-pagare" | "da-spedire" | "spediti";

export type AdminOrder = {
  id: string;
  number: number;
  email: string;
  phone: string | null;
  shipping_address: {
    fullName: string;
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    state?: string;
  };
  shipping_method: string;
  payment_method: "paypal" | "bonifico" | "whatsapp";
  status: string;
  discreet_packaging: boolean;
  total_cents: number;
  tracking_code: string | null;
  created_at: string;
  order_items: {
    name_snapshot: string;
    size_snapshot: string;
    qty: number;
    unit_price_cents: number;
  }[];
};

export async function getAdminOrders(
  filter: AdminOrderFilter = "tutti"
): Promise<AdminOrder[]> {
  const supabase = createClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (filter === "da-pagare") {
    query = query
      .eq("status", "pending_payment")
      .in("payment_method", ["bonifico", "whatsapp"]);
  }
  if (filter === "da-spedire") query = query.eq("status", "paid");
  if (filter === "spediti") query = query.eq("status", "shipped");
  if (filter === "tutti") {
    query = query.in("status", [
      "pending_payment",
      "paid",
      "shipped",
      "cancelled",
      "refunded",
    ]);
  }

  const { data, error } = await query.returns<AdminOrder[]>();
  if (error) throw error;
  return data;
}

export async function getOrdersBadgeCount() {
  const supabase = createClient();
  const [{ count: daPagare }, { count: daSpedire }] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_payment")
      .in("payment_method", ["bonifico", "whatsapp"]),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid"),
  ]);
  return (daPagare ?? 0) + (daSpedire ?? 0);
}

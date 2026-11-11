import { imageUrl } from "@/lib/data/product-helpers";
import { createClient } from "@/lib/supabase/client";

export type ConfirmationOrder = {
  number: number;
  email: string;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    state?: string;
    countryCode: string;
  };
  shippingMethod: string;
  paymentMethod: "paypal" | "bonifico" | "whatsapp";
  status: string;
  discreetPackaging: boolean;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  trackingCode: string | null;
  items: {
    name: string;
    size: string;
    qty: number;
    unitPriceCents: number;
    image: string | null;
  }[];
};

type ConfirmationRpcResult = {
  number: number;
  email: string;
  phone: string | null;
  shipping_address: ConfirmationOrder["shippingAddress"];
  shipping_method: string;
  payment_method: "paypal" | "bonifico" | "whatsapp";
  status: string;
  discreet_packaging: boolean;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  tracking_code: string | null;
  items: {
    name: string;
    size: string;
    qty: number;
    unit_price_cents: number;
    image_path: string | null;
  }[];
};

/** Calls get_order_confirmation(): returns the order only if the token matches. */
export async function getOrderForConfirmation(
  number: number,
  token: string
): Promise<ConfirmationOrder | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_order_confirmation", {
    p_number: number,
    p_token: token,
  });
  if (error || !data) return null;

  const result = data as ConfirmationRpcResult;
  return {
    number: result.number,
    email: result.email,
    shippingAddress: result.shipping_address,
    shippingMethod: result.shipping_method,
    paymentMethod: result.payment_method,
    status: result.status,
    discreetPackaging: result.discreet_packaging,
    subtotalCents: result.subtotal_cents,
    shippingCents: result.shipping_cents,
    totalCents: result.total_cents,
    trackingCode: result.tracking_code,
    items: (result.items ?? []).map((item) => ({
      name: item.name,
      size: item.size,
      qty: item.qty,
      unitPriceCents: item.unit_price_cents,
      image: item.image_path ? imageUrl(item.image_path) : null,
    })),
  };
}

import {
  CheckoutError,
  type CheckoutInput,
} from "@/lib/checkout-validation";
import { createClient } from "@/lib/supabase/client";

export { CheckoutError, validateCheckoutInput } from "@/lib/checkout-validation";
export type { CheckoutInput, ShippingAddressInput } from "@/lib/checkout-validation";

export type ReservationResult = {
  order_id: string;
  number: number;
  token: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  reserved_until: string;
};

/**
 * Validates, recomputes prices and reserves stock in one transaction
 * (SPEC §6). reserve_order() is SECURITY DEFINER — its own logic is the
 * real protection, so it's safe to call directly from the browser.
 */
export async function reserveOrder(
  input: CheckoutInput
): Promise<ReservationResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("reserve_order", {
    p_email: input.email,
    p_phone: input.phone ?? null,
    p_shipping_address: input.shippingAddress,
    p_shipping_method: input.shippingMethod,
    p_payment_method: input.paymentMethod,
    p_discreet_packaging: input.discreetPackaging,
    p_items: input.items.map((i) => ({ variant_id: i.variantId, qty: i.qty })),
  });

  if (error) {
    if (error.message.includes("OUT_OF_STOCK")) {
      throw new CheckoutError("Taglia non più disponibile.", 409);
    }
    if (error.message.includes("EMPTY_CART")) {
      throw new CheckoutError("Il carrello è vuoto.");
    }
    if (error.message.includes("HAND_DELIVERY_NOT_AVAILABLE")) {
      throw new CheckoutError(
        "La consegna a mano non è disponibile per questo CAP."
      );
    }
    throw new CheckoutError("Impossibile creare l'ordine.", 500);
  }

  return data as ReservationResult;
}

export type ShippingMethod = "express_it" | "express_eu" | "hand_re";
export type ShippingRates = Record<ShippingMethod, number>;

export type OrderTotals = {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};

/**
 * Mirrors the shipping logic in supabase/migrations: free shipping once the
 * subtotal reaches the configured threshold, otherwise the selected
 * method's rate. Used for the checkout preview; the server always
 * recomputes this itself before charging (SPEC §6).
 */
export function computeOrderTotals(params: {
  subtotalCents: number;
  shippingMethod: ShippingMethod;
  shippingRates: ShippingRates;
  freeShippingThresholdCents: number | null;
}): OrderTotals {
  const { subtotalCents, shippingMethod, shippingRates, freeShippingThresholdCents } = params;

  const qualifiesForFreeShipping =
    shippingMethod !== "hand_re" &&
    freeShippingThresholdCents !== null &&
    subtotalCents >= freeShippingThresholdCents;

  const shippingCents = qualifiesForFreeShipping
    ? 0
    : (shippingRates[shippingMethod] ?? 0);

  return {
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}

export function cartSubtotalCents(lines: { priceCents: number; qty: number }[]) {
  return lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
}

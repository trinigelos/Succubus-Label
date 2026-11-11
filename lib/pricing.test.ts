import { describe, expect, it } from "vitest";
import { cartSubtotalCents, computeOrderTotals } from "./pricing";

const RATES = { express_it: 500, express_eu: 1200, hand_re: 0 };

describe("computeOrderTotals", () => {
  it("adds the selected shipping rate to the subtotal", () => {
    const result = computeOrderTotals({
      subtotalCents: 4200,
      shippingMethod: "express_it",
      shippingRates: RATES,
      freeShippingThresholdCents: null,
    });
    expect(result).toEqual({
      subtotalCents: 4200,
      shippingCents: 500,
      totalCents: 4700,
    });
  });

  it("picks the rate for the chosen method", () => {
    const result = computeOrderTotals({
      subtotalCents: 1000,
      shippingMethod: "express_eu",
      shippingRates: RATES,
      freeShippingThresholdCents: null,
    });
    expect(result.shippingCents).toBe(1200);
  });

  it("waives shipping once the subtotal reaches the free threshold", () => {
    const result = computeOrderTotals({
      subtotalCents: 8000,
      shippingMethod: "express_it",
      shippingRates: RATES,
      freeShippingThresholdCents: 8000,
    });
    expect(result.shippingCents).toBe(0);
    expect(result.totalCents).toBe(8000);
  });

  it("still charges shipping just below the threshold", () => {
    const result = computeOrderTotals({
      subtotalCents: 7999,
      shippingMethod: "express_it",
      shippingRates: RATES,
      freeShippingThresholdCents: 8000,
    });
    expect(result.shippingCents).toBe(500);
  });

  it("ignores the threshold when it is not configured", () => {
    const result = computeOrderTotals({
      subtotalCents: 1_000_000,
      shippingMethod: "express_it",
      shippingRates: RATES,
      freeShippingThresholdCents: null,
    });
    expect(result.shippingCents).toBe(500);
  });

  it("hand delivery is always free, even without reaching the threshold", () => {
    const result = computeOrderTotals({
      subtotalCents: 1000,
      shippingMethod: "hand_re",
      shippingRates: RATES,
      freeShippingThresholdCents: null,
    });
    expect(result.shippingCents).toBe(0);
  });
});

describe("cartSubtotalCents", () => {
  it("sums unit price times quantity across lines", () => {
    const total = cartSubtotalCents([
      { priceCents: 4200, qty: 1 },
      { priceCents: 3800, qty: 2 },
    ]);
    expect(total).toBe(4200 + 3800 * 2);
  });

  it("returns 0 for an empty cart", () => {
    expect(cartSubtotalCents([])).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { cartSubtotalCents, computeOrderTotals } from "./pricing";

const RATES = { standard: 500, express: 900, europe: 1200 };

describe("computeOrderTotals", () => {
  it("adds the selected shipping rate to the subtotal", () => {
    const result = computeOrderTotals({
      subtotalCents: 4200,
      shippingMethod: "standard",
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
      shippingMethod: "europe",
      shippingRates: RATES,
      freeShippingThresholdCents: null,
    });
    expect(result.shippingCents).toBe(1200);
  });

  it("waives shipping once the subtotal reaches the free threshold", () => {
    const result = computeOrderTotals({
      subtotalCents: 8000,
      shippingMethod: "express",
      shippingRates: RATES,
      freeShippingThresholdCents: 8000,
    });
    expect(result.shippingCents).toBe(0);
    expect(result.totalCents).toBe(8000);
  });

  it("still charges shipping just below the threshold", () => {
    const result = computeOrderTotals({
      subtotalCents: 7999,
      shippingMethod: "standard",
      shippingRates: RATES,
      freeShippingThresholdCents: 8000,
    });
    expect(result.shippingCents).toBe(500);
  });

  it("ignores the threshold when it is not configured", () => {
    const result = computeOrderTotals({
      subtotalCents: 1_000_000,
      shippingMethod: "standard",
      shippingRates: RATES,
      freeShippingThresholdCents: null,
    });
    expect(result.shippingCents).toBe(500);
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

import { describe, expect, it } from "vitest";
import { CheckoutError, validateCheckoutInput } from "./checkout-validation";

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    email: "cliente@example.com",
    shippingAddress: {
      fullName: "Maria Rossi",
      line1: "Via Roma 1",
      postalCode: "20100",
      city: "Milano",
      countryCode: "IT",
    },
    shippingMethod: "express_it",
    paymentMethod: "paypal",
    discreetPackaging: true,
    items: [{ variantId: "v1", qty: 1 }],
    acceptedTerms: true,
    ...overrides,
  };
}

describe("validateCheckoutInput", () => {
  it("accepts a well-formed checkout", () => {
    expect(validateCheckoutInput(validBody())).toMatchObject({
      email: "cliente@example.com",
      paymentMethod: "paypal",
    });
  });

  it("rejects a missing body", () => {
    expect(() => validateCheckoutInput(null)).toThrow(CheckoutError);
  });

  it("rejects an invalid email", () => {
    expect(() => validateCheckoutInput(validBody({ email: "not-an-email" }))).toThrow(
      "Email non valida."
    );
  });

  it("rejects an incomplete shipping address", () => {
    expect(() =>
      validateCheckoutInput(validBody({ shippingAddress: { fullName: "Maria" } }))
    ).toThrow("Indirizzo di spedizione incompleto.");
  });

  it("rejects an unknown shipping method", () => {
    expect(() =>
      validateCheckoutInput(validBody({ shippingMethod: "moon" }))
    ).toThrow("Metodo di spedizione non valido.");
  });

  it("rejects an unknown payment method", () => {
    expect(() =>
      validateCheckoutInput(validBody({ paymentMethod: "cash" }))
    ).toThrow("Metodo di pagamento non valido.");
  });

  it("rejects an empty cart", () => {
    expect(() => validateCheckoutInput(validBody({ items: [] }))).toThrow(
      "Il carrello è vuoto."
    );
  });

  it("rejects unaccepted terms", () => {
    expect(() =>
      validateCheckoutInput(validBody({ acceptedTerms: false }))
    ).toThrow("Devi accettare i termini e la privacy.");
  });

  it("carries the HTTP status on the thrown error", () => {
    try {
      validateCheckoutInput(validBody({ items: [] }));
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(CheckoutError);
      expect((error as CheckoutError).status).toBe(400);
    }
  });
});

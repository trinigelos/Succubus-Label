export type ShippingAddressInput = {
  fullName: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  state?: string;
  countryCode: string;
};

export type CheckoutInput = {
  email: string;
  phone?: string;
  shippingAddress: ShippingAddressInput;
  shippingMethod: "express_it" | "express_eu" | "hand_re";
  paymentMethod: "paypal" | "bonifico" | "whatsapp";
  discreetPackaging: boolean;
  items: { variantId: string; qty: number }[];
  acceptedTerms: boolean;
};

export class CheckoutError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function validateCheckoutInput(body: unknown): CheckoutInput {
  const input = body as Partial<CheckoutInput> | null;
  if (!input || typeof input !== "object") {
    throw new CheckoutError("Richiesta non valida.");
  }
  if (!input.email || !input.email.includes("@")) {
    throw new CheckoutError("Email non valida.");
  }
  if (!input.shippingAddress?.line1 || !input.shippingAddress?.postalCode) {
    throw new CheckoutError("Indirizzo di spedizione incompleto.");
  }
  if (!["express_it", "express_eu", "hand_re"].includes(input.shippingMethod ?? "")) {
    throw new CheckoutError("Metodo di spedizione non valido.");
  }
  if (!["paypal", "bonifico", "whatsapp"].includes(input.paymentMethod ?? "")) {
    throw new CheckoutError("Metodo di pagamento non valido.");
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new CheckoutError("Il carrello è vuoto.");
  }
  if (!input.acceptedTerms) {
    throw new CheckoutError("Devi accettare i termini e la privacy.");
  }
  return input as CheckoutInput;
}

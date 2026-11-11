import { afterEach, describe, expect, it, vi } from "vitest";
import type { Product, ProductImage, Variant } from "@/lib/types";
import { imageUrl, productCover, productLabel, totalStock } from "./product-helpers";

function makeVariant(overrides: Partial<Variant> = {}): Variant {
  return {
    id: "v1",
    product_id: "p1",
    size: "M",
    stock: 5,
    active: true,
    ...overrides,
  };
}

function makeImage(overrides: Partial<ProductImage> = {}): ProductImage {
  return {
    id: "i1",
    product_id: "p1",
    path: "set-harness/0-800.webp",
    alt: "",
    position: 0,
    ...overrides,
  };
}

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    slug: "set-harness",
    name: "Set harness",
    description: null,
    line: "lingerie",
    category_id: null,
    price_cents: 6800,
    compare_at_cents: null,
    materials: null,
    care: null,
    featured: false,
    status: "published",
    created_at: new Date().toISOString(),
    categories: null,
    variants: [],
    product_images: [],
    ...overrides,
  };
}

describe("totalStock", () => {
  it("sums stock across active variants", () => {
    const product = makeProduct({
      variants: [makeVariant({ size: "S", stock: 2 }), makeVariant({ size: "M", stock: 3 })],
    });
    expect(totalStock(product)).toBe(5);
  });

  it("ignores inactive variants", () => {
    const product = makeProduct({
      variants: [
        makeVariant({ size: "S", stock: 2, active: false }),
        makeVariant({ size: "M", stock: 3 }),
      ],
    });
    expect(totalStock(product)).toBe(3);
  });

  it("returns 0 when there are no variants", () => {
    expect(totalStock(makeProduct({ variants: [] }))).toBe(0);
  });
});

describe("productLabel", () => {
  it("is 'esaurito' when total stock is 0", () => {
    const product = makeProduct({ variants: [makeVariant({ stock: 0 })] });
    expect(productLabel(product)).toBe("esaurito");
  });

  it("is 'ultimi-pezzi' when total stock is 3 or fewer", () => {
    const product = makeProduct({ variants: [makeVariant({ stock: 3 })] });
    expect(productLabel(product)).toBe("ultimi-pezzi");
  });

  it("is 'nuovo' for recently published products with healthy stock", () => {
    const product = makeProduct({
      created_at: new Date().toISOString(),
      variants: [makeVariant({ stock: 10 })],
    });
    expect(productLabel(product)).toBe("nuovo");
  });

  it("is null once the product is older than 30 days with healthy stock", () => {
    const fortyDaysAgo = new Date(Date.now() - 40 * 86_400_000).toISOString();
    const product = makeProduct({
      created_at: fortyDaysAgo,
      variants: [makeVariant({ stock: 10 })],
    });
    expect(productLabel(product)).toBeNull();
  });

  it("prioritizes 'esaurito' over 'nuovo'", () => {
    const product = makeProduct({
      created_at: new Date().toISOString(),
      variants: [makeVariant({ stock: 0 })],
    });
    expect(productLabel(product)).toBe("esaurito");
  });
});

describe("productCover", () => {
  it("returns the image at the lowest position", () => {
    const product = makeProduct({
      product_images: [makeImage({ id: "a", position: 2 }), makeImage({ id: "b", position: 0 })],
    });
    expect(productCover(product)?.id).toBe("b");
  });

  it("returns null when there are no images", () => {
    expect(productCover(makeProduct({ product_images: [] }))).toBeNull();
  });
});

describe("imageUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds the public Storage URL from the base env var", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    expect(imageUrl("set-harness/0-800.webp")).toBe(
      "https://example.supabase.co/storage/v1/object/public/products/set-harness/0-800.webp"
    );
  });

  it("returns an empty string when Supabase is not configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(imageUrl("set-harness/0-800.webp")).toBe("");
  });
});

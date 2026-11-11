export type Category = {
  id: string;
  name: string;
  slug: string;
  line: "lingerie" | "day-to-day";
  position: number;
};

export type Variant = {
  id: string;
  product_id: string;
  size: string;
  stock: number;
  active: boolean;
};

export type ProductImage = {
  id: string;
  product_id: string;
  path: string;
  alt: string;
  position: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  line: "lingerie" | "day-to-day";
  category_id: string | null;
  price_cents: number;
  compare_at_cents: number | null;
  materials: string | null;
  care_tags: string[];
  care_note: string | null;
  is_outlet: boolean;
  collection: string | null;
  featured: boolean;
  status: "draft" | "published";
  created_at: string;
  categories: Pick<Category, "id" | "name" | "slug"> | null;
  variants: Variant[];
  product_images: ProductImage[];
};

export type ProductLabel = "nuovo" | "ultimi-pezzi" | "esaurito" | null;

export type ShopSort = "novita" | "prezzo-asc" | "prezzo-desc";

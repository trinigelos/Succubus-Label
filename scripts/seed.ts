/**
 * Datos de ejemplo con las fotos de docs/img/ (CLAUDE.md, paso 2).
 * Nombres, tallas y categorías tomados de docs/design/Shop.dc.html.
 * Precios y stock son de ejemplo: sustituirlos desde el panel /admin.
 *
 * Uso: npm run db:seed (requiere NEXT_PUBLIC_SUPABASE_URL y
 * SUPABASE_SERVICE_ROLE_KEY en .env.local, y las migraciones ya aplicadas).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { extname, join } from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const IMG_DIR = join(process.cwd(), "docs/img");

type Category = { name: string; slug: string; line: "lingerie" | "day-to-day" };

const categories: Category[] = [
  { name: "Set", slug: "set", line: "lingerie" },
  { name: "Harness", slug: "harness", line: "lingerie" },
  { name: "Body", slug: "body", line: "lingerie" },
  { name: "Accessori", slug: "accessori", line: "lingerie" },
];

type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  priceCents: number;
  compareAtCents?: number;
  materials: string;
  careTags: string[];
  careNote?: string;
  featured?: boolean;
  isOutlet?: boolean;
  collection?: string;
  images: { file: string; alt: string }[];
  variants: { size: string; stock: number }[];
};

const HANDWASH_COLD = ["Lavaggio a mano", "Acqua fredda (max 30°)", "Non candeggiare"];

const products: SeedProduct[] = [
  {
    slug: "set-harness",
    name: "Set harness",
    description: "Set harness nero, cinturini regolabili.",
    categorySlug: "harness",
    priceCents: 6800,
    materials: "Elastam e metallo nichel-free.",
    careTags: HANDWASH_COLD,
    featured: true,
    images: [{ file: "harness.jpg", alt: "Set harness nero" }],
    variants: [
      { size: "XS", stock: 4 },
      { size: "S", stock: 6 },
      { size: "M", stock: 6 },
      { size: "L", stock: 3 },
    ],
  },
  {
    slug: "body-in-tulle",
    name: "Body in tulle",
    description: "Body in tulle nero a maniche lunghe.",
    categorySlug: "body",
    priceCents: 5400,
    materials: "Tulle e pizzo elasticizzato.",
    careTags: HANDWASH_COLD,
    featured: true,
    images: [{ file: "body.jpg", alt: "Body in tulle nero a maniche lunghe" }],
    variants: [
      { size: "S", stock: 5 },
      { size: "M", stock: 5 },
      { size: "L", stock: 4 },
    ],
  },
  {
    slug: "reggiseno-in-rete",
    name: "Reggiseno in rete",
    description: "Reggiseno in rete nera, chiusura regolabile.",
    categorySlug: "set",
    priceCents: 4200,
    materials: "Rete elasticizzata.",
    careTags: HANDWASH_COLD,
    images: [{ file: "treccia.jpg", alt: "Reggiseno in rete nera" }],
    // stock total 2 → aparece como "Ultimi pezzi" (≤ 3)
    variants: [
      { size: "S", stock: 1 },
      { size: "M", stock: 1 },
    ],
  },
  {
    slug: "collare-con-guinzaglio",
    name: "Collare con guinzaglio",
    description: "Collare in pelle nera con guinzaglio removibile.",
    categorySlug: "accessori",
    priceCents: 3800,
    materials: "Pelle sintetica e metallo nichel-free.",
    careTags: [],
    careNote: "Pulire con panno umido.",
    images: [
      { file: "collare.jpg", alt: "Collare in pelle nera con guinzaglio" },
    ],
    variants: [{ size: "Unica", stock: 8 }],
  },
  {
    slug: "set-in-rete-con-reggicalze",
    name: "Set in rete con reggicalze",
    description: "Set in rete nera con collare e reggicalze, luce viola.",
    categorySlug: "set",
    priceCents: 7200,
    materials: "Rete elasticizzata e pizzo.",
    careTags: HANDWASH_COLD,
    featured: true,
    images: [
      { file: "graffiti.jpg", alt: "Set in rete nera con collare, luce viola" },
    ],
    variants: [
      { size: "XS", stock: 4 },
      { size: "S", stock: 5 },
      { size: "M", stock: 5 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 3 },
    ],
  },
  {
    slug: "bralette-con-lacci",
    name: "Bralette con lacci",
    description: "Bralette nera con lacci, reggiseno nero al tramonto.",
    categorySlug: "set",
    priceCents: 3600,
    materials: "Cotone elasticizzato.",
    careTags: HANDWASH_COLD,
    featured: true,
    images: [{ file: "tramonto.jpg", alt: "Reggiseno nero al tramonto" }],
    variants: [
      { size: "S", stock: 6 },
      { size: "M", stock: 6 },
      { size: "L", stock: 5 },
    ],
  },
  {
    slug: "set-con-polsini",
    name: "Set con polsini",
    description: "Set con polsini, lingerie nera in una casa abbandonata.",
    categorySlug: "set",
    priceCents: 5800,
    materials: "Pizzo e rete elasticizzata.",
    careTags: HANDWASH_COLD,
    images: [
      { file: "casa.jpg", alt: "Lingerie nera in una casa abbandonata" },
    ],
    // stock total 0 → aparece como "Esaurito"
    variants: [{ size: "Unica", stock: 0 }],
  },
  {
    slug: "polsini-in-pelle",
    name: "Polsini in pelle",
    description: "Polsini in pelle nera.",
    categorySlug: "accessori",
    priceCents: 2400,
    materials: "Pelle sintetica e metallo nichel-free.",
    careTags: [],
    careNote: "Pulire con panno umido.",
    images: [{ file: "polsino.jpg", alt: "Polsino in pelle nera" }],
    variants: [{ size: "Unica", stock: 10 }],
  },
  {
    slug: "body-collezione-precedente",
    name: "Body in rete (collezione precedente)",
    description: "Body in rete nera, dalla collezione passata.",
    categorySlug: "body",
    priceCents: 3900,
    compareAtCents: 5800,
    materials: "Rete elasticizzata.",
    careTags: HANDWASH_COLD,
    isOutlet: true,
    collection: "Collezione inverno 2025",
    images: [{ file: "ciliegie.jpg", alt: "Body in rete nera" }],
    variants: [
      { size: "S", stock: 2 },
      { size: "M", stock: 3 },
    ],
  },
];

const settings: { key: string; value: unknown }[] = [
  { key: "free_shipping_threshold_cents", value: 8000 },
  {
    key: "shipping_prices",
    value: { express_it: 500, express_eu: 1200, hand_re: 0 },
  },
  { key: "hand_delivery_caps", value: ["42121", "42122", "42123", "42124"] },
  { key: "bank_transfer_reserve_days", value: 3 },
  { key: "upsell_product_ids", value: [] },
];

function contentTypeFor(file: string) {
  const ext = extname(file).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function main() {
  console.log(`Categorie…`);
  const { data: upsertedCategories, error: categoriesError } = await supabase
    .from("categories")
    .upsert(categories, { onConflict: "slug" })
    .select("id, slug");
  if (categoriesError) throw categoriesError;

  const categoryIdBySlug = new Map(
    upsertedCategories!.map((c) => [c.slug, c.id as string])
  );

  for (const product of products) {
    console.log(`Prodotto: ${product.name}`);
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Categoria sconosciuta: ${product.categorySlug}`);
    }

    const { data: upsertedProduct, error: productError } = await supabase
      .from("products")
      .upsert(
        {
          slug: product.slug,
          name: product.name,
          description: product.description,
          line: "lingerie",
          category_id: categoryId,
          price_cents: product.priceCents,
          compare_at_cents: product.compareAtCents ?? null,
          materials: product.materials,
          care_tags: product.careTags,
          care_note: product.careNote ?? null,
          featured: product.featured ?? false,
          is_outlet: product.isOutlet ?? false,
          collection: product.collection ?? null,
          status: "published",
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();
    if (productError) throw productError;
    const productId = upsertedProduct.id as string;

    await supabase.from("variants").delete().eq("product_id", productId);
    const { error: variantsError } = await supabase.from("variants").insert(
      product.variants.map((v) => ({
        product_id: productId,
        size: v.size,
        stock: v.stock,
        active: true,
      }))
    );
    if (variantsError) throw variantsError;

    await supabase.from("product_images").delete().eq("product_id", productId);
    const imageRows = [];
    for (const [index, image] of product.images.entries()) {
      const localPath = join(IMG_DIR, image.file);
      const fileBuffer = readFileSync(localPath);
      const storagePath = `${product.slug}/${index}-${image.file}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(storagePath, fileBuffer, {
          contentType: contentTypeFor(image.file),
          upsert: true,
        });
      if (uploadError) throw uploadError;

      imageRows.push({
        product_id: productId,
        path: storagePath,
        alt: image.alt,
        position: index,
      });
    }
    const { error: imagesError } = await supabase
      .from("product_images")
      .insert(imageRows);
    if (imagesError) throw imagesError;
  }

  console.log(`Impostazioni…`);
  const { error: settingsError } = await supabase
    .from("settings")
    .upsert(settings, { onConflict: "key" });
  if (settingsError) throw settingsError;

  console.log("Fatto.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

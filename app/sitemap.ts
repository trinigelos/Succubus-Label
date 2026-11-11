import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const STATIC_PATHS = [
  "",
  "/shop",
  "/carrello",
  "/guida-taglie",
  "/spedizioni-resi",
  "/privacy",
  "/termini",
  "/cookie",
];

// Static export, no server: product pages live at /prodotto?slug=... and
// can't be listed here without rebuilding on every catalog change, so the
// sitemap only covers the fixed pages.
export default function sitemap(): MetadataRoute.Sitemap {
  const shopUrl = process.env.SHOP_URL ?? "http://localhost:3000";
  return STATIC_PATHS.map((path) => ({
    url: `${shopUrl}${path}`,
    lastModified: new Date(),
  }));
}

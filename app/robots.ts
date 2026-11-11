import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const shopUrl = process.env.SHOP_URL ?? "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/checkout", "/ordine"],
    },
    sitemap: `${shopUrl}/sitemap.xml`,
  };
}

import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Succubus Label",
  description: "The black label of lingerie — Intimates & noir aesthetics.",
  url: process.env.SHOP_URL ?? "http://localhost:3000",
  logo: `${process.env.SHOP_URL ?? "http://localhost:3000"}/img/casa.jpg`,
  sameAs: ["https://www.instagram.com/succubus.label_17.10/"],
};

export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Header />
      {children}
      <Footer />
      <CartDrawer />
    </>
  );
}

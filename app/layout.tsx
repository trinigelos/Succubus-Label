import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart/CartContext";
import { withBasePath } from "@/lib/base-path";
import { fontBody, fontDisplay, fontImpact } from "./fonts";
import "./globals.css";

const shopUrl = process.env.SHOP_URL ?? "http://localhost:3000";
const title = "Succubus Label — The black label of lingerie";
const description = "Intimates & noir aesthetics. Ogni pezzo è nero, sempre.";

export const metadata: Metadata = {
  metadataBase: new URL(shopUrl),
  title: { default: title, template: "%s · Succubus Label" },
  description,
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Succubus Label",
    title,
    description,
    images: [withBasePath("/img/casa.jpg")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="it"
      className={`${fontDisplay.variable} ${fontImpact.variable} ${fontBody.variable}`}
    >
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

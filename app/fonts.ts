import { Archivo, Inter_Tight, Playfair_Display } from "next/font/google";

export const fontDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const fontImpact = Archivo({
  variable: "--font-impact",
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

export const fontBody = Inter_Tight({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

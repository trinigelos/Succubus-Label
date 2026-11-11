import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopPageContent } from "./ShopPageContent";

export const metadata: Metadata = {
  title: "Lingerie",
  description: "The black label of lingerie — tutta la collezione.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageContent />
    </Suspense>
  );
}

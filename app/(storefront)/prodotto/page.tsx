import { Suspense } from "react";
import { ProductPageContent } from "./ProductPageContent";

export default function ProductPage() {
  return (
    <Suspense fallback={null}>
      <ProductPageContent />
    </Suspense>
  );
}

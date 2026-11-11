import { Suspense } from "react";
import { AdminProductsContent } from "./AdminProductsContent";

export default function AdminProductsPage() {
  return (
    <Suspense fallback={null}>
      <AdminProductsContent />
    </Suspense>
  );
}

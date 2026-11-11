import { Suspense } from "react";
import { EditProductContent } from "./EditProductContent";

export default function EditProductPage() {
  return (
    <Suspense fallback={null}>
      <EditProductContent />
    </Suspense>
  );
}

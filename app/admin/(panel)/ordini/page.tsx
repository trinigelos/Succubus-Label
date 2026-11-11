import { Suspense } from "react";
import { AdminOrdersContent } from "./AdminOrdersContent";

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersContent />
    </Suspense>
  );
}

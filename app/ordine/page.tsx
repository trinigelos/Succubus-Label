import { Suspense } from "react";
import { OrderConfirmationContent } from "./OrderConfirmationContent";

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

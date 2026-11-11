"use client";

import { useCart } from "@/lib/cart/CartContext";

export function CartTrigger() {
  const { count, openDrawer } = useCart();

  return (
    <button type="button" onClick={openDrawer}>
      Carrello ({count})
    </button>
  );
}

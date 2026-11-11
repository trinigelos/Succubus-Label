"use client";

import { fetchCartLines, type CartLine } from "@/lib/cart/queries";
import { getSettings } from "@/lib/data/products";
import { cartSubtotalCents } from "@/lib/pricing";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CartItem = { variantId: string; qty: number };

type CartContextValue = {
  lines: (CartLine & { qty: number })[];
  count: number;
  subtotalCents: number;
  isDrawerOpen: boolean;
  discreetPackaging: boolean;
  freeShippingThresholdCents: number | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (variantId: string, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  setDiscreetPackaging: (value: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "succubus-cart";
const DISCREET_KEY = "succubus-cart-discreet";

function readStoredItems(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStoredDiscreet(): boolean {
  try {
    const raw = window.localStorage.getItem(DISCREET_KEY);
    return raw === null ? true : raw === "true";
  } catch {
    return true;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredItems());
  const [lines, setLines] = useState<(CartLine & { qty: number })[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [discreetPackaging, setDiscreetPackagingState] = useState(() =>
    readStoredDiscreet()
  );
  const [freeShippingThresholdCents, setFreeShippingThresholdCents] = useState<
    number | null
  >(null);

  useEffect(() => {
    getSettings()
      .then((settings) => {
        const value = settings["free_shipping_threshold_cents"];
        setFreeShippingThresholdCents(typeof value === "number" ? value : null);
      })
      .catch(() => {
        // Supabase not configured yet: the shop keeps running without the bar
      });
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage no disponible: el carrito solo vive en memoria
    }
  }, [items]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DISCREET_KEY, String(discreetPackaging));
    } catch {
      // localStorage no disponible
    }
  }, [discreetPackaging]);

  // Revalidates the cart (SPEC §5.4): current price and stock for each
  // variant saved in localStorage, queried directly from the browser.
  useEffect(() => {
    let cancelled = false;
    fetchCartLines(items.map((i) => i.variantId))
      .then((fetchedLines) => {
        if (cancelled) return;
        const next = fetchedLines
          .map((line) => {
            const item = items.find((i) => i.variantId === line.variantId);
            return { ...line, qty: Math.min(item?.qty ?? 0, line.stock) };
          })
          .filter((line) => line.qty > 0 && line.active);
        setLines(next);
      })
      .catch(() => {
        if (!cancelled) setLines([]);
      });
    return () => {
      cancelled = true;
    };
  }, [items]);

  const addItem = useCallback((variantId: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === variantId ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { variantId, qty }];
    });
    setDrawerOpen(true);
  }, []);

  const setQty = useCallback((variantId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) => (i.variantId === variantId ? { ...i, qty } : i))
    );
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const subtotalCents = useMemo(() => cartSubtotalCents(lines), [lines]);

  const value: CartContextValue = {
    lines,
    count,
    subtotalCents,
    isDrawerOpen,
    discreetPackaging,
    freeShippingThresholdCents,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    addItem,
    setQty,
    removeItem,
    clearCart,
    setDiscreetPackaging: setDiscreetPackagingState,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}

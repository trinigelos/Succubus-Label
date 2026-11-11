"use client";

import { getAdminOrders, type AdminOrder, type AdminOrderFilter } from "@/lib/data/admin";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderRow } from "./OrderRow";
import styles from "./page.module.css";

const TABS: { id: AdminOrderFilter; label: string }[] = [
  { id: "tutti", label: "Tutti" },
  { id: "da-pagare", label: "Da pagare" },
  { id: "da-spedire", label: "Da spedire" },
  { id: "spediti", label: "Spediti" },
];

export function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const filter = (searchParams.get("filtro") || "tutti") as AdminOrderFilter;

  const [orders, setOrders] = useState<AdminOrder[]>([]);

  function reload() {
    getAdminOrders(filter)
      .then(setOrders)
      .catch(() => {});
  }

  useEffect(reload, [filter]);

  return (
    <div>
      <h1 className={styles.title}>Ordini</h1>

      <div className={styles.tabs} role="group" aria-label="Filtra ordini">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === "tutti" ? "/admin/ordini" : `/admin/ordini?filtro=${tab.id}`}
            aria-pressed={filter === tab.id}
            className={`${styles.tab} ${filter === tab.id ? styles.tabActive : ""}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className={styles.list}>
        {orders.length === 0 ? (
          <p className={styles.empty}>Nessun ordine qui.</p>
        ) : (
          orders.map((order, i) => (
            <OrderRow
              key={order.id}
              order={order}
              defaultOpen={i === 0}
              onChanged={reload}
            />
          ))
        )}
      </div>
    </div>
  );
}

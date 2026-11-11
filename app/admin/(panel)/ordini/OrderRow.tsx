"use client";

import type { AdminOrder } from "@/lib/data/admin";
import { markOrderPaid, markOrderShipped } from "@/lib/data/admin-mutations";
import { formatCents } from "@/lib/format";
import { useState } from "react";
import styles from "./OrderRow.module.css";

const SHIPPING_LABELS: Record<string, string> = {
  standard: "Standard 24/48h",
  express: "Express",
  europe: "Europa",
};

const PAYMENT_LABELS: Record<string, string> = {
  paypal: "PayPal",
  bonifico: "Bonifico",
  whatsapp: "WhatsApp",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending_payment: { label: "Da pagare", className: styles.badgePay },
  paid: { label: "Da spedire", className: styles.badgeShip },
  shipped: { label: "Spedito", className: styles.badgeDone },
  cancelled: { label: "Annullato", className: styles.badgeDone },
  refunded: { label: "Rimborsato", className: styles.badgeDone },
};

export function OrderRow({
  order,
  defaultOpen,
  onChanged,
}: {
  order: AdminOrder;
  defaultOpen: boolean;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [tracking, setTracking] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const badge = STATUS_BADGE[order.status];
  const itemsCount = order.order_items.reduce((n, i) => n + i.qty, 0);
  const lines = order.order_items
    .map((i) => `${i.name_snapshot} — ${i.size_snapshot} × ${i.qty}`)
    .join("\n");

  async function markPaid() {
    setSaving(true);
    setError(null);
    try {
      await markOrderPaid(order.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto.");
    }
    setSaving(false);
  }

  async function markShipped() {
    if (!tracking.trim()) {
      setError("Il numero di tracking è obbligatorio.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await markOrderShipped(order.id, tracking);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto.");
    }
    setSaving(false);
  }

  return (
    <article className={styles.article}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.num}>#{order.number}</span>
        <span className={styles.customer}>
          {order.shipping_address.fullName}
          <span className={styles.customerMeta}>
            {new Date(order.created_at).toLocaleDateString("it-IT")} ·{" "}
            {itemsCount} {itemsCount === 1 ? "articolo" : "articoli"}
          </span>
        </span>
        <span className={styles.pay}>
          {PAYMENT_LABELS[order.payment_method] ?? order.payment_method}
        </span>
        {badge ? (
          <span className={`${styles.badge} ${badge.className}`}>
            {badge.label}
          </span>
        ) : null}
        <span aria-hidden="true" className={styles.sign}>
          {open ? "−" : "+"}
        </span>
      </button>

      {open ? (
        <div className={styles.body}>
          <div className={styles.col}>
            <span className={styles.colLabel}>Spedire a</span>
            <span>{order.shipping_address.fullName}</span>
            <span className={styles.muted}>
              {order.shipping_address.line1}
              {order.shipping_address.line2
                ? `, ${order.shipping_address.line2}`
                : ""}
              , {order.shipping_address.postalCode} {order.shipping_address.city}
            </span>
            {order.phone ? (
              <span className={styles.muted}>{order.phone}</span>
            ) : null}
            {order.discreet_packaging ? (
              <span className={styles.discreetBadge}>Imballo discreto</span>
            ) : null}
          </div>

          <div className={styles.col}>
            <span className={styles.colLabel}>Articoli</span>
            <span className={styles.lines}>{lines}</span>
            <span className={styles.muted}>
              Totale {formatCents(order.total_cents)} ·{" "}
              {SHIPPING_LABELS[order.shipping_method] ?? order.shipping_method}
            </span>
          </div>

          <div className={styles.actionCol}>
            {order.status === "pending_payment" &&
            (order.payment_method === "bonifico" ||
              order.payment_method === "whatsapp") ? (
              <>
                <p className={styles.note}>
                  {order.payment_method === "bonifico"
                    ? "In attesa del bonifico. Le taglie restano riservate."
                    : "In attesa del pagamento via WhatsApp. Le taglie restano riservate."}
                </p>
                <button
                  type="button"
                  className={styles.actionBtn}
                  disabled={saving}
                  onClick={markPaid}
                >
                  {saving
                    ? "…"
                    : order.payment_method === "bonifico"
                      ? "Bonifico ricevuto"
                      : "Pagamento ricevuto"}
                </button>
              </>
            ) : null}

            {order.status === "paid" ? (
              <>
                <label htmlFor={`tracking-${order.id}`} className={styles.colLabel}>
                  Numero di tracking
                </label>
                <input
                  id={`tracking-${order.id}`}
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.actionBtn}
                  disabled={saving}
                  onClick={markShipped}
                >
                  {saving ? "…" : "Segna come spedito"}
                </button>
                <span className={styles.note}>
                  La cliente riceve un&apos;email con il link di tracking.
                </span>
              </>
            ) : null}

            {order.status === "shipped" ? (
              <p style={{ margin: 0, fontSize: 14 }}>
                Spedito · tracking {order.tracking_code}
              </p>
            ) : null}

            {error ? <p className={styles.errorText}>{error}</p> : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

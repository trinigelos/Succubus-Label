"use client";

import { CopyButton } from "@/components/CopyButton";
import { getOrderForConfirmation, type ConfirmationOrder } from "@/lib/data/orders";
import { formatCents } from "@/lib/format";
import { buildWhatsAppLink, orderWhatsAppMessage } from "@/lib/whatsapp";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const PAYMENT_LABELS: Record<string, string> = {
  paypal: "PayPal",
  bonifico: "Bonifico bancario",
  whatsapp: "WhatsApp",
};

const SHIPPING_LABELS: Record<string, string> = {
  express_it: "Express · Italia",
  express_eu: "Express · Europa",
  hand_re: "Consegna a mano · Reggio Emilia",
};

const STEPS = ["Confermato", "In preparazione", "Spedito", "Consegnato"];

function currentStepIndex(status: string) {
  if (status === "shipped") return 2;
  if (status === "paid") return 1;
  return 0;
}

export function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const numero = searchParams.get("numero");
  const token = searchParams.get("t");

  const [order, setOrder] = useState<ConfirmationOrder | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const orderNumber = Number(numero);
      if (!token || Number.isNaN(orderNumber)) return;
      const result = await getOrderForConfirmation(orderNumber, token);
      if (!cancelled) setOrder(result);
    })().finally(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [numero, token]);

  if (!loaded) return null;

  if (!order) {
    return (
      <main className={styles.main}>
        <p>Ordine non trovato.</p>
        <Link href="/shop">Torna allo shop</Link>
      </main>
    );
  }

  const step = currentStepIndex(order.status);

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <span>SUCCUBUS</span>
            <span>LABEL</span>
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.intro}>
            <span className={styles.kicker}>Ordine n° {order.number}</span>
            <h1 className={styles.title}>
              <span>Grazie.</span>
              <span className={styles.titleImpact}>È TUO.</span>
            </h1>
            <p className={styles.introText}>
              Il tuo ordine è registrato con l&apos;email{" "}
              <span style={{ color: "var(--text)" }}>{order.email}</span>.
            </p>
          </div>

          <ol aria-label="Stato dell'ordine" className={styles.steps}>
            {STEPS.map((label, i) => (
              <li key={label} className={styles.step}>
                <span
                  className={`${styles.stepBar} ${i <= step ? styles.stepBarOn : ""}`}
                />
                <span
                  className={`${styles.stepLabel} ${i <= step ? styles.stepLabelOn : ""}`}
                >
                  {label}
                </span>
              </li>
            ))}
          </ol>

          <div className={styles.details}>
            <div className={styles.detailCol}>
              <span className={styles.detailLabel}>Spedizione</span>
              <span>
                {SHIPPING_LABELS[order.shippingMethod] ?? order.shippingMethod}
              </span>
              {order.discreetPackaging ? (
                <span className={styles.muted}>Imballo discreto</span>
              ) : null}
              {order.trackingCode ? (
                <span className={styles.muted}>
                  Tracking: {order.trackingCode}
                </span>
              ) : null}
            </div>
            <div className={styles.detailCol}>
              <span className={styles.detailLabel}>Indirizzo</span>
              <span>{order.shippingAddress.fullName}</span>
              <span className={styles.muted}>
                {order.shippingAddress.line1}, {order.shippingAddress.postalCode}{" "}
                {order.shippingAddress.city}
              </span>
            </div>
            <div className={styles.detailCol}>
              <span className={styles.detailLabel}>Pagamento</span>
              <span>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
            </div>
          </div>

          {order.paymentMethod === "whatsapp" &&
          order.status === "pending_payment" ? (
            <div className={styles.bankCard}>
              <h2 className={styles.bankTitle}>Continua su WhatsApp</h2>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)" }}>
                Le taglie sono riservate. Scrivici per ricevere il link per
                pagare {formatCents(order.totalCents)}.
              </p>
              <a
                href={buildWhatsAppLink(
                  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
                  orderWhatsAppMessage(order.number, order.totalCents)
                )}
                className={styles.copyBtn}
                style={{ alignSelf: "flex-start" }}
              >
                Apri WhatsApp
              </a>
            </div>
          ) : null}

          {order.paymentMethod === "bonifico" &&
          order.status === "pending_payment" ? (
            <div className={styles.bankCard}>
              <h2 className={styles.bankTitle}>Dati per il bonifico</h2>
              <div className={styles.bankRow}>
                <span className={styles.bankLabel}>IBAN</span>
                <span>{process.env.NEXT_PUBLIC_IBAN ?? "—"}</span>
                <CopyButton
                  value={process.env.NEXT_PUBLIC_IBAN ?? ""}
                  className={styles.copyBtn}
                />
              </div>
              <div className={styles.bankRow}>
                <span className={styles.bankLabel}>Intestatario</span>
                <span>{process.env.NEXT_PUBLIC_IBAN_HOLDER ?? "—"}</span>
              </div>
              <div className={styles.bankRow}>
                <span className={styles.bankLabel}>Importo</span>
                <span>{formatCents(order.totalCents)}</span>
              </div>
              <div className={styles.bankRow}>
                <span className={styles.bankLabel}>Causale</span>
                <span>Ordine #{order.number}</span>
                <CopyButton
                  value={`Ordine #${order.number}`}
                  className={styles.copyBtn}
                />
              </div>
            </div>
          ) : null}

          <div className={styles.igCard}>
            <span className={styles.igText}>
              <span className={styles.igTitle}>Diventa una ragazza Succubus</span>
              <span className={styles.igSub}>
                Taggaci quando lo indossi: ti ripostiamo.
              </span>
            </span>
            <a href="https://www.instagram.com/succubus.label_17.10/">
              @succubus.label_17.10 →
            </a>
          </div>
        </div>

        <aside aria-label="Riepilogo ordine" className={styles.summary}>
          <h2 className={styles.summaryTitle}>Riepilogo</h2>
          {order.items.map((item, i) => (
            <div key={i} className={styles.summaryItem}>
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.name}
                  width={64}
                  style={{ aspectRatio: "4 / 5", objectFit: "cover" }}
                />
              ) : null}
              <span className={styles.summaryItemText}>
                <span>{item.name}</span>
                <span className={styles.summaryItemMeta}>
                  Taglia {item.size} · {item.qty} pz
                </span>
              </span>
              <span>{formatCents(item.unitPriceCents * item.qty)}</span>
            </div>
          ))}
          <div className={styles.summaryTotal}>
            <span className={styles.summaryTotalLabel}>Totale pagato</span>
            <span className={styles.summaryTotalValue}>
              {formatCents(order.totalCents)}
            </span>
          </div>
          <Link href="/shop" className={styles.shopBtn}>
            Torna allo shop
          </Link>
        </aside>
      </main>
    </div>
  );
}

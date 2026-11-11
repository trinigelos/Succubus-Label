"use client";

import { useCart } from "@/lib/cart/CartContext";
import { CheckoutError, reserveOrder } from "@/lib/checkout";
import { formatCents } from "@/lib/format";
import { computeOrderTotals, type ShippingRates } from "@/lib/pricing";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "@/app/checkout/page.module.css";

const SHIPPING_OPTIONS: {
  id: "standard" | "express" | "europe";
  title: string;
  sub: string;
}[] = [
  { id: "standard", title: "Standard · 24/48h", sub: "Corriere — Italia" },
  { id: "express", title: "Express", sub: "Corriere — consegna il giorno dopo" },
  { id: "europe", title: "Europa", sub: "Corriere — 3/5 giorni lavorativi" },
];

const COUNTRIES = [
  { code: "IT", name: "Italia" },
  { code: "FR", name: "Francia" },
  { code: "DE", name: "Germania" },
  { code: "ES", name: "Spagna" },
  { code: "AT", name: "Austria" },
];

type PaymentMethod = "whatsapp" | "bonifico";

export function CheckoutForm({
  shippingRates,
  freeShippingThresholdCents,
  bankTransferReserveDays,
}: {
  shippingRates: ShippingRates;
  freeShippingThresholdCents: number | null;
  bankTransferReserveDays: number;
}) {
  const router = useRouter();
  const { lines, subtotalCents, discreetPackaging, clearCart } = useCart();

  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [via, setVia] = useState("");
  const [interno, setInterno] = useState("");
  const [cap, setCap] = useState("");
  const [citta, setCitta] = useState("");
  const [provincia, setProvincia] = useState("");
  const [paese, setPaese] = useState("IT");
  const [telefono, setTelefono] = useState("");
  const [shippingMethod, setShippingMethod] =
    useState<(typeof SHIPPING_OPTIONS)[number]["id"]>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("whatsapp");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { shippingCents, totalCents } = useMemo(
    () =>
      computeOrderTotals({
        subtotalCents,
        shippingMethod,
        shippingRates,
        freeShippingThresholdCents,
      }),
    [shippingRates, shippingMethod, subtotalCents, freeShippingThresholdCents]
  );

  function validate(): string | null {
    if (!email.includes("@")) return "Inserisci un'email valida.";
    if (!nome || !cognome) return "Inserisci nome e cognome.";
    if (!via) return "Inserisci l'indirizzo.";
    if (!cap) return "Inserisci il CAP.";
    if (!citta) return "Inserisci la città.";
    if (!acceptedTerms) return "Devi accettare i termini e la privacy.";
    if (lines.length === 0) return "Il carrello è vuoto.";
    return null;
  }

  function buildInput() {
    return {
      email,
      phone: telefono || undefined,
      shippingAddress: {
        fullName: `${nome} ${cognome}`.trim(),
        line1: via,
        line2: interno || undefined,
        postalCode: cap,
        city: citta,
        state: provincia || undefined,
        countryCode: paese,
      },
      shippingMethod,
      paymentMethod,
      discreetPackaging,
      items: lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
      acceptedTerms,
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const reservation = await reserveOrder(buildInput());
      clearCart();
      router.push(`/ordine?numero=${reservation.number}&t=${reservation.token}`);
    } catch (err) {
      setError(
        err instanceof CheckoutError ? err.message : "Qualcosa è andato storto. Riprova."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <p>
        Il carrello è vuoto. <Link href="/shop">Vai alla lingerie</Link>.
      </p>
    );
  }

  return (
    <>
      <form className={styles.form} onSubmit={submit}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>1. Contatto</legend>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className={styles.fieldsetGrid}>
          <legend className={styles.legend}>2. Indirizzo di spedizione</legend>
          <div className={styles.field}>
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              autoComplete="given-name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="cognome">Cognome</label>
            <input
              id="cognome"
              autoComplete="family-name"
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
            />
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label htmlFor="via">Indirizzo e numero civico</label>
            <input
              id="via"
              autoComplete="address-line1"
              value={via}
              onChange={(e) => setVia(e.target.value)}
            />
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label htmlFor="interno">
              Scala, interno, citofono (facoltativo)
            </label>
            <input
              id="interno"
              autoComplete="address-line2"
              value={interno}
              onChange={(e) => setInterno(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="cap">CAP</label>
            <input
              id="cap"
              inputMode="numeric"
              autoComplete="postal-code"
              value={cap}
              onChange={(e) => setCap(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="citta">Città</label>
            <input
              id="citta"
              autoComplete="address-level2"
              value={citta}
              onChange={(e) => setCitta(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="prov">Provincia</label>
            <input
              id="prov"
              autoComplete="address-level1"
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="paese">Paese</label>
            <select
              id="paese"
              autoComplete="country"
              value={paese}
              onChange={(e) => setPaese(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label htmlFor="tel">Telefono (solo per il corriere)</label>
            <input
              id="tel"
              type="tel"
              autoComplete="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>3. Spedizione</legend>
          {SHIPPING_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className={`${styles.radioOption} ${shippingMethod === opt.id ? styles.radioOptionOn : ""}`}
            >
              <input
                type="radio"
                name="spedizione"
                checked={shippingMethod === opt.id}
                onChange={() => setShippingMethod(opt.id)}
              />
              <span className={styles.radioText}>
                <span className={styles.radioTitle}>{opt.title}</span>
                <span className={styles.radioSub}>{opt.sub}</span>
              </span>
              <span>
                {shippingCents === 0
                  ? "Gratis"
                  : formatCents(shippingRates[opt.id] ?? 0)}
              </span>
            </label>
          ))}
          <p className={styles.helpText}>
            Ogni pacco parte in imballo neutro, senza logo all&apos;esterno.
          </p>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>4. Pagamento</legend>
          <div
            className={`${styles.paymentBox} ${paymentMethod === "whatsapp" ? styles.paymentBoxOn : ""}`}
          >
            <label className={styles.paymentLabel}>
              <input
                type="radio"
                name="pagamento"
                checked={paymentMethod === "whatsapp"}
                onChange={() => setPaymentMethod("whatsapp")}
              />
              <span>WhatsApp</span>
            </label>
            {paymentMethod === "whatsapp" ? (
              <p className={styles.paymentNote}>
                Confermiamo l&apos;ordine e ti scriviamo su WhatsApp con il
                link per pagare. Le taglie restano riservate per{" "}
                {bankTransferReserveDays} giorni.
              </p>
            ) : null}
          </div>
          <div
            className={`${styles.paymentBox} ${paymentMethod === "bonifico" ? styles.paymentBoxOn : ""}`}
          >
            <label className={styles.paymentLabel}>
              <input
                type="radio"
                name="pagamento"
                checked={paymentMethod === "bonifico"}
                onChange={() => setPaymentMethod("bonifico")}
              />
              <span>Bonifico bancario</span>
            </label>
            {paymentMethod === "bonifico" ? (
              <p className={styles.paymentNote}>
                Ricevi IBAN e causale via email. Spediamo appena arriva il
                pagamento; le taglie restano riservate per{" "}
                {bankTransferReserveDays} giorni.
              </p>
            ) : null}
          </div>
        </fieldset>

        <div className={styles.terms}>
          <label className={styles.termsCheck}>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <span>
              Accetto i <Link href="/termini">Termini di vendita</Link> e ho
              letto l&apos;<Link href="/privacy">Informativa privacy</Link>.
            </span>
          </label>

          {error ? (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          ) : null}

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? "…" : `Conferma ordine · ${formatCents(totalCents)}`}
          </button>
        </div>
      </form>

      <aside aria-label="Riepilogo ordine" className={styles.summary}>
        <h2 className={styles.summaryTitle}>Il tuo ordine</h2>
        {lines.map((line) => (
          <div key={line.variantId} className={styles.summaryItem}>
            {line.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={line.image} alt={line.productName} />
            ) : null}
            <span className={styles.summaryItemText}>
              <span>{line.productName}</span>
              <span className={styles.summaryItemMeta}>
                Taglia {line.size} · {line.qty} pz
              </span>
            </span>
            <span>{formatCents(line.priceCents * line.qty)}</span>
          </div>
        ))}
        <div className={styles.summaryTotals}>
          <div className={styles.summaryRow}>
            <span>Subtotale</span>
            <span>{formatCents(subtotalCents)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>
              Spedizione ·{" "}
              {SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)?.title}
            </span>
            <span>
              {shippingCents === 0 ? "Gratis" : formatCents(shippingCents)}
            </span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryMuted}`}>
            <span>Imballo discreto</span>
            <span>{discreetPackaging ? "Incluso" : "Non richiesto"}</span>
          </div>
        </div>
        <div className={styles.summaryTotal}>
          <span className={styles.summaryTotalLabel}>Totale</span>
          <span className={styles.summaryTotalValue}>
            <span>{formatCents(totalCents)}</span>
            <span>IVA inclusa</span>
          </span>
        </div>
      </aside>
    </>
  );
}

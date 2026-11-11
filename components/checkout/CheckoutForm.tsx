"use client";

import { useCart } from "@/lib/cart/CartContext";
import { CheckoutError, reserveOrder } from "@/lib/checkout";
import { formatCents } from "@/lib/format";
import { computeOrderTotals, type ShippingMethod, type ShippingRates } from "@/lib/pricing";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import styles from "@/app/checkout/page.module.css";

const SHIPPING_TITLES: Record<ShippingMethod, { title: string; sub: string }> = {
  express_it: { title: "Express · Italia", sub: "Corriere — consegna il giorno dopo" },
  express_eu: { title: "Express · Europa", sub: "Corriere — 3/5 giorni lavorativi" },
  hand_re: {
    title: "Consegna a mano · Reggio Emilia",
    sub: "Giorno e luogo si accordano su WhatsApp",
  },
};

const COUNTRIES = [
  { code: "IT", name: "Italia" },
  { code: "FR", name: "Francia" },
  { code: "DE", name: "Germania" },
  { code: "ES", name: "Spagna" },
  { code: "AT", name: "Austria" },
];

export function CheckoutForm({
  shippingRates,
  freeShippingThresholdCents,
  bankTransferReserveDays,
  handDeliveryCaps,
}: {
  shippingRates: ShippingRates;
  freeShippingThresholdCents: number | null;
  bankTransferReserveDays: number;
  handDeliveryCaps: string[];
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
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("express_it");
  const paymentMethod = "whatsapp" as const;
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const handDeliveryAvailable = paese === "IT" && handDeliveryCaps.includes(cap.trim());
  const availableShippingMethods: ShippingMethod[] = useMemo(() => {
    const methods: ShippingMethod[] = [paese === "IT" ? "express_it" : "express_eu"];
    if (handDeliveryAvailable) methods.push("hand_re");
    return methods;
  }, [paese, handDeliveryAvailable]);

  // Falls back to the first available method when the chosen one stops
  // being offered (e.g. the country changes, or the CAP no longer
  // qualifies for hand delivery), without needing an effect for it.
  const effectiveShippingMethod = availableShippingMethods.includes(shippingMethod)
    ? shippingMethod
    : availableShippingMethods[0];

  const { shippingCents, totalCents } = useMemo(
    () =>
      computeOrderTotals({
        subtotalCents,
        shippingMethod: effectiveShippingMethod,
        shippingRates,
        freeShippingThresholdCents,
      }),
    [shippingRates, effectiveShippingMethod, subtotalCents, freeShippingThresholdCents]
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
      shippingMethod: effectiveShippingMethod,
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
          {availableShippingMethods.map((method) => {
            const opt = SHIPPING_TITLES[method];
            const rate = shippingRates[method] ?? 0;
            return (
              <label
                key={method}
                className={`${styles.radioOption} ${effectiveShippingMethod === method ? styles.radioOptionOn : ""}`}
              >
                <input
                  type="radio"
                  name="spedizione"
                  checked={effectiveShippingMethod === method}
                  onChange={() => setShippingMethod(method)}
                />
                <span className={styles.radioText}>
                  <span className={styles.radioTitle}>{opt.title}</span>
                  <span className={styles.radioSub}>{opt.sub}</span>
                </span>
                <span>
                  {method === effectiveShippingMethod && shippingCents === 0
                    ? "Gratis"
                    : rate === 0
                      ? "Gratis"
                      : formatCents(rate)}
                </span>
              </label>
            );
          })}
          <p className={styles.helpText}>
            Spedizione sempre Express, in imballo neutro senza logo
            all&apos;esterno.
            {paese === "IT" && !handDeliveryAvailable
              ? " La consegna a mano a Reggio Emilia è disponibile solo per alcuni CAP."
              : ""}
          </p>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>4. Pagamento</legend>
          <div className={`${styles.paymentBox} ${styles.paymentBoxOn}`}>
            <span className={styles.paymentLabel}>
              <span>WhatsApp</span>
            </span>
            <p className={styles.paymentNote}>
              Confermiamo l&apos;ordine e ti scriviamo su WhatsApp con il link
              per pagare. Le taglie restano riservate per{" "}
              {bankTransferReserveDays} giorni.
            </p>
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
        <button
          type="button"
          className={styles.summaryToggle}
          aria-expanded={summaryOpen}
          onClick={() => setSummaryOpen((v) => !v)}
        >
          <span>
            {summaryOpen ? "Nascondi riepilogo" : "Mostra riepilogo"} ·{" "}
            {formatCents(totalCents)}
          </span>
          <span aria-hidden="true">{summaryOpen ? "−" : "+"}</span>
        </button>
        <div
          className={`${styles.summaryCollapsible} ${summaryOpen ? styles.summaryCollapsibleOpen : ""}`}
        >
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
                Spedizione · {SHIPPING_TITLES[effectiveShippingMethod].title}
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

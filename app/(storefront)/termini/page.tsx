import type { Metadata } from "next";
import { TextPage } from "@/components/TextPage";
import styles from "@/components/TextPage.module.css";

export const metadata: Metadata = {
  title: "Termini e condizioni",
  description: "Termini e condizioni di vendita di Succubus Label.",
};

export default function TerminiPage() {
  return (
    <TextPage
      kicker="Legale"
      title="Termini e condizioni"
      intro="Questa pagina sarà sostituita da termini di vendita redatti con un consulente legale. Il testo seguente è un contenuto provvisorio."
    >
      <section>
        <h2>Il venditore</h2>
        <p className={styles.pending}>
          Ragione sociale, P.IVA e indirizzo del venditore — in attesa.
        </p>
      </section>
      <section>
        <h2>Prezzi e pagamento</h2>
        <p>
          I prezzi sono indicati in euro e comprendono l&apos;IVA.
          Confermiamo l&apos;ordine e il pagamento via WhatsApp; l&apos;ordine
          viene preparato solo dopo la ricezione dell&apos;importo.
        </p>
      </section>
      <section>
        <h2>Spedizione e consegna</h2>
        <p>
          Consulta la pagina <a href="/spedizioni-resi">Spedizioni e resi</a>{" "}
          per tempi, costi e diritto di recesso.
        </p>
      </section>
      <section>
        <h2>Legge applicabile</h2>
        <p className={styles.pending}>
          Legge applicabile e foro competente — in attesa di validazione
          legale.
        </p>
      </section>
    </TextPage>
  );
}

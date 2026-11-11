import type { Metadata } from "next";
import { TextPage } from "@/components/TextPage";
import styles from "@/components/TextPage.module.css";

export const metadata: Metadata = {
  title: "Spedizioni e resi",
  description:
    "Tempi di spedizione, imballo discreto e politica di resi di Succubus Label.",
};

export default function SpedizioniResiPage() {
  return (
    <TextPage kicker="Aiuto" title="Spedizioni e resi">
      <section>
        <h2>Spedizioni</h2>
        <p>
          Ogni ordine parte impacchettato a mano, in un imballo neutro: senza
          logo né descrizione del contenuto all&apos;esterno. Tempi standard
          24/48h in Italia; sono disponibili anche la spedizione Express e
          quella in Europa.
        </p>
        <p className={styles.pending}>
          Corriere, costi esatti e soglia di spedizione gratuita — in attesa
          dei dati definitivi.
        </p>
      </section>
      <section>
        <h2>Imballo discreto</h2>
        <p>
          Al checkout puoi lasciare attiva la casella &ldquo;Imballo
          discreto&rdquo;, selezionata di default: il pacco non riporta il
          nome del negozio né il contenuto.
        </p>
      </section>
      <section>
        <h2>Diritto di recesso</h2>
        <p>
          Hai 14 giorni dalla consegna per restituire il prodotto. Per motivi
          di igiene, i capi di lingerie possono essere restituiti solo se il
          sigillo o l&apos;etichetta igienica sono ancora intatti e non
          rimossi.
        </p>
      </section>
      <section>
        <h2>Come restituire un ordine</h2>
        <p className={styles.pending}>
          Procedura e indirizzo di reso — in attesa della politica di resi
          definitiva.
        </p>
      </section>
    </TextPage>
  );
}

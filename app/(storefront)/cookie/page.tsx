import type { Metadata } from "next";
import { TextPage } from "@/components/TextPage";
import styles from "@/components/TextPage.module.css";

export const metadata: Metadata = {
  title: "Cookie",
  description: "Informativa sui cookie di Succubus Label.",
};

export default function CookiePage() {
  return (
    <TextPage
      kicker="Legale"
      title="Cookie"
      intro="Questa pagina sarà sostituita da un'informativa sui cookie redatta con un consulente legale. Il testo seguente è un contenuto provvisorio."
    >
      <section>
        <h2>Cookie tecnici</h2>
        <p>
          Usati per far funzionare il sito e il carrello: sempre attivi, non
          richiedono consenso.
        </p>
      </section>
      <section>
        <h2>Cookie di analisi e marketing</h2>
        <p>
          Vengono caricati solo dopo il tuo consenso esplicito, tramite il
          banner mostrato alla prima visita. Puoi cambiare scelta in
          qualsiasi momento.
        </p>
      </section>
      <section>
        <h2>Elenco dei cookie</h2>
        <p className={styles.pending}>
          Elenco dettagliato di cookie, finalità e durata — in attesa
          dell&apos;attivazione degli strumenti di analisi.
        </p>
      </section>
    </TextPage>
  );
}

import type { Metadata } from "next";
import { TextPage } from "@/components/TextPage";
import styles from "@/components/TextPage.module.css";

export const metadata: Metadata = {
  title: "Guida alle taglie",
  description:
    "Come scegliere la taglia giusta per la lingerie Succubus Label.",
};

export default function GuidaTagliePage() {
  return (
    <TextPage
      kicker="Aiuto"
      title="Guida alle taglie"
      intro="Le taglie vanno da XS a XL, più Taglia unica per alcuni accessori. In caso di dubbio, scegli la taglia più grande tra le due."
    >
      <section>
        <h2>Tabella delle misure</h2>
        <p className={styles.pending}>
          Tabella con le misure in centimetri per ogni taglia — in attesa dei
          dati definitivi.
        </p>
      </section>
      <section>
        <h2>Come misurarsi</h2>
        <p>
          Seno: misura il punto più prominente del seno, con il reggiseno
          indosso. Vita: misura il punto più stretto, di solito sopra
          l&apos;ombelico. Fianchi: misura il punto più largo.
        </p>
      </section>
      <section>
        <h2>Serve ancora aiuto?</h2>
        <p>
          Scrivi a <span className={styles.pending}>[email]</span> con la
          tua taglia abituale: ti rispondo io.
        </p>
      </section>
    </TextPage>
  );
}

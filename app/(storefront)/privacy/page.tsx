import type { Metadata } from "next";
import { TextPage } from "@/components/TextPage";
import styles from "@/components/TextPage.module.css";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Informativa sulla privacy di Succubus Label.",
};

export default function PrivacyPage() {
  return (
    <TextPage
      kicker="Legale"
      title="Privacy"
      intro="Questa pagina sarà sostituita da un'informativa redatta con un consulente legale, conforme al GDPR. Il testo seguente è un contenuto provvisorio."
    >
      <section>
        <h2>Titolare del trattamento</h2>
        <p className={styles.pending}>
          Ragione sociale, indirizzo e contatti del titolare — in attesa.
        </p>
      </section>
      <section>
        <h2>Dati raccolti</h2>
        <p>
          Dati di contatto e di spedizione forniti al checkout, dati
          dell&apos;account del pannello amministrativo e dati tecnici di
          navigazione.
        </p>
      </section>
      <section>
        <h2>Finalità e base giuridica</h2>
        <p className={styles.pending}>
          Finalità del trattamento (evasione ordini, assistenza,
          newsletter) e relativa base giuridica — in attesa di validazione
          legale.
        </p>
      </section>
      <section>
        <h2>Diritti dell&apos;interessata</h2>
        <p className={styles.pending}>
          Diritti di accesso, rettifica, cancellazione e contatto del DPO —
          in attesa.
        </p>
      </section>
    </TextPage>
  );
}

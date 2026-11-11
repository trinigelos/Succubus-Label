import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer id="contatti" className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={`${styles.col} ${styles.brandCol}`}>
            <span className={styles.logoMain}>SUCCUBUS</span>
            <span className={styles.logoSub}>LABEL</span>
            <span className={styles.claim}>Intimates &amp; noir aesthetics</span>
          </div>
          <div className={styles.col}>
            <span className={styles.colTitle}>Shop</span>
            <Link href="/shop">Lingerie</Link>
            <Link href="/shop?categoria=harness">Harness</Link>
            <Link href="/#daytoday">Day to day</Link>
          </div>
          <div className={styles.col}>
            <span className={styles.colTitle}>Aiuto</span>
            <Link href="/guida-taglie">Guida alle taglie</Link>
            <Link href="/spedizioni-resi">Spedizioni e resi</Link>
            <Link href="/termini">Termini</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/cookie">Cookie</Link>
          </div>
          <div className={styles.col}>
            <span className={styles.colTitle}>Contatti</span>
            <span>[email]</span>
            <a href="https://www.instagram.com/succubus.label_17.10/">
              Instagram
            </a>
            <span>[Vinted]</span>
          </div>
        </div>
        <p className={styles.legal}>
          © 2026 Succubus Label — The black label of lingerie
        </p>
        <p className={styles.legalLine}>
          [Ragione sociale] · P.IVA [in attesa] · [indirizzo]
        </p>
      </div>
    </footer>
  );
}

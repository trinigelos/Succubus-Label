import Link from "next/link";
import { CartTrigger } from "./CartTrigger";
import styles from "./Header.module.css";

export function Header() {
  return (
    <>
      <div className={styles.announcement}>
        Spedizioni 24/48h · Day to day in arrivo presto
      </div>
      <header className={styles.header}>
        <nav aria-label="Principale" className={styles.nav}>
          <div className={styles.links}>
            <Link href="/shop">Lingerie</Link>
            <Link href="/#daytoday">Day to day</Link>
            <Link href="/shop?categoria=harness">Harness</Link>
          </div>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMain}>SUCCUBUS</span>
            <span className={styles.logoSub}>LABEL</span>
          </Link>
          <div className={styles.links}>
            <Link href="/#chi">Chi sono</Link>
            <Link href="/#contatti">Contatti</Link>
            <CartTrigger />
          </div>
        </nav>
      </header>
    </>
  );
}

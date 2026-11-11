"use client";

import Link from "next/link";
import { useState } from "react";
import { CartTrigger } from "./CartTrigger";
import styles from "./Header.module.css";
import { MenuPanel } from "./MenuPanel";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className={styles.announcement}>
        Spedizione sempre Express · Day to day in arrivo presto
      </div>
      <header className={styles.header}>
        <div className={styles.nav}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={menuOpen}
            aria-controls="menu-panel"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden="true">☰</span>
            <span className={styles.menuBtnLabel}>Menu</span>
          </button>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMain}>SUCCUBUS</span>
            <span className={styles.logoSub}>LABEL</span>
          </Link>
          <div className={styles.right}>
            <CartTrigger />
          </div>
        </div>
      </header>
      <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

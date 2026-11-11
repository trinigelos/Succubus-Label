"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./MenuPanel.module.css";

const GRANDI = [
  { href: "/shop", label: "Lingerie" },
  { href: "/#daytoday", label: "Day to day", tag: "Presto" },
  { href: "/outlet", label: "Outlet", tag: "Sale" },
  { href: "/#chi", label: "Chi sono" },
];

const CATEGORIE = [
  { href: "/shop?categoria=set", label: "Set" },
  { href: "/shop?categoria=harness", label: "Harness" },
  { href: "/shop?categoria=body", label: "Body" },
  { href: "/shop?categoria=reggiseni", label: "Reggiseni" },
  { href: "/shop?categoria=accessori", label: "Accessori" },
];

const AIUTO = [
  { href: "/guida-taglie", label: "Guida alle taglie" },
  { href: "/spedizioni-resi", label: "Spedizioni e resi" },
  { href: "/#contatti", label: "Contatti" },
  {
    href: "https://www.instagram.com/succubus.label_17.10/",
    label: "Instagram",
    external: true,
  },
];

export function MenuPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const firstOpen = useRef(open);

  useEffect(() => {
    if (firstOpen.current) {
      firstOpen.current = false;
      return;
    }
    onClose();
    // Closes the panel on every client-side navigation (CAMBIOS §1).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    focusable?.[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Chiudi il menu"
        className={styles.overlay}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        id="menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={styles.panel}
      >
        <nav className={styles.columns}>
          <div className={styles.column}>
            <span className={styles.columnTitle}>Succubus Label</span>
            {GRANDI.map((item) => (
              <Link key={item.href} href={item.href} className={styles.bigLink}>
                {item.label}
                {item.tag ? <span className={styles.tag}>{item.tag}</span> : null}
              </Link>
            ))}
          </div>
          <div className={styles.column}>
            <span className={styles.columnTitle}>Categorie</span>
            {CATEGORIE.map((item) => (
              <Link key={item.href} href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className={styles.column}>
            <span className={styles.columnTitle}>Aiuto</span>
            {AIUTO.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.link}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              )
            )}
          </div>
        </nav>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          Chiudi ✕
        </button>
      </div>
    </>
  );
}

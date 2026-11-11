"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./layout.module.css";

const LINKS = [
  { href: "/admin", label: "Prodotti" },
  { href: "/admin/ordini", label: "Ordini" },
];

export function AdminNav({ ordersBadge }: { ordersBadge: number }) {
  const pathname = usePathname();

  return (
    <div className={styles.links}>
      {LINKS.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.link} ${active ? styles.linkActive : ""}`}
          >
            {link.label}
            {link.href === "/admin/ordini" && ordersBadge > 0 ? (
              <span className={styles.badge}>{ordersBadge}</span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

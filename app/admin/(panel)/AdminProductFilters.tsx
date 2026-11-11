"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";

const TABS: { id: string; label: string }[] = [
  { id: "tutti", label: "Tutti" },
  { id: "pubblicati", label: "Pubblicati" },
  { id: "bozze", label: "Bozze" },
  { id: "esauriti", label: "Esauriti" },
];

export function AdminProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filtro") ?? "tutti";
  const search = searchParams.get("q") ?? "";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className={styles.filters}>
      <div className={styles.tabs} role="group" aria-label="Filtra prodotti">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={filter === tab.id}
            className={`${styles.tab} ${filter === tab.id ? styles.tabActive : ""}`}
            onClick={() => update("filtro", tab.id === "tutti" ? "" : tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <label className={styles.search}>
        <span>Cerca</span>
        <input
          type="search"
          placeholder="Nome del prodotto"
          defaultValue={search}
          onChange={(e) => update("q", e.target.value)}
        />
      </label>
    </div>
  );
}

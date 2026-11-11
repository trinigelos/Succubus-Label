"use client";

import type { Category } from "@/lib/types";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./ShopFilters.module.css";

const SIZES = ["XS", "S", "M", "L", "XL"];

export function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoria = searchParams.get("categoria") ?? "";
  const taglia = searchParams.get("taglia") ?? "";
  const ordina = searchParams.get("ordina") ?? "novita";

  function chipHref(slug: string) {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set("categoria", slug);
    else params.delete("categoria");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className={styles.bar}>
      <div className={styles.chips} role="group" aria-label="Categoria">
        <Link
          href={chipHref("")}
          className={`${styles.chip} ${categoria === "" ? styles.chipActive : ""}`}
          aria-pressed={categoria === ""}
        >
          Tutto
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={chipHref(c.slug)}
            className={`${styles.chip} ${categoria === c.slug ? styles.chipActive : ""}`}
            aria-pressed={categoria === c.slug}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className={styles.selects}>
        <label className={styles.selectLabel}>
          Taglia
          <select
            value={taglia}
            onChange={(e) => updateParam("taglia", e.target.value)}
          >
            <option value="">Tutte</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.selectLabel}>
          Ordina
          <select
            value={ordina}
            onChange={(e) => updateParam("ordina", e.target.value)}
          >
            <option value="novita">Novità</option>
            <option value="prezzo-asc">Prezzo crescente</option>
            <option value="prezzo-desc">Prezzo decrescente</option>
          </select>
        </label>
      </div>
    </div>
  );
}

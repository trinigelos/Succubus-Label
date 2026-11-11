"use client";

import { CategorySelect } from "@/app/admin/(panel)/CategorySelect";
import formStyles from "@/app/admin/(panel)/ProductForm.module.css";
import { createProduct } from "@/lib/data/admin-mutations";
import type { Category } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewProductForm({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useRouter();
  const [categories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [line, setLine] = useState<"lingerie" | "day-to-day">("lingerie");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Il nome è obbligatorio.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { id } = await createProduct({
        name: name.trim(),
        line,
        categoryId: categoryId || null,
        priceCents: Math.round(Number(price.replace(",", ".")) * 100) || 0,
      });
      router.push(`/admin/prodotti/modifica?id=${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className={formStyles.topRow}>
        <div>
          <Link href="/admin" className={formStyles.back}>
            ← Prodotti
          </Link>
          <h1 className={formStyles.title}>Nuovo prodotto</h1>
        </div>
      </div>

      {error ? <p className={formStyles.errorBanner}>{error}</p> : null}

      <form
        onSubmit={submit}
        className={formStyles.section}
        style={{ maxWidth: 520 }}
      >
        <div className={formStyles.field}>
          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className={formStyles.fieldGrid}>
          <div className={formStyles.field}>
            <label htmlFor="linea">Linea</label>
            <select
              id="linea"
              value={line}
              onChange={(e) => setLine(e.target.value as typeof line)}
            >
              <option value="lingerie">Lingerie</option>
              <option value="day-to-day">Day to day</option>
            </select>
          </div>
          <CategorySelect
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            line={line}
          />
          <div className={formStyles.field}>
            <label htmlFor="prezzo">Prezzo (€, IVA incl.)</label>
            <input
              id="prezzo"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0,00"
            />
          </div>
        </div>
        <button
          type="submit"
          className={formStyles.publishBtn}
          style={{ alignSelf: "flex-start" }}
          disabled={saving}
        >
          {saving ? "…" : "Continua → foto, taglie e dettagli"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { createCategory as createCategoryMutation } from "@/lib/data/admin-mutations";
import type { Category } from "@/lib/types";
import { useState } from "react";
import styles from "./CategorySelect.module.css";

export function CategorySelect({
  categories,
  value,
  onChange,
  line,
}: {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  line: "lingerie" | "day-to-day";
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  async function createCategory() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const category = await createCategoryMutation(newName.trim(), line);
      categories.push(category);
      onChange(category.id);
      setCreating(false);
      setNewName("");
    } catch {
      // ignore: the admin can just try again
    } finally {
      setSaving(false);
    }
  }

  if (creating) {
    return (
      <div className={styles.wrap}>
        <label>Nuova categoria</label>
        <div className={styles.newRow}>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome categoria"
          />
          <button type="button" onClick={createCategory} disabled={saving}>
            {saving ? "…" : "Crea"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <label htmlFor="cat">Categoria</label>
      <select
        id="cat"
        value={value}
        onChange={(e) => {
          if (e.target.value === "__new__") setCreating(true);
          else onChange(e.target.value);
        }}
      >
        <option value="">Nessuna</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
        <option value="__new__">+ Nuova categoria…</option>
      </select>
    </div>
  );
}

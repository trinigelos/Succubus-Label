"use client";

import { CategorySelect } from "@/app/admin/(panel)/CategorySelect";
import formStyles from "@/app/admin/(panel)/ProductForm.module.css";
import {
  deleteOrArchiveProduct,
  deleteProductImage,
  reorderProductImages,
  replaceVariants,
  setRelatedProducts,
  updateProduct,
  uploadProductImages,
} from "@/lib/data/admin-mutations";
import { CARE_TAGS } from "@/lib/care-tags";
import { imageUrl, productLabel } from "@/lib/data/product-helpers";
import { formatCents } from "@/lib/format";
import type { Category, Product, ProductImage } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const SIZES = ["XS", "S", "M", "L", "XL"] as const;

type SizeState = { active: boolean; stock: number };

function initialSizes(product: Product): Record<string, SizeState> {
  const map: Record<string, SizeState> = {};
  for (const size of SIZES) {
    const v = product.variants.find((v) => v.size === size);
    map[size] = { active: v?.active ?? false, stock: v?.stock ?? 0 };
  }
  return map;
}

export function ProductEditForm({
  product,
  initialCategories,
  otherProducts,
  initialRelatedIds,
}: {
  product: Product;
  initialCategories: Category[];
  otherProducts: Product[];
  initialRelatedIds: string[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories] = useState(initialCategories);
  const [images, setImages] = useState<ProductImage[]>(product.product_images);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [line, setLine] = useState<"lingerie" | "day-to-day">(product.line);
  const [categoryId, setCategoryId] = useState(product.category_id ?? "");
  const [price, setPrice] = useState((product.price_cents / 100).toFixed(2));
  const [compareAt, setCompareAt] = useState(
    product.compare_at_cents ? (product.compare_at_cents / 100).toFixed(2) : ""
  );
  const [materials, setMaterials] = useState(product.materials ?? "");
  const [careTags, setCareTags] = useState<string[]>(product.care_tags ?? []);
  const [careNote, setCareNote] = useState(product.care_note ?? "");
  const [isOutlet, setIsOutlet] = useState(product.is_outlet ?? false);
  const [collection, setCollection] = useState(product.collection ?? "");
  const [relatedIds, setRelatedIds] = useState<string[]>(initialRelatedIds);

  function toggleCareTag(tag: string) {
    setCareTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  const hasUnica = product.variants.some((v) => v.size === "Unica");
  const [uniqueMode, setUniqueMode] = useState(hasUnica);
  const [sizes, setSizes] = useState<Record<string, SizeState>>(initialSizes(product));
  const [uniqueState, setUniqueState] = useState<SizeState>(() => {
    const v = product.variants.find((v) => v.size === "Unica");
    return { active: v?.active ?? true, stock: v?.stock ?? 0 };
  });

  const [status, setStatus] = useState(product.status);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalPieces = uniqueMode
    ? uniqueState.active
      ? uniqueState.stock
      : 0
    : Object.values(sizes).reduce((n, s) => (s.active ? n + s.stock : n), 0);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      const startPosition =
        images.length > 0 ? Math.max(...images.map((i) => i.position)) + 1 : 0;
      const newImages = await uploadProductImages(
        product.slug,
        product.id,
        Array.from(files),
        startPosition
      );
      setImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Caricamento foto non riuscito.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function removeImage(imageId: string) {
    setImages((prev) => prev.filter((i) => i.id !== imageId));
    await deleteProductImage(imageId);
  }

  async function moveImage(index: number, direction: -1 | 1) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    await reorderProductImages(next.map((i) => i.id));
  }

  function toggleRelated(id: string) {
    setRelatedIds((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  async function save(status: "draft" | "published") {
    setSaving(status === "draft" ? "draft" : "publish");
    setError(null);
    setMessage(null);
    try {
      const variants = uniqueMode
        ? [{ size: "Unica", stock: uniqueState.stock, active: uniqueState.active }]
        : SIZES.map((size) => ({
            size,
            stock: sizes[size].stock,
            active: sizes[size].active,
          }));

      await updateProduct(product.id, {
        name,
        description,
        line,
        category_id: categoryId || null,
        price_cents: Math.round(Number(price.replace(",", ".")) * 100) || 0,
        compare_at_cents: compareAt
          ? Math.round(Number(compareAt.replace(",", ".")) * 100)
          : null,
        materials,
        care_tags: careTags,
        care_note: careNote || null,
        is_outlet: isOutlet,
        collection: collection.trim() || null,
        status,
      });
      await replaceVariants(product.id, variants);
      await setRelatedProducts(product.id, relatedIds);

      setStatus(status);
      setMessage(
        status === "published"
          ? "Pubblicato. È già visibile nel negozio."
          : "Bozza salvata. Non è visibile nel negozio."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Qualcosa è andato storto.");
    } finally {
      setSaving(null);
    }
  }

  async function deleteProduct() {
    if (
      !confirm(
        `Eliminare "${name}"? Sparisce dal negozio e non si può recuperare.`
      )
    ) {
      return;
    }
    await deleteOrArchiveProduct(product.id);
    router.push("/admin");
  }

  const cover = images[0];
  const previewLabel =
    totalPieces === 0 ? "Esaurito" : totalPieces <= 3 ? "Ultimi pezzi" : productLabel(product) === "nuovo" ? "Nuovo" : "";
  const previewSizes = uniqueMode
    ? uniqueState.active && uniqueState.stock > 0
      ? "Taglia unica"
      : "Nessuna taglia disponibile"
    : SIZES.filter((s) => sizes[s].active && sizes[s].stock > 0).join(" · ") ||
      "Nessuna taglia disponibile";

  return (
    <div>
      <div className={formStyles.topRow}>
        <div>
          <Link href="/admin" className={formStyles.back}>
            ← Prodotti
          </Link>
          <h1 className={formStyles.title}>{name || "Prodotto"}</h1>
        </div>
        <div className={formStyles.actions}>
          <button
            type="button"
            className={formStyles.draftBtn}
            disabled={saving !== null}
            onClick={() => save("draft")}
          >
            {saving === "draft" ? "…" : "Salva bozza"}
          </button>
          <button
            type="button"
            className={formStyles.publishBtn}
            disabled={saving !== null}
            onClick={() => save("published")}
          >
            {saving === "publish" ? "…" : "Pubblica"}
          </button>
        </div>
      </div>

      {message ? <p className={formStyles.savedBanner}>{message}</p> : null}
      {error ? <p className={formStyles.errorBanner}>{error}</p> : null}

      <div className={formStyles.layout}>
        <div className={formStyles.formCol}>
          <section className={formStyles.section}>
            <h2 className={formStyles.sectionTitle}>Foto</h2>
            <div className={formStyles.photoGrid}>
              {images.map((img, i) => (
                <div key={img.id} className={formStyles.photoItem}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl(img.path)} alt={`Foto ${i + 1}`} />
                  {i === 0 ? (
                    <span className={formStyles.coverBadge}>Copertina</span>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Rimuovi foto ${i + 1}`}
                    className={formStyles.photoRemove}
                    onClick={() => removeImage(img.id)}
                  >
                    ×
                  </button>
                  <span className={`${formStyles.photoMove} ${formStyles.photoMoveLeft}`}>
                    <button
                      type="button"
                      aria-label="Sposta a sinistra"
                      disabled={i === 0}
                      onClick={() => moveImage(i, -1)}
                    >
                      ‹
                    </button>
                  </span>
                  <span className={`${formStyles.photoMove} ${formStyles.photoMoveRight}`}>
                    <button
                      type="button"
                      aria-label="Sposta a destra"
                      disabled={i === images.length - 1}
                      onClick={() => moveImage(i, 1)}
                    >
                      ›
                    </button>
                  </span>
                </div>
              ))}
              <label className={formStyles.photoAdd}>
                <span aria-hidden="true" style={{ fontSize: 26, lineHeight: 1 }}>
                  +
                </span>
                <span>{uploading ? "Caricamento…" : "Aggiungi foto"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/heic,image/webp"
                  multiple
                  disabled={uploading}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      uploadFiles(e.target.files);
                    }
                  }}
                />
              </label>
            </div>
            <p className={formStyles.hint}>
              La prima è la copertina. Usa le frecce per cambiare l&apos;ordine.
              Formato verticale 4:5, fino a 15&nbsp;MB.
            </p>
          </section>

          <section className={formStyles.section}>
            <h2 className={formStyles.sectionTitle}>Informazioni</h2>
            <div className={formStyles.field}>
              <label htmlFor="nome">Nome</label>
              <input id="nome" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className={formStyles.field}>
              <label htmlFor="descr">Descrizione</label>
              <textarea
                id="descr"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                />
              </div>
              <div className={formStyles.field}>
                <label htmlFor="sconto">Prezzo scontato (facoltativo)</label>
                <input
                  id="sconto"
                  inputMode="decimal"
                  value={compareAt}
                  onChange={(e) => setCompareAt(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className={formStyles.section}>
            <div className={formStyles.sizesHeader}>
              <h2 className={formStyles.sectionTitle}>Taglie e stock</h2>
              <span className={formStyles.sizesTotal}>Totale: {totalPieces} pezzi</span>
            </div>

            {uniqueMode ? (
              <div className={formStyles.sizeRow}>
                <label className={formStyles.sizeCheck}>
                  <input
                    type="checkbox"
                    checked={uniqueState.active}
                    onChange={(e) =>
                      setUniqueState((s) => ({ ...s, active: e.target.checked }))
                    }
                  />
                  <span>Taglia unica</span>
                </label>
                {uniqueState.active ? (
                  <div className={formStyles.sizeStepper}>
                    {uniqueState.stock === 0 ? (
                      <span className={formStyles.sizeWarn}>Esaurita</span>
                    ) : uniqueState.stock <= 2 ? (
                      <span className={formStyles.sizeWarn}>Quasi finita</span>
                    ) : null}
                    <div className={formStyles.stepper}>
                      <button
                        type="button"
                        aria-label="Meno"
                        onClick={() =>
                          setUniqueState((s) => ({
                            ...s,
                            stock: Math.max(0, s.stock - 1),
                          }))
                        }
                      >
                        −
                      </button>
                      <span aria-live="polite">{uniqueState.stock}</span>
                      <button
                        type="button"
                        aria-label="Più"
                        onClick={() =>
                          setUniqueState((s) => ({ ...s, stock: s.stock + 1 }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              SIZES.map((size) => (
                <div key={size} className={formStyles.sizeRow}>
                  <label className={formStyles.sizeCheck}>
                    <input
                      type="checkbox"
                      checked={sizes[size].active}
                      onChange={(e) =>
                        setSizes((s) => ({
                          ...s,
                          [size]: { ...s[size], active: e.target.checked },
                        }))
                      }
                    />
                    <span>{size}</span>
                  </label>
                  {sizes[size].active ? (
                    <div className={formStyles.sizeStepper}>
                      {sizes[size].stock === 0 ? (
                        <span className={formStyles.sizeWarn}>Esaurita</span>
                      ) : sizes[size].stock <= 2 ? (
                        <span className={formStyles.sizeWarn}>Quasi finita</span>
                      ) : null}
                      <div className={formStyles.stepper}>
                        <button
                          type="button"
                          aria-label="Meno"
                          onClick={() =>
                            setSizes((s) => ({
                              ...s,
                              [size]: {
                                ...s[size],
                                stock: Math.max(0, s[size].stock - 1),
                              },
                            }))
                          }
                        >
                          −
                        </button>
                        <span aria-live="polite">{sizes[size].stock}</span>
                        <button
                          type="button"
                          aria-label="Più"
                          onClick={() =>
                            setSizes((s) => ({
                              ...s,
                              [size]: { ...s[size], stock: s[size].stock + 1 },
                            }))
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            )}

            <label className={formStyles.uniqueRow}>
              <input
                type="checkbox"
                checked={uniqueMode}
                onChange={(e) => setUniqueMode(e.target.checked)}
              />
              <span>Taglia unica (accessori)</span>
            </label>
          </section>

          <section className={formStyles.section}>
            <h2 className={formStyles.sectionTitle}>Outlet</h2>
            <label className={formStyles.uniqueRow}>
              <input
                type="checkbox"
                checked={isOutlet}
                onChange={(e) => setIsOutlet(e.target.checked)}
              />
              <span>Metti in Outlet</span>
            </label>
            {isOutlet ? (
              <>
                <p className={formStyles.hint}>
                  Serve un prezzo scontato (sopra) più basso del prezzo pieno.
                  Non compare in /shop, solo in /outlet.
                </p>
                <div className={formStyles.field}>
                  <label htmlFor="collezione">Collezione</label>
                  <input
                    id="collezione"
                    placeholder="Es. Collezione inverno 2025"
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                  />
                </div>
              </>
            ) : null}
          </section>

          <section className={formStyles.section}>
            <h2 className={formStyles.sectionTitle}>Dettagli</h2>
            <div className={formStyles.field}>
              <label htmlFor="mat">Materiali</label>
              <input
                id="mat"
                placeholder="Es. ecopelle, rete elastica"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
              />
            </div>
            <div className={formStyles.field}>
              <label>Istruzioni di lavaggio</label>
              <div className={formStyles.lookGrid}>
                {CARE_TAGS.map((tag) => (
                  <label key={tag} className={formStyles.lookOption}>
                    <input
                      type="checkbox"
                      checked={careTags.includes(tag)}
                      onChange={() => toggleCareTag(tag)}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className={formStyles.field}>
              <label htmlFor="cura-nota">Nota di cura (facoltativa)</label>
              <input
                id="cura-nota"
                placeholder="Es. non esporre a fonti di calore dirette"
                value={careNote}
                onChange={(e) => setCareNote(e.target.value)}
              />
            </div>
            <div className={formStyles.field}>
              <label>Completa il look (fino a 4 prodotti)</label>
              <div className={formStyles.lookGrid}>
                {otherProducts.map((p) => (
                  <label key={p.id} className={formStyles.lookOption}>
                    <input
                      type="checkbox"
                      checked={relatedIds.includes(p.id)}
                      onChange={() => toggleRelated(p.id)}
                    />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <button type="button" className={formStyles.deleteBtn} onClick={deleteProduct}>
            Elimina prodotto
          </button>
        </div>

        <aside aria-label="Anteprima nel negozio" className={formStyles.preview}>
          <span className={formStyles.previewLabel}>Anteprima nel negozio</span>
          <div className={formStyles.previewImageWrap}>
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl(cover.path)} alt="" />
            ) : (
              <div style={{ aspectRatio: "4 / 5", background: "var(--panel-active)" }} />
            )}
            {previewLabel ? (
              <span className={formStyles.previewBadge}>{previewLabel}</span>
            ) : null}
          </div>
          <div className={formStyles.previewRow}>
            <span>{name}</span>
            <span>{formatCents(Math.round(Number(price.replace(",", ".")) * 100) || 0)}</span>
          </div>
          <span className={formStyles.previewSizes}>{previewSizes}</span>
          <div className={formStyles.previewStatus}>
            <span>Stato</span>
            <span>
              {status === "published" ? "Pubblicato" : "Bozza (non visibile)"}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

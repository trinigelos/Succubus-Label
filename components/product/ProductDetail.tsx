"use client";

import { useCart } from "@/lib/cart/CartContext";
import { imageUrl, productLabel } from "@/lib/data/product-helpers";
import { formatCents } from "@/lib/format";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./ProductDetail.module.css";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  const images = product.product_images;
  const label = productLabel(product);
  const selected = product.variants.find((v) => v.id === sizeId);
  const outOfStockSize = product.variants.find((v) => v.stock === 0);

  function handleAdd() {
    if (!selected) {
      setError(true);
      setAdded(false);
      return;
    }
    addItem(selected.id, 1);
    setAdded(true);
    setError(false);
    openDrawer();
  }

  const panels = [
    { id: "dettagli", title: "Dettagli e materiali", body: product.materials },
    { id: "cura", title: "Cura del capo", body: product.care },
  ].filter((p) => p.body);

  return (
    <>
      <div className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.thumbs} role="group" aria-label="Foto del prodotto">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                aria-label={`Foto ${i + 1}`}
                className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ""}`}
                onClick={() => setActiveImage(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl(img.path)} alt="" />
              </button>
            ))}
          </div>
          <div className={styles.mainImage}>
            {images[activeImage] ? (
              <Image
                src={imageUrl(images[activeImage].path)}
                alt={images[activeImage].alt || product.name}
                width={800}
                height={1000}
                priority
              />
            ) : null}
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.headline}>
            <span className={styles.kicker}>
              {product.categories?.name}
              {label === "nuovo" ? " · Nuovo" : ""}
            </span>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.price}>{formatCents(product.price_cents)}</p>
            <p className={styles.vat}>IVA inclusa.</p>
          </div>

          {product.description ? (
            <p className={styles.description}>{product.description}</p>
          ) : null}

          <div className={styles.sizesBlock}>
            <div className={styles.sizesHeader}>
              <span id="taglia-label">
                Taglia{selected ? `: ${selected.size}` : ""}
              </span>
              <Link href="/guida-taglie">Guida alle taglie</Link>
            </div>
            <div
              role="radiogroup"
              aria-labelledby="taglia-label"
              className={styles.sizesRow}
            >
              {product.variants.map((v) => {
                const out = !v.active || v.stock === 0;
                const on = sizeId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={out ? `${v.size}, esaurita` : v.size}
                    disabled={out}
                    className={`${styles.sizeBtn} ${on ? styles.sizeBtnOn : ""} ${out ? styles.sizeBtnOut : ""}`}
                    onClick={() => {
                      setSizeId(v.id);
                      setError(false);
                      setAdded(false);
                    }}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
            {error ? (
              <p role="alert" className={styles.error}>
                Scegli una taglia per continuare.
              </p>
            ) : null}
            {outOfStockSize ? (
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                {outOfStockSize.size} esaurita
              </p>
            ) : null}
          </div>

          <div className={styles.addBlock}>
            <button type="button" className={styles.addBtn} onClick={handleAdd}>
              Aggiungi al carrello
            </button>
            {added && selected ? (
              <div role="status" className={styles.addedBox}>
                <span>
                  Aggiunto: {product.name}, taglia {selected.size}
                </span>
                <span className={styles.addedLinks}>
                  <Link href="/shop">Continua</Link>
                  <Link href="/carrello">Vai al carrello →</Link>
                </span>
              </div>
            ) : null}
            <ul className={styles.bullets}>
              <li>— Spedizione 24/48h in imballo discreto</li>
              <li>— Pagamento sicuro con PayPal (anche con carta) o bonifico</li>
              <li>
                — Per igiene, l&apos;intimo si restituisce solo con la
                protezione intatta
              </li>
            </ul>
          </div>

          {panels.length > 0 ? (
            <div className={styles.accordion}>
              {panels.map((p) => (
                <div key={p.id} className={styles.panel}>
                  <button
                    type="button"
                    className={styles.panelBtn}
                    aria-expanded={openPanel === p.id}
                    onClick={() =>
                      setOpenPanel(openPanel === p.id ? null : p.id)
                    }
                  >
                    <span>{p.title}</span>
                    <span aria-hidden="true">
                      {openPanel === p.id ? "−" : "+"}
                    </span>
                  </button>
                  {openPanel === p.id ? (
                    <p className={styles.panelBody}>{p.body}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.mobileBar}>
        <span>{formatCents(product.price_cents)}</span>
        <button type="button" className={styles.mobileBarBtn} onClick={handleAdd}>
          Aggiungi
        </button>
      </div>
    </>
  );
}

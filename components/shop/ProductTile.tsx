import { imageUrl, productCover } from "@/lib/data/product-helpers";
import { formatCents } from "@/lib/format";
import type { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProductTile.module.css";

export function ProductTile({ product }: { product: Product }) {
  const cover = productCover(product);
  return (
    <Link href={`/prodotto?slug=${product.slug}`} className={styles.tile}>
      {cover ? (
        <Image
          src={imageUrl(cover.path)}
          alt={cover.alt || product.name}
          width={520}
          height={650}
          className={styles.image}
        />
      ) : (
        <div className={styles.image} />
      )}
      <span className={styles.row}>
        <span>{product.name}</span>
        <span>{formatCents(product.price_cents)}</span>
      </span>
    </Link>
  );
}

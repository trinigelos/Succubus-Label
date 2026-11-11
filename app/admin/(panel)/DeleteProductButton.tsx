"use client";

import { deleteOrArchiveProduct } from "@/lib/data/admin-mutations";
import { useState } from "react";
import styles from "./DeleteProductButton.module.css";

export function DeleteProductButton({
  productId,
  productName,
  onDeleted,
}: {
  productId: string;
  productName: string;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
      >
        Elimina
      </button>
      {open ? (
        <div className={styles.overlay}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="del-title"
            className={styles.dialog}
          >
            <h2 id="del-title" className={styles.dialogTitle}>
              Eliminare &ldquo;{productName}&rdquo;?
            </h2>
            <p className={styles.dialogText}>
              Sparisce dal negozio e non si può recuperare. Se vuoi solo
              nasconderlo, mettilo in Bozza.
            </p>
            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setOpen(false)}
              >
                Annulla
              </button>
              <button
                type="button"
                className={styles.confirmBtn}
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await deleteOrArchiveProduct(productId);
                    setOpen(false);
                    onDeleted();
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? "…" : "Elimina"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

import { CartPageContent } from "@/components/cart/CartPageContent";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Carrello",
};

export default function CarrelloPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Il tuo carrello</h1>
      <CartPageContent />
    </main>
  );
}

import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Accedi",
};

export default function AdminLoginPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.logo}>
        <span>SUCCUBUS</span>
        <span>LABEL</span>
      </div>
      <LoginForm />
    </div>
  );
}

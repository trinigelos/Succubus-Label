import type { ReactNode } from "react";
import styles from "./TextPage.module.css";

export function TextPage({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main className={styles.main}>
      <span className={styles.kicker}>{kicker}</span>
      <h1 className={styles.title}>{title}</h1>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
      <div className={styles.body}>{children}</div>
    </main>
  );
}

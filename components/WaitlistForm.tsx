"use client";

import { joinWaitlist } from "@/lib/data/waitlist";
import { useState, useTransition } from "react";
import styles from "./WaitlistForm.module.css";

export function WaitlistForm({
  list,
  label,
  buttonLabel = "Avvisami",
  className,
  inputClassName,
  buttonClassName,
}: {
  list: string;
  label: string;
  buttonLabel?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (status === "done") {
    return <p className={className}>Fatto — ti scrivo appena disponibile.</p>;
  }

  return (
    <form
      className={`${styles.form} ${className ?? ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await joinWaitlist(list, email);
          if (result.ok) {
            setStatus("done");
          } else {
            setStatus("error");
            setMessage(result.error);
          }
        });
      }}
    >
      <label>
        <span className="sr-only">{label}</span>
        <input
          type="email"
          required
          placeholder="nome@email.it"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${styles.input} ${inputClassName ?? ""}`}
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className={`${styles.button} ${buttonClassName ?? ""}`}
      >
        {isPending ? "…" : buttonLabel}
      </button>
      {status === "error" ? (
        <p role="alert" style={{ color: "var(--error)", fontSize: 12 }}>
          {message}
        </p>
      ) : null}
    </form>
  );
}

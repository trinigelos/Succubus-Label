"use client";

import { useState } from "react";

export function CopyButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // clipboard no disponible: el valor queda visible para copiar a mano
        }
      }}
    >
      {copied ? "Copiato ✓" : "Copia"}
    </button>
  );
}

const euro = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

export function formatCents(cents: number) {
  return euro.format(cents / 100);
}

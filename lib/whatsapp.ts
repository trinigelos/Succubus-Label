import { formatCents } from "@/lib/format";

export function buildWhatsAppLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function orderWhatsAppMessage(orderNumber: number, totalCents: number) {
  return `Ciao! Ho appena fatto l'ordine #${orderNumber} su Succubus Label (totale ${formatCents(
    totalCents
  )}). Mi mandi il link per pagare?`;
}

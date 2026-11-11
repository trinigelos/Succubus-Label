import { formatCents } from "@/lib/format";
import { buildWhatsAppLink, orderWhatsAppMessage } from "@/lib/whatsapp";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

export function OrderReceivedWhatsAppEmail({
  orderNumber,
  totalCents,
  whatsappNumber,
}: {
  orderNumber: number;
  totalCents: number;
  whatsappNumber: string;
}) {
  const waLink = buildWhatsAppLink(
    whatsappNumber,
    orderWhatsAppMessage(orderNumber, totalCents)
  );

  return (
    <EmailLayout previewText={`Ordine #${orderNumber} ricevuto — continua su WhatsApp`}>
      <Text style={{ fontSize: 20, margin: "0 0 20px" }}>
        Ordine #{orderNumber} ricevuto.
      </Text>
      <Text>
        Le taglie sono riservate. Scrivici su WhatsApp per ricevere il link
        per pagare {formatCents(totalCents)}.
      </Text>
      <Button
        href={waLink}
        style={{
          background: "#f2f0ed",
          color: "#000000",
          padding: "14px 24px",
          fontSize: 13,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginTop: 16,
        }}
      >
        Continua su WhatsApp
      </Button>
    </EmailLayout>
  );
}

export default OrderReceivedWhatsAppEmail;

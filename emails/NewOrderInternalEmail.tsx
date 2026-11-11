import { formatCents } from "@/lib/format";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

export function NewOrderInternalEmail({
  orderNumber,
  customerEmail,
  totalCents,
  paymentMethod,
  shopUrl,
}: {
  orderNumber: number;
  customerEmail: string;
  totalCents: number;
  paymentMethod: "paypal" | "bonifico" | "whatsapp";
  shopUrl: string;
}) {
  const paymentLabel = {
    paypal: "PayPal",
    bonifico: "Bonifico bancario",
    whatsapp: "WhatsApp (pagamento manuale)",
  }[paymentMethod];

  return (
    <EmailLayout previewText={`Nuovo ordine #${orderNumber}`}>
      <Text style={{ fontSize: 20, margin: "0 0 20px" }}>
        Nuovo ordine #{orderNumber}
      </Text>
      <Text>Cliente: {customerEmail}</Text>
      <Text>Totale: {formatCents(totalCents)}</Text>
      <Text>Pagamento: {paymentLabel}</Text>
      <Button
        href={`${shopUrl}/admin/ordini`}
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
        Apri il pannello
      </Button>
    </EmailLayout>
  );
}

export default NewOrderInternalEmail;

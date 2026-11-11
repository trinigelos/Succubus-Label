import { formatCents } from "@/lib/format";
import { Button, Hr, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

export function OrderConfirmedEmail({
  orderNumber,
  token,
  items,
  totalCents,
  shopUrl,
}: {
  orderNumber: number;
  token: string;
  items: { name: string; size: string; qty: number }[];
  totalCents: number;
  shopUrl: string;
}) {
  const orderUrl = `${shopUrl}/ordine/${orderNumber}?t=${token}`;

  return (
    <EmailLayout previewText={`Il tuo ordine #${orderNumber} è confermato.`}>
      <Text style={{ fontSize: 20, margin: "0 0 4px" }}>Grazie.</Text>
      <Text style={{ fontSize: 15, margin: "0 0 20px" }}>È tuo.</Text>
      <Text>
        Il tuo ordine <strong>#{orderNumber}</strong> è confermato.
      </Text>
      <Hr style={{ borderColor: "#1e1e1e" }} />
      {items.map((item, i) => (
        <Text key={i} style={{ margin: "0 0 4px" }}>
          {item.name} — {item.size} × {item.qty}
        </Text>
      ))}
      <Hr style={{ borderColor: "#1e1e1e" }} />
      <Text>
        Totale: <strong>{formatCents(totalCents)}</strong>
      </Text>
      <Button
        href={orderUrl}
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
        Vedi il tuo ordine
      </Button>
      <Text style={{ fontSize: 13, color: "#a6a29c", marginTop: 20 }}>
        Quando il pacco parte ricevi un&apos;altra email con il link per
        seguirlo.
      </Text>
    </EmailLayout>
  );
}

export default OrderConfirmedEmail;

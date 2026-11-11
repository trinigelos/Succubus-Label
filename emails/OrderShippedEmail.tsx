import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

export function OrderShippedEmail({
  orderNumber,
  token,
  trackingCode,
  shopUrl,
}: {
  orderNumber: number;
  token: string;
  trackingCode: string;
  shopUrl: string;
}) {
  const orderUrl = `${shopUrl}/ordine/${orderNumber}?t=${token}`;

  return (
    <EmailLayout previewText={`Il tuo ordine #${orderNumber} è partito.`}>
      <Text style={{ fontSize: 20, margin: "0 0 20px" }}>
        Il tuo ordine è partito.
      </Text>
      <Text>
        Ordine <strong>#{orderNumber}</strong>, numero di tracking:{" "}
        <strong>{trackingCode}</strong>.
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
    </EmailLayout>
  );
}

export default OrderShippedEmail;

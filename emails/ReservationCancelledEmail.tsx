import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

export function ReservationCancelledEmail({
  orderNumber,
  shopUrl,
}: {
  orderNumber: number;
  shopUrl: string;
}) {
  return (
    <EmailLayout previewText={`L'ordine #${orderNumber} è stato annullato.`}>
      <Text style={{ fontSize: 20, margin: "0 0 20px" }}>
        Ordine #{orderNumber} annullato.
      </Text>
      <Text>
        Non abbiamo ricevuto il bonifico in tempo, così le taglie sono
        tornate disponibili per altre clienti.
      </Text>
      <Text>Se vuoi ancora quei pezzi, puoi rifare l&apos;ordine.</Text>
      <Button
        href={`${shopUrl}/shop`}
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
        Vai alla lingerie
      </Button>
    </EmailLayout>
  );
}

export default ReservationCancelledEmail;

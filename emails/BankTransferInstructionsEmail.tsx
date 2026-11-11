import { formatCents } from "@/lib/format";
import { Hr, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

export function BankTransferInstructionsEmail({
  orderNumber,
  totalCents,
  iban,
  ibanHolder,
  reserveDays,
}: {
  orderNumber: number;
  totalCents: number;
  iban: string;
  ibanHolder: string;
  reserveDays: number;
}) {
  return (
    <EmailLayout previewText={`Dati per il bonifico — ordine #${orderNumber}`}>
      <Text style={{ fontSize: 20, margin: "0 0 20px" }}>
        Ordine #{orderNumber} ricevuto.
      </Text>
      <Text>
        Le taglie sono riservate per {reserveDays}{" "}
        {reserveDays === 1 ? "giorno" : "giorni"}. Appena arriva il bonifico,
        confermiamo l&apos;ordine e lo prepariamo.
      </Text>
      <Hr style={{ borderColor: "#1e1e1e" }} />
      <Text style={{ margin: "0 0 4px", color: "#a6a29c", fontSize: 12 }}>
        IBAN
      </Text>
      <Text style={{ margin: "0 0 16px", fontSize: 16 }}>{iban}</Text>
      <Text style={{ margin: "0 0 4px", color: "#a6a29c", fontSize: 12 }}>
        Intestatario
      </Text>
      <Text style={{ margin: "0 0 16px" }}>{ibanHolder}</Text>
      <Text style={{ margin: "0 0 4px", color: "#a6a29c", fontSize: 12 }}>
        Importo
      </Text>
      <Text style={{ margin: "0 0 16px", fontSize: 16 }}>
        {formatCents(totalCents)}
      </Text>
      <Text style={{ margin: "0 0 4px", color: "#a6a29c", fontSize: 12 }}>
        Causale
      </Text>
      <Text style={{ margin: 0, fontSize: 16 }}>Ordine #{orderNumber}</Text>
    </EmailLayout>
  );
}

export default BankTransferInstructionsEmail;

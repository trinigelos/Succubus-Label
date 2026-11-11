import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

const COLORS = {
  bg: "#000000",
  text: "#f2f0ed",
  muted: "#a6a29c",
  line: "#1e1e1e",
};

export function EmailLayout({
  previewText,
  children,
}: {
  previewText: string;
  children: ReactNode;
}) {
  return (
    <Html lang="it">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: COLORS.bg, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 520, margin: "0 auto", padding: "40px 24px" }}>
          <Text
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 26,
              letterSpacing: "0.06em",
              color: COLORS.text,
              textAlign: "center",
              margin: "0 0 4px",
            }}
          >
            SUCCUBUS
          </Text>
          <Text
            style={{
              fontSize: 10,
              letterSpacing: "0.5em",
              color: COLORS.muted,
              textAlign: "center",
              margin: "0 0 32px",
            }}
          >
            LABEL
          </Text>

          <Section
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontWeight: 300,
              color: COLORS.text,
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            {children}
          </Section>

          <Hr style={{ borderColor: COLORS.line, margin: "32px 0 20px" }} />
          <Text
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 12,
              color: COLORS.muted,
              textAlign: "center",
              margin: 0,
            }}
          >
            Succubus Label — The black label of lingerie
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

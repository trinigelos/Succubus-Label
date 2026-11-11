import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Pannello · Succubus Label",
    template: "%s · Pannello",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

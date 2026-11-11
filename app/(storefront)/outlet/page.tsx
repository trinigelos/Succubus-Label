import type { Metadata } from "next";
import { Suspense } from "react";
import { OutletPageContent } from "./OutletPageContent";

export const metadata: Metadata = {
  title: "Outlet",
  description: "Succubus Label — pezzi delle collezioni precedenti, a prezzo scontato.",
};

export default function OutletPage() {
  return (
    <Suspense fallback={null}>
      <OutletPageContent />
    </Suspense>
  );
}

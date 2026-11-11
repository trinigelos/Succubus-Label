import { Suspense } from "react";
import { CallbackContent } from "./CallbackContent";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}
